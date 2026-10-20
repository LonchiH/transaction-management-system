# Transaction Management System

A transaction management application built with FastAPI and React. It displays transactions from a CSV file and lets users add transactions through a modal form. The backend assigns each new transaction a random status and saves it to the CSV.

## Features

- Retrieve transactions with `GET /transactions`.
- Create transactions with `POST /transactions`.
- Display transaction date, account number, account holder name, amount, and status.
- Add transactions through a form with date, text, and number inputs.
- Display Pending in yellow, Settled in green, and Failed in red.
- Update the table after a successful save.
- Preserve transactions and their assigned statuses across normal application restarts.
- Show loading and error messages, validate input, and disable repeated form submission while saving.

## Technology stack

| Part | Technology |
| --- | --- |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Storage | CSV files using Python's built-in `csv` module |
| Frontend | React with JavaScript, Vite, CSS |
| API communication | Browser Fetch API |
| Version control | Git and GitHub |

Python dependency versions are recorded in `backend/requirements.txt`. Frontend dependencies are declared in `frontend/package.json`, with resolved versions in `frontend/package-lock.json`.

## Prerequisites

The commands below use **Windows Command Prompt (`cmd.exe`)**. Internet access is needed to download the repository and install dependencies.

| Software | Version or requirement | Installation |
| --- | --- | --- |
| Python | 3.10 or newer, with the `py` launcher available | [Python for Windows](https://www.python.org/downloads/windows/) |
| Node.js | 24.x LTS | [Node.js downloads](https://nodejs.org/en/download) |
| npm | The version bundled with Node.js 24 LTS | Installed with Node.js |
| Git | 2.x | [Git for Windows](https://git-scm.com/install/windows) |
| Browser | A current Chrome, Edge, or Firefox version with native dialog support | Use your preferred browser |

After installing tools, open a new Command Prompt and check:

```bat
py -3 --version
node --version
npm --version
git --version
```

## Installation

### 1. Download the project

On the GitHub repository page, select **Code**, choose **HTTPS**, and copy the repository URL. Open Command Prompt in a parent folder where you want to keep the project.

Replace `https://github.com/LonchiH/transaction-management-system.git` in the following command with the copied URL before running it:

```bat
git clone https://github.com/LonchiH/transaction-management-system.git transaction-management-system
cd transaction-management-system
```

This folder is the **project root**. It contains `backend`, `frontend`, and this README.

If you already have the source code, open its root folder in File Explorer, type `cmd` in the address bar, and press Enter. You can skip the clone command.

### 2. Install backend dependencies

Run these commands from the project root:

```bat
py -3 -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install --upgrade pip
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

The virtual environment keeps this project's Python packages separate from other projects. The commands use its Python executable directly, so activating the environment is unnecessary.

### 3. Initialize the working CSV

The repository contains `backend/data/transactions.seed.csv`, which holds the 12 supplied sample transactions. The application reads and writes `backend/data/transactions.csv`, which is ignored by Git.

From the project root, run:

```bat
if not exist "backend\data\transactions.csv" copy "backend\data\transactions.seed.csv" "backend\data\transactions.csv"
```

This creates the working file only when it is missing. Running the command again preserves existing transactions. The backend expects this file to exist before handling requests.

### 4. Install frontend dependencies

From the project root:

```bat
cd frontend
npm ci
cd ..
```

[`npm ci`](https://docs.npmjs.com/cli/v11/commands/npm-ci/) installs dependencies from the committed lockfile. It requires `package-lock.json` to match `package.json`.

## Running the application

Both the backend and frontend must run at the same time, in separate terminal windows.

### Terminal 1: Backend

Open Command Prompt in the project root and run:

```bat
backend\.venv\Scripts\python.exe -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

Keep this terminal open. `--reload` restarts the development server after Python source changes.

- API: [http://127.0.0.1:8000/transactions](http://127.0.0.1:8000/transactions)
- Interactive API documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

The API root `/` has no route; use `/transactions` or `/docs`.

### Terminal 2: Frontend

Open a second Command Prompt in the project root, then run:

```bat
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

Use **Add Transaction** to open the form. Fill in the four fields and select **Save Transaction**. The backend assigns the status; the modal closes after a successful save, and the saved transaction appears at the bottom of the table.

To stop either server, focus its terminal and press **Ctrl+C**.

## Configuration

No environment variables, credentials, or database server are required for the local setup.

| Setting | Location | Default |
| --- | --- | --- |
| Working CSV | `CSV_FILE` in `backend/main.py` | `backend/data/transactions.csv` |
| Seed CSV | Committed sample file | `backend/data/transactions.seed.csv` |
| Backend address | Uvicorn startup command | `127.0.0.1:8000` |
| Frontend port | `frontend/vite.config.js` | `5173`, with `strictPort: true` |
| API proxy target | `frontend/vite.config.js` | `http://127.0.0.1:8000` |

During development, React requests `/api/transactions` from Vite. The [Vite development proxy](https://vite.dev/config/server-options.html#server-proxy) removes the `/api` prefix and forwards the request to FastAPI's `/transactions` route. Browser requests therefore use the frontend's origin.

If you change the backend port, update both the Uvicorn command and the proxy target. Restart Vite after changing its configuration.

## API documentation

The API base URL is `http://127.0.0.1:8000`. Requests and responses use JSON. Authentication is not required for this assignment.

### GET /transactions

Returns all transactions from the working CSV in file order.

**Successful response:** `200 OK`

The example below shows one element; the response includes every stored transaction.

```json
[
  {
    "transaction_date": "2025-03-01",
    "account_number": "7289-3445-1121",
    "account_holder_name": "Maria Johnson",
    "amount": "150.00",
    "status": "Settled"
  }
]
```

A CSV containing only the expected header row returns `[]`.

### POST /transactions

Creates and saves a transaction. Send `Content-Type: application/json` with these four fields:

```json
{
  "transaction_date": "2026-10-20",
  "account_number": "0012-3456-7890",
  "account_holder_name": "Lance Example",
  "amount": "125.50"
}
```

| Field | Validation |
| --- | --- |
| `transaction_date` | Required valid date; use `YYYY-MM-DD` |
| `account_number` | Required string, trimmed, 1 to 50 characters |
| `account_holder_name` | Required string, trimmed, 1 to 100 characters |
| `amount` | Required positive decimal, up to 12 digits in total and 2 decimal places; maximum `9999999999.99` |

Send amounts as decimal strings to preserve precision. The backend validates them using `Decimal` and formats newly created amounts with two decimal places. Account numbers remain strings so leading zeros are preserved.

Additional fields are rejected. The server assigns `status` using a random choice of `Pending`, `Settled`, or `Failed`.

**Successful response:** `201 Created`

```json
{
  "transaction_date": "2026-10-20",
  "account_number": "0012-3456-7890",
  "account_holder_name": "Lance Example",
  "amount": "125.50",
  "status": "Pending"
}
```

`Pending` is an example. The selected status is saved with the transaction and remains unchanged on subsequent reads.

### Error responses

| Status | Meaning |
| --- | --- |
| `422 Unprocessable Entity` | Invalid request input, such as a negative amount, an invalid date, or an unexpected field |
| `500 Internal Server Error` | The backend cannot read or save the CSV, or its header does not match the expected columns |

Validation responses contain a `detail` array identifying the invalid fields. For example, an amount of `-5.00` produces a validation error before any CSV write occurs.

A storage failure returns a message such as:

```json
{
  "detail": "Unable to save transaction."
}
```

Technical exception details are logged in the backend terminal.

## Data storage and design

The CSV header is:

```csv
Transaction Date,Account Number,Account Holder Name,Amount,Status
```

Dates use `YYYY-MM-DD`, amounts are decimal text, and statuses use the three specified values. Python's CSV reader and writer handle commas and quotes within fields.

The backend maps CSV headers to snake_case API field names. The frontend reads data from the API, submits new transactions, and adds each successful POST response to React state.

The seed file is committed to Git for reproducible setup. The working CSV remains local and is preserved across normal restarts. Status assignment is a simulation for this exercise; it does not represent payment processing.

### Scope and limitations

- Run one backend process. A shared `threading.Lock` coordinates application reads and writes within that process; it does not coordinate separate workers or applications editing the same file.
- CSV writes append records. The implementation does not provide transactional rollback or crash recovery for an interrupted append.
- Each accepted POST creates a new record. The API does not implement idempotency keys or duplicate detection.
- This setup uses local development servers. Serving the built frontend in production would require hosting and API routing configuration.

## Manual verification

Run both servers before starting these checks. The table describes expected outcomes; it is a procedure for verifying the application.

| Check | Steps | Expected result |
| --- | --- | --- |
| Initial data | Start with a new working CSV copied from the seed | The table displays all 12 sample records |
| Table fields and colors | Inspect the table and its sample statuses | All five columns appear; Pending is yellow, Settled green, and Failed red |
| Create transaction | Open the modal, fill in valid values, and save | One new row appears, with a valid status, and the modal closes |
| Persistence | Refresh the browser, then stop and restart the backend | The new record and its assigned status remain |
| Leading zeros | Save account number `0012-3456-7890` | Leading zeros remain in the response, table, and CSV |
| CSV escaping | Save holder name `Example, Lance` and then a name with an accented character | Names display correctly after refreshing and do not shift CSV columns |
| Invalid form | Submit empty required fields or an amount of `-5.00` | Browser validation blocks submission |
| Invalid API input | Through `/docs`, POST a negative amount, `12.345`, a whitespace-only name, or an extra `status` field | HTTP 422; the transaction count does not increase |
| Save failure | With the modal open and filled in, stop the backend and select Save | An error appears and the entered values remain; restart the backend before retrying |
| Repeated submission | Try repeated clicks or Enter while a save request is pending | Save controls are disabled and the modal sends one request while pending |
| Keyboard operation | Open the modal, navigate with Tab, then use Cancel or Escape when idle | Focus stays within the open modal; closing returns focus to the Add button |
| Narrow window | Reduce the browser width | The table scrolls horizontally and the modal remains usable |

### Trying the API through the browser

1. Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
2. Expand GET `/transactions`, select **Try it out**, then **Execute**. Expect HTTP 200 and a JSON array.
3. Expand POST `/transactions`, select **Try it out**, and paste the example request above.
4. Select **Execute**. Expect HTTP 201 and the saved transaction with a status.
5. Execute GET again to confirm that the record was saved.

### Frontend build check

From the project root:

```bat
cd frontend
npm run build
cd ..
```

The build should complete successfully and generate `frontend/dist`. This verifies frontend bundling; the browser and API checks above verify application behavior. Continue using `npm run dev` for the documented local review workflow.

### Resetting sample data

This replaces the working CSV with the original 12 sample records and removes added transactions. Stop the backend first and retain a copy of the current working file if you need its contents.

From the project root:

```bat
copy "backend\data\transactions.seed.csv" "backend\data\transactions.csv"
```

Confirm the overwrite when prompted, restart the backend, and refresh the frontend.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `py`, `node`, `npm`, or `git` is not recognized | Install the prerequisite and reopen Command Prompt so it reads the updated PATH |
| The backend returns HTTP 500 on GET | Initialize the working CSV; confirm its header matches the documented columns; inspect the backend terminal |
| The frontend cannot load or save transactions | Keep FastAPI running on port 8000 and check the Vite proxy target |
| Port 5173 is already in use | Stop the other development server using that port, then restart Vite; `strictPort` prevents automatic switching |
| Port 8000 is already in use | Stop the other server, or update both the backend startup port and Vite's proxy target |
| `npm ci` reports a missing or inconsistent lockfile | Confirm `frontend/package-lock.json` was committed with the matching `package.json`; maintainers should regenerate it with `npm install` after intentional dependency changes |
| Browser validation passes but POST returns 422 | Check the response in `/docs`; backend validation also trims text and enforces decimal limits |

## Project structure

```text
transaction-management-system/
|-- README.md
|-- .gitignore
|-- backend/
|   |-- main.py
|   |-- requirements.txt
|   |-- .venv/                         # Generated locally; ignored by Git
|   `-- data/
|       |-- transactions.seed.csv      # Original sample data; committed
|       `-- transactions.csv           # Working data; generated locally and ignored
`-- frontend/
    |-- package.json
    |-- package-lock.json
    |-- vite.config.js
    |-- index.html
    `-- src/
        |-- main.jsx
        |-- App.jsx
        |-- index.css
        `-- components/
            `-- AddTransactionModal.jsx
```

Generated dependency and build folders, including `node_modules`, `.venv`, and `dist`, are excluded from version control.

## AI assistance

ChatGPT was used to help select the stack, generate initial FastAPI and React implementation code, explain the implementation step by step, plan manual verification, and draft this README.
