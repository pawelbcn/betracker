# Delegation Expense Tracker – Knowledgebase

**Version:** 0.3 (October 2025)
**Author:** Paweł Marciniak
**Purpose:** Central reference for app logic, tax rules, and business logic used in the Business Travel Tracker application.

---

## 1️⃣ Core Concept

The app helps freelancers or small business owners document **business travel (delegations)** for accounting, taxation, and reimbursement purposes.

It keeps all **expenses, daily allowances (diety), currencies, and exchange rates** in one place, and calculates totals in PLN for tax or KPiR reporting.

The app is designed to be:

* ✅ *Mobile-friendly, clean, minimal UI*
* ✅ *Offline/local-data-ready (JSON mock first, backend later)*
* ✅ *Expandable (PDF export, AI categorization, VAT summary)*

---

## 2️⃣ Data Model

### Delegation

| Field                 | Type                | Description                                                      |
| --------------------- | ------------------- | ---------------------------------------------------------------- |
| `id`                  | string              | Unique identifier (UUID or timestamp)                            |
| `title`               | string              | Name or purpose of the trip                                      |
| `destination_country` | string              | Country of delegation                                            |
| `destination_city`    | string              | City or region visited                                           |
| `start_date`          | string (YYYY-MM-DD) | Start date                                                       |
| `end_date`            | string (YYYY-MM-DD) | End date                                                         |
| `purpose`             | string              | Short description of business goal                               |
| `exchange_rate`       | float               | Exchange rate to PLN for all expenses                            |
| `daily_allowance`     | float               | Diety per day (per Polish regulations, in EUR or local currency) |
| `notes`               | string              | Optional comments or follow-up email reference                   |

### Expense

| Field           | Type                | Description                                    |
| --------------- | ------------------- | ---------------------------------------------- |
| `id`            | string              | Unique ID                                      |
| `delegation_id` | string              | Foreign key to Delegation                      |
| `date`          | string (YYYY-MM-DD) | Expense date                                   |
| `category`      | string              | e.g. `flight`, `hotel`, `food`, `taxi`, `misc` |
| `amount`        | number              | Amount in original currency                    |
| `currency`      | string              | Currency code (EUR, HUF, etc.)                 |
| `description`   | string              | Description for record / invoice title         |

---

## 3️⃣ Business Logic Rules

### 3.1 Currency Conversion

All totals are shown in PLN using currency-specific exchange rates:

```
PLN_value = amount * currency_exchange_rate
```

**Supported Currencies (25+):**

**Major European:**
- EUR (4.35), GBP (5.3), CHF (4.7), NOK (0.38), SEK (0.38), DKK (0.58)

**Central/Eastern European:**
- PLN (1.0), HUF (0.012), CZK (0.18), RON (0.88), BGN (2.22), HRK (0.58), RSD (0.037)

**Major Global:**
- USD (4.2), CAD (3.1), AUD (2.8), JPY (0.028), CNY (0.58), INR (0.05), BRL (0.82), MXN (0.25)

**Middle East & Africa:**
- AED (1.14), SAR (1.12), ZAR (0.22), EGP (0.14)

The exchange rates can be:

* Taken manually from NBP average rate on the day before expense (`t-1`)
* Currently using realistic mock rates for testing
* Future: Live NBP API integration for real-time rates

---

### 3.2 Daily Allowance (Diety)

Each trip generates a daily allowance according to Polish tax law:

| Country        | Daily Allowance (EUR) |
| -------------- | --------------------- |
| Hungary        | 43                    |
| Germany        | 49                    |
| Italy          | 48                    |
| France         | 50                    |
| Czech Republic | 41                    |

Formula:

```
total_diety = number_of_days * allowance_rate
```

Partial days:

* <8h → 1/3 rate
* 8–12h → 1/2 rate
* > 12h → full day

Meals provided reduce diety:

* Breakfast → -15%
* Lunch → -30%
* Dinner → -30%

---

### 3.3 Expense Categories and Deductibility

| Category                      | Deductible? | Notes                                           |
| ----------------------------- | ----------- | ----------------------------------------------- |
| Hotel                         | ✅           | Invoice must show company NIP if possible       |
| Flight / Transport            | ✅           | Invoice or boarding pass proof                  |
| Food                          | ⚠️          | Covered by diet (dieta) unless exceptional case |
| Taxi / Public Transport       | ✅           | Must show route related to business             |
| Misc (e.g. printing, tickets) | ✅           | If directly related to meeting/event            |

---

### 3.4 Documentation Rules

Each expense entry should be supported by at least one:

* Invoice / receipt (can be foreign)
* Screenshot of booking (hotel, flight)
* Email follow-up / meeting summary confirming purpose

Optional:

* Attach note: `Meeting with X on [date], discussed Y topics`
* Reference to contract, concert, or artist cooperation

---

## 4️⃣ Polish Delegation Law Reference

### 4.1 Scope

This app follows **Rozporządzenie Ministra Pracy i Polityki Społecznej z 29.01.2013 r.** regarding domestic and foreign delegations.

### 4.2 Key Rules

#### ✅ Per diems (diety)

* Used only for **meals and small personal expenses**.
* Limited by official daily rates per country.
* Reduced if meals are provided.

#### ❌ Hotels, flights, transport

* **No fixed maximum limits**.
* Fully deductible if:

  * The expense is justified by business purpose.
  * You hold valid documentation (invoice, booking).
* “Reasonable and necessary” rule applies (no luxury misuse).

#### 💡 Accounting rules

| Expense type    | Tax deductible?  | Limit/cap                   | Documentation required |
| --------------- | ---------------- | --------------------------- | ---------------------- |
| Per diem        | Yes              | Country rate                | Delegation note        |
| Hotel           | Yes              | None                        | Invoice with NIP       |
| Flight/train    | Yes              | None                        | Ticket/invoice         |
| Meals           | Usually via diet | Only if not covered by diet |                        |
| Local transport | Yes              | Receipts or tickets         |                        |

---

## 5️⃣ Calculations Overview

```
total_expenses_PLN = Σ(expense.amount * exchange_rate)
trip_total_PLN = total_expenses_PLN + total_diety_PLN
```

If under “ulga na start”:

```
income_tax_base = income - trip_total_PLN
```

If `income_tax_base <= 0`, no income tax is due.

---

## 6️⃣ UI/UX Notes

* Minimal design: white background, soft shadows, rounded corners (2xl)
* Responsive: 1 column mobile, 2–3 desktop
* Interactivity: Add/Edit/Delete delegations
* Optional widgets:

  * NBP rate fetch
  * PDF “Delegation Report”
  * Attach receipts (local)
  * AI categorization helper

---

## 7️⃣ Roadmap

| Version | Features                                         |
| ------- | ------------------------------------------------ |
| v0.2    | Add PDF/CSV export and filtering by country/date |
| v0.3    | **COMPLETED** - Multi-currency support, professional UI, business travel terminology |
| v0.4    | Add user auth + backend sync                     |
| v0.5    | Add OCR for receipts                             |
| v0.6    | Tax summary generator (PL PIT/B2B ready)         |

---

## 8️⃣ Current Application Status (v0.3)

### ✅ Production Ready Features
- **Multi-Currency Support**: 25+ currencies with realistic exchange rates
- **Professional UI**: "Business Travel" terminology throughout
- **Real Database**: MySQL with Prisma ORM, 5 test delegations with 16+ expenses
- **Export Functionality**: PDF and CSV export for accounting
- **Analytics**: Monthly/yearly statistics with interactive charts
- **Mobile Responsive**: Works on all device sizes
- **AI Assistant**: Natural language expense and delegation creation

### 🎯 Key Improvements in v0.3
- **Extended Currency Support**: From 5 to 25+ popular currencies
- **Professional Branding**: "Business Travel Tracker" with consistent terminology
- **Enhanced UX**: Organized currency dropdown with regional grouping
- **Accurate Calculations**: Currency-specific exchange rates for precise PLN conversion
- **Comprehensive Testing**: End-to-end verification of all new features

### 🚀 Next Priority Features
1. **NBP API Integration** - Live exchange rates
2. **Receipt Upload** - Photo attachments for expenses  
3. **User Authentication** - Multi-user support

---

**End of Document**
*Last updated: October 19, 2025*
