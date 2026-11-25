import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import "./Sales.css";

import * as billService from "../../services/billService";
import { useAuth } from "../../components/layout/AuthContext";
import useSessionDraftState from "../../useSessionDraftState";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toFixed(2)}`;

const monthLabel = (date) =>
  date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

const dayLabel = (date) =>
  date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

export default function Sales() {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [period, setPeriod] = useSessionDraftState(
    "sales",
    "period",
    "monthly",
    user?.userId
  );
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
    const buckets = new Map();

    bills.forEach((bill) => {
      const date = new Date(bill.created_at);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      let key;
      let label;

      if (period === "daily") {
        key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`;
        label = dayLabel(date);
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        label = monthLabel(date);
      } else {
        key = String(date.getFullYear());
        label = key;
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

    return Array.from(buckets.values()).sort(
      (first, second) =>
        first.date.getTime() - second.date.getTime()
    );
  }, [bills, period]);

  const chartData = useMemo(() => {
    if (period === "daily") {
      return salesRows.slice(-31);
    }

    if (period === "monthly") {
      return salesRows.slice(-12);
    }

    return salesRows.slice(-10);
  }, [salesRows, period]);

  const totalSales = chartData.reduce(
    (sum, row) => sum + row.sales,
    0
  );
  const totalBills = chartData.reduce(
    (sum, row) => sum + row.bills,
    0
  );

  return (
    <div className="sales-page">
      <div className="sales-header">
        <div>
          <h1>Sales</h1>
          <p>Daily, monthly and yearly sales summary</p>
        </div>
      </div>

      <div className="sales-period-control">
        <label htmlFor="sales-period">Period</label>
        <select
          id="sales-period"
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className="sales-period-select"
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
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

      <div className="sales-chart-grid">
        <article className="sales-chart-card">
          <h2>Sales Trend</h2>

          {isLoading ? (
            <div className="sales-empty">Loading chart...</div>
          ) : chartData.length === 0 ? (
            <div className="sales-empty">No sales data.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Sales"]}
                  cursor={{ fill: "#edf1ef" }}
                />
                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="#008f6b"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </article>

        <article className="sales-chart-card">
          <h2>Bills Trend</h2>

          {isLoading ? (
            <div className="sales-empty">Loading chart...</div>
          ) : chartData.length === 0 ? (
            <div className="sales-empty">No bill data.</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip formatter={(value) => [value, "Bills"]} />
                <Line
                  type="monotone"
                  dataKey="bills"
                  name="Bills"
                  stroke="#f28c00"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#f28c00", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
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
