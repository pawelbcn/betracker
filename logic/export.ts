import { jsPDF } from "jspdf";
import { Delegation, Expense, calculateTotalExpensesMultiCurrency, calculateDailyAllowanceAsync, calculateDelegationTimeBreakdown, getExpenseCategoryInfo } from "./rules";
import { getExchangeRateForDate, getLastWorkingDay } from "./exchangeRates";

export async function exportToPDF(delegation: Delegation, expenses: Expense[]): Promise<void> {
  const doc = new jsPDF();
  
  // Format date as YYYY-MM-DD (remove time portion for expense dates)
  const formatDate = (dateString: string): string => {
    // If dateString is already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Otherwise, format from Date object
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Format date with time for delegation dates
  const formatDateWithTime = (date: string, time?: string): string => {
    const formattedDate = formatDate(date);
    if (time && time !== 'null' && time !== 'undefined' && time.trim() !== '') {
      return `${formattedDate} ${time}`;
    }
    return formattedDate;
  };
  
  // Header - Professional delegation report
  doc.setFontSize(20);
  doc.text(`Delegation Report: ${delegation.title}`, 14, 20);
  
  // Delegation details as per knowledgebase v0.2
  doc.setFontSize(12);
  doc.text(`Destination: ${delegation.destination_city}, ${delegation.destination_country}`, 14, 35);
  doc.text(`Dates: ${formatDateWithTime(delegation.start_date, delegation.start_time)} – ${formatDateWithTime(delegation.end_date, delegation.end_time)}`, 14, 42);
  
  // Purpose text - handle UTF-8 encoding properly
  doc.text(`Purpose: ${delegation.purpose}`, 14, 49, { maxWidth: 180 });
  
  doc.text(`Exchange Rate: 1 EUR = ${delegation.exchange_rate} PLN`, 14, 56);
  doc.text(`Daily Allowance Rate: ${delegation.daily_allowance} EUR/day`, 14, 63);
  
  if (delegation.notes) {
    doc.text(`Notes: ${delegation.notes}`, 14, 70);
  }
  
  // Expenses table header
  let y = delegation.notes ? 85 : 78;
  doc.setFontSize(14);
  doc.text("Expenses (as per Polish delegation law):", 14, y);
  y += 10;
  
  // Table headers (removed Deductible column, added exchange rate columns)
  doc.setFontSize(10);
  doc.text("Date", 14, y);
  doc.text("Category", 40, y);
  doc.text("Description", 70, y);
  doc.text("Amount", 115, y);
  doc.text("Rate", 150, y);
  doc.text("Rate Date", 165, y);
  doc.text("PLN Value", 195, y);
  y += 8;
  
  // Draw line under headers
  doc.line(14, y, 200, y);
  y += 5;
  
  // Calculate exchange rates for each expense with rate dates
  const expenseRates = await Promise.all(
    expenses.map(async (expense) => {
      if (expense.currency === 'PLN') {
        return { rate: 1, rateDate: null, convertedAmount: expense.amount };
      }
      try {
        const expenseDate = formatDate(expense.date);
        const expenseDateObj = new Date(expenseDate);
        const lastWorkingDay = getLastWorkingDay(expenseDateObj);
        const rateDate = formatDate(lastWorkingDay.toISOString());
        const rate = await getExchangeRateForDate(expense.currency, expenseDate);
        return { rate, rateDate, convertedAmount: expense.amount * rate };
      } catch (error) {
        // Fallback to delegation exchange rate
        return { rate: delegation.exchange_rate, rateDate: null, convertedAmount: expense.amount * delegation.exchange_rate };
      }
    })
  );
  
  // Expense rows
  expenses.forEach((expense, index) => {
    const { rate, rateDate, convertedAmount } = expenseRates[index];
    
    doc.text(formatDate(expense.date), 14, y);
    doc.text(expense.category, 40, y);
    doc.text(expense.description.substring(0, 15), 70, y); // Slightly shorter to fit new columns
    doc.text(`${expense.amount.toFixed(2)} ${expense.currency}`, 115, y);
    
    // Exchange rate info (only for non-PLN expenses)
    if (expense.currency !== 'PLN' && rate && rateDate) {
      doc.text(rate.toFixed(4), 150, y);
      doc.text(formatDate(rateDate), 165, y);
    } else {
      doc.text("-", 150, y); // No rate for PLN
      doc.text("-", 165, y);
    }
    
    doc.text(`${convertedAmount.toFixed(2)} PLN`, 195, y);
    y += 7;
  });
  
  // Summary calculations using NBP rates (matching SummaryCard)
  y += 10;
  doc.setFontSize(12);
  const totalExpenses = await calculateTotalExpensesMultiCurrency(expenses);
  const totalAllowance = await calculateDailyAllowanceAsync(delegation);
  const tripTotal = totalExpenses + totalAllowance;
  
  doc.text(`Total Expenses: ${totalExpenses.toFixed(2)} PLN`, 14, y);
  y += 8;
  doc.text(`Daily Allowance (diety): ${totalAllowance.toFixed(2)} PLN`, 14, y);
  y += 8;
  doc.setFontSize(14);
  doc.text(`Trip Total: ${tripTotal.toFixed(2)} PLN`, 14, y);
  
  // Tax information as per section 5
  y += 15;
  doc.setFontSize(10);
  doc.text("Tax Information (for 'ulga na start'):", 14, y);
  y += 8;
  doc.text(`This amount can be deducted from taxable income.`, 14, y);
  doc.text(`If income_tax_base <= 0, no income tax is due.`, 14, y + 6);
  
  // Footer with legal reference
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 280);
  doc.text("Based on Rozporządzenie Ministra Pracy i Polityki Społecznej z 29.01.2013 r.", 14, 285);
  
  doc.save(`delegation_${delegation.id}.pdf`);
}

export async function exportToCSV(delegation: Delegation, expenses: Expense[]): Promise<void> {
  // Format date as YYYY-MM-DD (remove time portion)
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    // If dateString is already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Otherwise, format from Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate exchange rates for each expense with rate dates
  const expenseRates = await Promise.all(
    expenses.map(async (expense) => {
      if (expense.currency === 'PLN') {
        return { rate: 1, rateDate: null, convertedAmount: expense.amount };
      }
      try {
        const expenseDate = formatDate(expense.date);
        const expenseDateObj = new Date(expenseDate);
        const lastWorkingDay = getLastWorkingDay(expenseDateObj);
        const rateDate = formatDate(lastWorkingDay.toISOString());
        const rate = await getExchangeRateForDate(expense.currency, expenseDate);
        return { rate, rateDate, convertedAmount: expense.amount * rate };
      } catch (error) {
        // Fallback to delegation exchange rate
        return { rate: delegation.exchange_rate, rateDate: null, convertedAmount: expense.amount * delegation.exchange_rate };
      }
    })
  );

  const headers = ["Data", "Kategoria", "Opis", "Kwota", "Waluta", "Kurs wymiany", "Data kursu", "Wartość w PLN"];
  const rows = expenses.map((expense, index) => {
    const { rate, rateDate, convertedAmount } = expenseRates[index];
    return [
      formatDate(expense.date),
      expense.category,
      expense.description,
      expense.amount.toFixed(2),
      expense.currency,
      expense.currency !== 'PLN' && rate ? rate.toFixed(4) : "-",
      expense.currency !== 'PLN' && rateDate ? formatDate(rateDate) : "-",
      convertedAmount.toFixed(2)
    ];
  });
  
  // Add summary row (using NBP rates matching SummaryCard)
  const totalExpenses = await calculateTotalExpensesMultiCurrency(expenses);
  const totalAllowance = await calculateDailyAllowanceAsync(delegation);
  const tripTotal = totalExpenses + totalAllowance;
  
  // Calculate daily allowance breakdown for CSV
  const timeBreakdown = calculateDelegationTimeBreakdown(delegation);
  const allowanceDate = formatDate(delegation.start_date);
  const allowanceDateObj = new Date(allowanceDate);
  const lastWorkingDay = getLastWorkingDay(allowanceDateObj);
  const eurRateDate = formatDate(lastWorkingDay.toISOString());
  
  let eurRate: number;
  try {
    eurRate = await getExchangeRateForDate('EUR', delegation.start_date);
  } catch (error) {
    eurRate = delegation.exchange_rate;
  }
  
  // Build daily allowance breakdown rows
  const summaryRows: string[][] = [
    ["", "", "", "", "", "", "", ""],
    ["PODSUMOWANIE", "", "", "", "", "", "", ""],
    ["Całkowite koszty", "", "", "", "", "", "", totalExpenses.toFixed(2)]
  ];
  
  // Add Daily Allowance with breakdown - all in first column (Category)
  if (timeBreakdown.hasTimeFields) {
    const fullDays = timeBreakdown.fullDays;
    const partialRate = timeBreakdown.partialDayRate;
    
    let calculationText = "";
    if (fullDays > 0) {
      calculationText += `${fullDays} × ${delegation.daily_allowance} EUR`;
    }
    if (partialRate > 0) {
      if (fullDays > 0) calculationText += " + ";
      const partialLabel = partialRate === 1/3 ? "1/3" : partialRate === 1/2 ? "1/2" : "1";
      calculationText += `${partialLabel} × ${delegation.daily_allowance} EUR`;
    }
    if (fullDays === 0 && partialRate === 0) {
      calculationText = "0 dni";
    }
    calculationText += ` × ${eurRate.toFixed(4)} PLN/EUR`;
    
    summaryRows.push(
      ["Dieta (diety)", "", "", "", "", "", "", totalAllowance.toFixed(2)],
      [`  Obliczenie: ${calculationText}`, "", "", "", "", "", "", ""],
      [`  Data kursu: ${eurRateDate} (ostatni dzień roboczy przed ${allowanceDate})`, "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""]
    );
  } else {
    const days = timeBreakdown.totalDays;
    summaryRows.push(
      ["Dieta (diety)", "", "", "", "", "", "", totalAllowance.toFixed(2)],
      [`  Obliczenie: ${days} dni × ${delegation.daily_allowance} EUR × ${eurRate.toFixed(4)} PLN/EUR`, "", "", "", "", "", "", ""],
      [`  Data kursu: ${eurRateDate} (ostatni dzień roboczy przed ${allowanceDate})`, "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""]
    );
  }
  
  summaryRows.push(
    ["Całkowity koszt podróży", "", "", "", "", "", "", tripTotal.toFixed(2)]
  );
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ...summaryRows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `delegation_${delegation.id}.csv`;
  link.click();
}
