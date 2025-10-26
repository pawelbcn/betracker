"use client";
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIResponse {
  action: 'add_delegation' | 'add_expense' | 'add_both' | 'ask_questions';
  delegation?: {
    title: string;
    destination_country: string;
    destination_city: string;
    start_date: string;
    end_date: string;
    purpose: string;
    exchange_rate: number;
    daily_allowance: number;
    notes?: string;
  };
  expenses?: Array<{
    date: string;
    category: string;
    amount: number;
    currency: string;
    description: string;
  }>;
  missing_fields?: string[];
  response_message: string;
  questions?: string[];
}

interface AIAssistantProps {
  onAddDelegation: (delegation: any, expenses?: any[]) => void;
  onAddExpense: (expense: any, delegationId?: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistant({ onAddDelegation, onAddExpense, isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your delegation assistant. I can help you add delegations and expenses using natural language. For example, you can say "Add delegation to Prague on October 16th with hotel costs 500 EUR and flight 25 EUR". What would you like to do?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          context: messages.slice(-3).map(m => `${m.type}: ${m.content}`).join('\n')
        }),
      });

      const aiResponse: AIResponse = await response.json();

      // Add AI response message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.response_message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle the AI response based on action
      if (aiResponse.action === 'add_delegation' && aiResponse.delegation) {
        onAddDelegation(aiResponse.delegation);
      } else if (aiResponse.action === 'add_expense' && aiResponse.expenses?.[0]) {
        onAddExpense(aiResponse.expenses[0]);
      } else if (aiResponse.action === 'add_both') {
        if (aiResponse.delegation) {
          // Pass both delegation and expenses data
          onAddDelegation(aiResponse.delegation, aiResponse.expenses);
        }
      }

    } catch (error) {
      console.error('Error calling AI assistant:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl h-[600px] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-neutral-900">AI Delegation Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`px-3 py-2 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 text-neutral-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 flex items-center justify-center bg-neutral-100 text-neutral-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-100 px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-neutral-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your delegation or expense details..."
              className="flex-1 px-3 py-2 border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
