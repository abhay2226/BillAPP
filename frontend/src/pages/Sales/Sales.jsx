import { useEffect, useMemo, useState } from "react";

import "./Sales.css";

import * as billService from "../../services/billService";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toFixed(2)}`;

const monthLabel = (date) =>
  date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

export default function Sales() {
  const [bills, setBills] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const loadSales = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await billService.getBillHistory();
        if (active) {
          setBills(
            Array.isArray(result)
              ? result.filter(
                  (bill) => bill.status !== "VOID"
                )
              : []
          );
        }
      } catch (error) {
        if (!error?.isSessionExpired && active) {
          setErrorMessage(
            error.message || "Unable to load sales."
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadSales();

    return () => {
      active = false;
    };
  }, []);

  const salesRows = useMemo(() => {
    const now = new Date();
    const buckets = new Map();

    bills.forEach((bill) => {
      const date = new Date(bill.created_at);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      let key;
      let label;

      if (period === "monthly") {
        key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        label = monthLabel(date);
      } else {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        label = `Q${quarter} ${date.getFullYear()}`;
      }

      const previous = buckets.get(key) || {
        key,
        label,
        date,
        sales: 0,
        bills: 0,
      };

      previous.sales += Number(bill.grand_total || 0);
      previous.bills += 1;
      buckets.set(key, previous);
    });

    const rows = Array.from(buckets.values()).sort(
      (first, second) =>
        second.date.getTime() - first.date.getTime()
    );

    if (period === "monthly") {
      return rows.filter((row) =>
        row.date.getFullYear() === now.getFullYear()
      ).slice(0, 12);
    }

    return rows.filter((row) => {
      const year = row.date.getFullYear();
      return year >= now.getFullYear() - 1;
    }).slice(0, 8);
  }, [bills, period]);

  const totalSales = salesRows.reduce(
    (sum, row) => sum + row.sales,
    0
  );
  const totalBills = salesRows.reduce(
    (sum, row) => sum + row.bills,
    0
  );

  return (
    <div className="sales-page">
      <div className="sales-header">
        <div>
          <h1>Sales</h1>
          <p>Monthly and quarterly sales summary</p>
        </div>
      </div>

      <div className="sales-period-tabs">
        <button
          type="button"
          className={period === "monthly" ? "active" : ""}
          onClick={() => setPeriod("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className={period === "quarterly" ? "active" : ""}
          onClick={() => setPeriod("quarterly")}
        >
          Quarterly
        </button>
      </div>

      {errorMessage && (
        <div className="sales-error">
          {errorMessage}
        </div>
      )}

      <div className="sales-summary-grid">
        <article className="sales-summary-card">
          <span>Total Sales</span>
          <strong>
            {isLoading ? "…" : formatCurrency(totalSales)}
          </strong>
        </article>

        <article className="sales-summary-card">
          <span>Bills Generated</span>
          <strong>
            {isLoading ? "…" : totalBills}
          </strong>
        </article>
      </div>

      <div className="sales-table-card">
        {isLoading ? (
          <div className="sales-empty">Loading sales...</div>
        ) : salesRows.length === 0 ? (
          <div className="sales-empty">
            No sales found.
          </div>
        ) : (
          <table className="sales-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Bills</th>
                <th>Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{row.bills}</td>
                  <td>{formatCurrency(row.sales)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
