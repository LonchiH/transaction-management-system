from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Transaction Management API")

@app.get("/transactions")
def get_transactions():
    return []

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=800)