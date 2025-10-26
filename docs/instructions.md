GOAL

Create a fully working mock prototype (frontend only, no backend yet) inside Cursor that:

Displays delegations and expenses

Calculates totals in PLN

Uses mock data

Has an external knowledgebase.md documenting logic and business rules

FILES TO PASTE INTO CURSOR
1️⃣ Main app files
Path	Purpose
/package.json	Project dependencies (Next.js + React + shadcn + lucide)
/next.config.js	Basic Next.js config (you can leave empty or minimal)
/app/layout.js	Global page layout (header, styles)
/app/page.js	Homepage listing all delegations
/app/delegations/[id]/page.js	Dynamic route for detailed delegation view


2️⃣Components (UI)
File	Purpose
/components/DelegationCard.jsx	Displays delegation summary cards
/components/ExpenseTable.jsx	Table view of all expenses
/components/SummaryCard.jsx	Shows PLN totals and summary info

3️⃣ Data (mocked JSONs for testing)
File	Purpose
/data/mockDelegations.json	Test delegations list
/data/mockExpenses.json	Test expense items

4️⃣ Logic
File	Purpose
/logic/rules.js	Basic functions for currency conversion & totals

5️⃣ Documentation
File	Purpose
/knowledgebase.md	Business logic explanation + formulas + data model

6️⃣ (Optional)
File	Purpose
/README.md	Setup instructions
/public/logo.svg	Placeholder for branding

