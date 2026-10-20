import { useEffect, useState } from "react";
import AddTransactionModal from "./components/AddTransactionModel";

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTransactions() {
      try {
        const response = await fetch("/api/transactions", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load transactions.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response.");
        }

        if (!controller.signal.aborted) {
          setTransactions(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "Unable to load transactions. Check that the backend is running."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => controller.abort();
  }, []);

  function handleCreated(transaction) {
    setTransactions((current) => [...current, transaction]);
    setIsModalOpen(false)
  }

  return (
    <main>
      <header className="page-header">
        <h1>Transactions</h1>

        <button
          type="button"
          disabled={loading || Boolean(error)}
          onClick={() => setIsModalOpen(true)}
        >
          Add Transaction
        </button>
      </header>

      {loading && <p role="status">Loading transactions...</p>}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="table-wrapper">
          <table aria-label="Transactions">
            <thead>
              <tr>
                <th scope="col">Transaction Date</th>
                <th scope="col">Account Number</th>
                <th scope="col">Account Holder Name</th>
                <th scope="col" className="amount">Amount</th>
                <th scope="col">Status</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5}>No transactions yet.</td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{transaction.transaction_date}</td>
                    <td>{transaction.account_number}</td>
                    <td>{transaction.account_holder_name}</td>
                    <td className="amount">{transaction.amount}</td>
                    <td>
                      <span
                        className={`status status-${transaction.status.toLowerCase()}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {isModalOpen && (
        <AddTransactionModal
          onClose={() => setIsModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </main>
  );
}