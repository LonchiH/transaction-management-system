import { useEffect, useRef, useState } from "react";

export default function AddTransactionModal({ onClose, onCreated }) {
  const dialogRef = useRef(null);
  const submittingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();

    return () => dialog.close();
  }, []);

  function handleClose() {
    if (submittingRef.current) return;

    dialogRef.current.close();
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submittingRef.current) return;

    const formData = new FormData(event.currentTarget);

    const payload = {
      transaction_date: formData.get("transaction_date"),
      account_number: formData.get("account_number").trim(),
      account_holder_name: formData.get("account_holder_name").trim(),
      amount: formData.get("amount"),
    };

    if (!payload.account_number || !payload.account_holder_name) {
      setError("Enter an account number and account holder name.");
      return;
    }

    submittingRef.current = true;
    setSaving(true);
    setError("");

    let savedTransaction;

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const message = Array.isArray(result.detail)
          ? result.detail.map((issue) => issue.msg).join(" ")
          : result.detail || "Unable to save transaction.";

        setError(message);
        return;
      }

      savedTransaction = result;
    } catch {
      setError(
        "Unable to save transaction. Check that the backend is running."
      );
      return;
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }

    dialogRef.current.close();
    onCreated(savedTransaction);
  }

  return (
    <dialog
      ref={dialogRef}
      className="transaction-modal"
      aria-labelledby="add-transaction-title"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
    >
      <h2 id="add-transaction-title">Add Transaction</h2>

      <form onSubmit={handleSubmit} aria-busy={saving}>
        <fieldset disabled={saving}>
          <label>
            Transaction Date
            <input
              name="transaction_date"
              type="date"
              required
              autoFocus
            />
          </label>

          <label>
            Account Number
            <input
              name="account_number"
              type="text"
              maxLength={50}
              required
            />
          </label>

          <label>
            Account Holder Name
            <input
              name="account_holder_name"
              type="text"
              maxLength={100}
              required
            />
          </label>

          <label>
            Amount
            <input
              name="amount"
              type="number"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              required
            />
          </label>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary"
              onClick={handleClose}
            >
              Cancel
            </button>

            <button type="submit">
              {saving ? "Saving..." : "Save Transaction"}
            </button>
          </div>
        </fieldset>
      </form>
    </dialog>
  );
}