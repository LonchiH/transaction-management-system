import uvicorn
import csv

from pathlib import Path
from fastapi import FastAPI, HTTPException

app = FastAPI(title="Transaction Management API")

CSV_FILE = Path(__file__).resolve().parent / "data" / "transactions.csv"

CSV_COLUMNS = {
    "transaction_date": "Transaction Date",
    "account_number": "Account Number",
    "account_holder_name": "Account Holder Name",
    "amount": "Amount",
    "status": "Status",
}

@app.get("/transactions")
def get_transactions():
    try:
        with open(CSV_FILE, 'r', newline="") as file:
            csv_reader = csv.DictReader(file)

            if csv_reader.fieldnames != list(CSV_COLUMNS.values()):
                raise ValueError("Unexpected transaction CSV headers")

            transactions = []

            for row in csv_reader:
                if None in row or any (value is None for value in row.values()):
                    raise ValueError("Invalid transaction CSV row")

                transaction = {}

                for api_name, csv_name in CSV_COLUMNS.items():
                    transaction[api_name] = row[csv_name]

                transactions.append(transaction)

            return transactions

    except(OSError, UnicodeError, csv.Error, ValueError) as error:
        raise HTTPException(status_code=500, detail="Unable to load transactions.") from error


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)