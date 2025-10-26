"use client";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { exportToPDF, exportToCSV } from "@/logic/export";
import { Delegation, Expense } from "@/logic/rules";

interface ExportMenuProps {
  delegation: Delegation;
  expenses: Expense[];
}

export default function ExportMenu({ delegation, expenses }: ExportMenuProps) {
  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={() => exportToPDF(delegation, expenses)}
        className="btn-primary flex items-center gap-2"
      >
        <FileDown className="w-4 h-4" /> 
        Export PDF
      </button>
      <button
        onClick={() => exportToCSV(delegation, expenses)}
        className="btn-secondary flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" /> 
        Export CSV
      </button>
    </div>
  );
}
