import { jsPDF } from "jspdf";
import { Delegation, Expense, calculateTotalExpenses, calculateDailyAllowanceAsync, calculateTripTotal, getExpenseCategoryInfo } from "./rules";

export async function exportToPDF(delegation: Delegation, expenses: Expense[]): Promise<void> {
  const doc = new jsPDF();
  
  // Header - Professional delegation report
  doc.setFontSize(20);
  doc.text(`Delegation Report: ${delegation.title}`, 14, 20);
  
  // Delegation details as per knowledgebase v0.2
  doc.setFontSize(12);
  doc.text(`Destination: ${delegation.destination_city}, ${delegation.destination_country}`, 14, 35);
  doc.text(`Dates: ${delegation.start_date} – ${delegation.end_date}`, 14, 42);
  doc.text(`Purpose: ${delegation.purpose}`, 14, 49);
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
  
  // Table headers
  doc.setFontSize(10);
  doc.text("Date", 14, y);
  doc.text("Category", 40, y);
  doc.text("Description", 70, y);
  doc.text("Amount", 130, y);
  doc.text("PLN Value", 160, y);
  doc.text("Deductible", 180, y);
  y += 8;
  
  // Draw line under headers
  doc.line(14, y, 200, y);
  y += 5;
  
  // Expense rows with deductibility info
  expenses.forEach((expense) => {
    const categoryInfo = getExpenseCategoryInfo(expense.category);
    const deductible = categoryInfo?.deductible ? "Yes" : "No";
    
    doc.text(expense.date, 14, y);
    doc.text(expense.category, 40, y);
    doc.text(expense.description.substring(0, 20), 70, y);
    doc.text(`${expense.amount.toFixed(2)} ${expense.currency}`, 130, y);
    doc.text(`${(expense.amount * delegation.exchange_rate).toFixed(2)} PLN`, 160, y);
    doc.text(deductible, 180, y);
    y += 7;
  });
  
  // Summary calculations as per knowledgebase v0.2 section 5
  y += 10;
  doc.setFontSize(12);
  const totalExpenses = calculateTotalExpenses(expenses, delegation.exchange_rate);
  const totalAllowance = await calculateDailyAllowanceAsync(delegation);
  const tripTotal = calculateTripTotal(expenses, delegation);
  
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
  const headers = ["Date", "Category", "Description", "Amount", "Currency", "PLN Value", "Deductible"];
  const rows = expenses.map(expense => {
    const categoryInfo = getExpenseCategoryInfo(expense.category);
    const deductible = categoryInfo?.deductible ? "Yes" : "No";
    
    return [
      expense.date,
      expense.category,
      expense.description,
      expense.amount.toFixed(2),
      expense.currency,
      (expense.amount * delegation.exchange_rate).toFixed(2),
      deductible
    ];
  });
  
  // Add summary row
  const totalExpenses = calculateTotalExpenses(expenses, delegation.exchange_rate);
  const totalAllowance = await calculateDailyAllowanceAsync(delegation);
  const tripTotal = calculateTripTotal(expenses, delegation);
  
  const summaryRows = [
    ["", "", "", "", "", "", ""],
    ["SUMMARY", "", "", "", "", "", ""],
    ["Total Expenses", "", "", "", "", totalExpenses.toFixed(2), ""],
    ["Daily Allowance", "", "", "", "", totalAllowance.toFixed(2), ""],
    ["Trip Total", "", "", "", "", tripTotal.toFixed(2), ""]
  ];
  
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
