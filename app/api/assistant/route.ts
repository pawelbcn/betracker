import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getDateContextString } from '@/utils/dateHelper';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createVerificationMessage(parsedResponse: any): string {
  const delegation = parsedResponse.delegation;
  const expenses = parsedResponse.expenses || [];
  
  let message = `📋 Please verify the delegation details:\n\n`;
  
  if (delegation) {
    message += `**Delegation:**\n`;
    message += `- Title: ${delegation.title}\n`;
    message += `- Destination: ${delegation.destination_country}, ${delegation.destination_city}\n`;
    message += `- Dates: ${delegation.start_date} to ${delegation.end_date}\n`;
    message += `- Purpose: ${delegation.purpose}\n`;
    message += `- Daily Allowance: ${delegation.daily_allowance} PLN\n`;
    message += `- Exchange Rate: ${delegation.exchange_rate}\n\n`;
  }
  
  if (expenses.length > 0) {
    message += `**Expenses:**\n`;
    expenses.forEach((expense: any, index: number) => {
      message += `${index + 1}. ${expense.description} - ${expense.amount} ${expense.currency}\n`;
    });
    message += `\n`;
  }
  
  message += `Is this information correct? Please confirm or provide corrections.`;
  
  return message;
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get current date context
    const dateContext = getDateContextString();

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = '\n\nPrevious conversation:\n';
      conversationHistory.forEach((msg: any) => {
        conversationContext += `${msg.role}: ${msg.content}\n`;
      });
    }

    const systemPrompt = `You are an AI assistant for a delegation expense tracking application. Your role is to help users manage business travel expenses and daily allowances.

Current date context: ${dateContext}

Key features you can help with:
1. Creating new delegations (business trips)
2. Adding expenses to existing delegations
3. Calculating daily allowances
4. Currency conversions (especially to PLN)
5. Expense categorization
6. Generating reports and summaries

When creating delegations, always include:
- Title (descriptive name)
- Destination country and city
- Start and end dates
- Purpose of the trip
- Daily allowance amount
- Exchange rate for the destination currency

When adding expenses, include:
- Description of the expense
- Amount and currency
- Date of the expense
- Category (transportation, accommodation, meals, etc.)

Always be helpful, accurate, and provide clear guidance. If you need to create or update data, respond with structured JSON that can be parsed by the application.

${conversationContext}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';

    // Try to parse JSON response for structured actions
    let parsedResponse = null;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      // Not JSON, treat as regular text response
    }

    // Handle structured responses
    if (parsedResponse && typeof parsedResponse === 'object') {
      if (parsedResponse.action === 'create_delegation') {
        // Create new delegation
        const delegation = await prisma.delegation.create({
          data: {
            id: `delegation_${Date.now()}`,
            title: parsedResponse.delegation.title,
            destination_country: parsedResponse.delegation.destination_country,
            destination_city: parsedResponse.delegation.destination_city,
            start_date: new Date(parsedResponse.delegation.start_date),
            end_date: new Date(parsedResponse.delegation.end_date),
            purpose: parsedResponse.delegation.purpose,
            exchange_rate: parseFloat(parsedResponse.delegation.exchange_rate),
            daily_allowance: parseFloat(parsedResponse.delegation.daily_allowance),
          },
        });

          return NextResponse.json({
          type: 'delegation_created',
          message: `✅ Delegation "${delegation.title}" created successfully!`,
          delegation: delegation,
        });
      }

      if (parsedResponse.action === 'add_expense') {
        // Add expense to delegation
        const expense = await prisma.expense.create({
          data: {
            id: `expense_${Date.now()}`,
            delegation_id: parsedResponse.delegation_id,
            description: parsedResponse.expense.description,
            amount: parseFloat(parsedResponse.expense.amount),
            currency: parsedResponse.expense.currency,
            date: new Date(parsedResponse.expense.date),
            category: parsedResponse.expense.category || 'Other',
          },
        });

          return NextResponse.json({
          type: 'expense_added',
          message: `✅ Expense "${expense.description}" added successfully!`,
          expense: expense,
        });
      }

      if (parsedResponse.action === 'add_both') {
        // Create delegation and add expenses
          const delegation = await prisma.delegation.create({
            data: {
            id: `delegation_${Date.now()}`,
              title: parsedResponse.delegation.title,
              destination_country: parsedResponse.delegation.destination_country,
              destination_city: parsedResponse.delegation.destination_city,
              start_date: new Date(parsedResponse.delegation.start_date),
              end_date: new Date(parsedResponse.delegation.end_date),
              purpose: parsedResponse.delegation.purpose,
            exchange_rate: parseFloat(parsedResponse.delegation.exchange_rate),
            daily_allowance: parseFloat(parsedResponse.delegation.daily_allowance),
          },
          });

        const expenses = [];
        if (parsedResponse.expenses && Array.isArray(parsedResponse.expenses)) {
            for (const expenseData of parsedResponse.expenses) {
            const expense = await prisma.expense.create({
                data: {
                id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  delegation_id: delegation.id,
                description: expenseData.description,
                amount: parseFloat(expenseData.amount),
                currency: expenseData.currency,
                  date: new Date(expenseData.date),
                category: expenseData.category || 'Other',
              },
            });
            expenses.push(expense);
          }
        }

          return NextResponse.json({
          type: 'delegation_and_expenses_created',
          message: `✅ Delegation "${delegation.title}" and ${expenses.length} expenses created successfully!`,
          delegation: delegation,
          expenses: expenses,
        });
      }

      if (parsedResponse.action === 'update_expense') {
        // Update existing expense
        const expense = await prisma.expense.update({
          where: { id: parsedResponse.expense_id },
          data: {
            description: parsedResponse.expense.description,
            amount: parseFloat(parsedResponse.expense.amount),
            currency: parsedResponse.expense.currency,
            date: new Date(parsedResponse.expense.date),
            category: parsedResponse.expense.category,
          },
        });

        return NextResponse.json({
          type: 'expense_updated',
          message: `✅ Expense "${expense.description}" updated successfully!`,
          expense: expense,
        });
      }

      if (parsedResponse.action === 'add_expense_to_delegation') {
        // Add expense to existing delegation
        const expense = await prisma.expense.create({
          data: {
            id: `expense_${Date.now()}`,
            delegation_id: parsedResponse.delegation_id,
            description: parsedResponse.expense.description,
            amount: parseFloat(parsedResponse.expense.amount),
            currency: parsedResponse.expense.currency,
            date: new Date(parsedResponse.expense.date),
            category: parsedResponse.expense.category || 'Other',
          },
        });

        return NextResponse.json({
          type: 'expense_added_to_delegation',
          message: `✅ Expense "${expense.description}" added to delegation successfully!`,
          expense: expense,
        });
      }

      if (parsedResponse.action === 'ask_questions') {
        // Ask clarifying questions
      return NextResponse.json({
          type: 'questions',
          message: parsedResponse.questions,
        });
      }
    }

    // Regular text response
    return NextResponse.json({
      type: 'text',
      message: aiResponse,
    });

  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}
