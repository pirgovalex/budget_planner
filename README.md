# AI Budget Planner

A personal budget web app: you log income and expenses, it shows where the money goes, tracks savings goals and gives short spending tips. Solid.js frontend, FastAPI + SQLite backend. An LLM on the Hugging Face Inference API guesses the category of each new expense from its description and writes the tips. Without a Hugging Face token it runs in a simulation mode, so the app still works end to end.

<!-- screenshot -->

## How it works

- **Auth**: register and log in. Passwords are hashed with passlib (PBKDF2-SHA256) and the API issues JWT access tokens (HS256, valid 24 h). All data is scoped to the logged-in user.
- **Transactions**: CRUD endpoints with filtering by category and type. When a transaction comes in without a category, the backend asks the LLM to pick one of Food, Transport, Utilities, Entertainment, Shopping, Health, Travel, Income or Miscellaneous. There is also a CSV import endpoint (`POST /transactions/import`), API only for now.
- **Goals**: savings goals with a target, current amount and optional deadline. The API adds progress % and the remaining amount.
- **Analytics**: totals, spending by category for the last 30 days, a 6-month income/expense summary, and a next-month estimate (average of the last 3 months). The dashboard draws the category split with Chart.js.
- **AI insights**: `/ai/insights` and `/ai/savings-recommendations` put your totals and goals into a prompt for `meta-llama/Llama-3.2-3B-Instruct` through `huggingface_hub.InferenceClient`.
- **Simulation mode**: if `HF_TOKEN` is not set or the API call fails, categorization falls back to keyword matching ("pizza" -> Food, "uber" -> Transport) and the insights return template advice marked "(Simulated AI)". I added this because the hosted APIs are rate-limited and cost money.

## Stack

- Backend: Python, FastAPI, SQLAlchemy 2, SQLite, Pydantic v2 / pydantic-settings, python-jose, passlib, huggingface_hub
- Frontend: Solid.js, @solidjs/router, Vite, Tailwind CSS, Chart.js

## Demo accounts

Both are created by the migration script.

| User | Password | Data |
|---|---|---|
| `test_user` | `password123` | sample transactions (salary, rent, groceries, etc.) and a vacation goal |
| `demo` | `demo123` | mostly empty, for trying things from scratch |

## Running it

Needs Python 3.10+ and Node.js 18+.

Backend, from the repo root:

```bash
python3 -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt

cp .env.example .env                # set SECRET_KEY; HF_TOKEN is optional
python -m backend.migrate_data      # creates the SQLite DB and the demo accounts
uvicorn backend.main:app --reload --port 8000
```

`start-backend.sh` does the venv, install and server steps in one go (it skips the migration). API docs are at http://localhost:8000/docs.

Frontend, in a second terminal:

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to the backend on port 8000.

## Notes

- No tests yet.
- Amounts are shown with a `$` sign; there is no currency setting.
- The SQLite file (`budget_planner.db`) is created in the folder you start the server from.

---

## На български

Уеб приложение за личен бюджет: записвате приходи и разходи, а то показва за какво отиват парите, следи целите за спестяване и дава кратки съвети. Frontend на Solid.js, backend на FastAPI със SQLite. AI модел (Llama 3.2 3B през Hugging Face) познава категорията на разхода по описанието и пише съветите.

Без Hugging Face токен приложението работи в „симулационен режим“: категориите се определят по ключови думи, а съветите са примерни и са отбелязани с „(Simulated AI)“.

Тестови профили: `test_user` / `password123` (с готови данни) и `demo` / `demo123` (почти празен). Командите за стартиране са в секцията „Running it“ по-горе.
