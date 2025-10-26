import { Expense } from '@/logic/rules';

interface ExpenseTableProps {
  expenses: Expense[];
  exchangeRate: number;
}

export function ExpenseTable({ expenses, exchangeRate }: ExpenseTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900">Expense Details</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                PLN Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                  {expense.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-800 capitalize">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-900 max-w-xs">
                  <div className="truncate" title={expense.description}>
                    {expense.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 text-right font-medium">
                  {expense.amount.toFixed(2)} {expense.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 text-right font-semibold">
                  {(expense.amount * exchangeRate).toFixed(2)} PLN
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
