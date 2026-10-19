import uvicorn
import csv
import random

from datetime import date
from decimal import Decimal
from threading import Lock
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI(title="Transaction Management API")

CSV_FILE = Path(__file__).resolve().parent / "data" / "transactions.csv"

CSV_COLUMNS = {
    "transaction_date": "Transaction Date",
    "account_number": "Account Number",
    "account_holder_name": "Account Holder Name",
    "amount": "Amount",
    "status": "Status",
}

FILE_LOCK = Lock()
STATUSES = ("Pending", "Settled", "Failed")

class TransactionCreate(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid"
    )

    transaction_date: date
    account_number: str = Field(min_length=1, max_length=50)
    account_holder_name: str = Field(min_length=1, max_length=100)
    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
        allow_inf_nan=False,
    )

@app.get("/transactions")
def get_transactions():
    try:
        with FILE_LOCK:
            with open(CSV_FILE, 'r', newline="", encoding="utf-8-sig") as file:
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

@app.post("/transactions", status_code=201)
def create_transaction(payload: TransactionCreate):
    transaction = {
        "transaction_date": payload.transaction_date.isoformat(),
        "account_number": payload.account_number,
        "account_holder_name": payload.account_holder_name,
        "amount": format(payload.amount, ".2f"),
        "status": random.choice(STATUSES),
    }

    csv_row = {}

    for api_name, csv_name in CSV_COLUMNS.items():
        csv_row[csv_name] = transaction[api_name]

    try:
        with FILE_LOCK:
            with open(CSV_FILE, mode="r+", newline="", encoding="utf-8-sig") as file:
                existing_content = file.read()

                file.seek(0)
                csv_reader = csv.DictReader(file)

                if csv_reader.fieldnames != list(CSV_COLUMNS.values()):
                    raise ValueError("Unexpected transaction CSV headers")

                file.seek(0, 2)

                if not existing_content.endswith(("\n", "\r")):
                    file.write("\n")

                writer = csv.DictWriter(
                    file,
                    fieldnames=list(CSV_COLUMNS.values())
                )
                writer.writerow(csv_row)

    except(OSError, UnicodeError, csv.Error, ValueError) as error:
        raise HTTPException(status_code=500, detail="Unable to save transactions.") from error

    return transaction

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)