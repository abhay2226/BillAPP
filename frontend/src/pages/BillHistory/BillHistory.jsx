
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./BillHistory.css";

import searchIcon from "../../assets/icons/search.png";
import receiptIcon from "../../assets/icons/box.png";

const PAYMENT_BADGE_CLASS = {
  Cash: "bill-badge-success",
  Card: "bill-badge-accent",
  UPI: "bill-badge-warning",
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toFixed(2)}`;
};

const formatBillDateOnly = (isoString) => {
  const date = new Date(isoString);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatBillTimeOnly = (isoString) => {
  const date = new Date(isoString);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function BillHistory() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date-desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const loadBills = () => {
      try {
        const storedBills = JSON.parse(
          localStorage.getItem("generatedBills") || "[]"
        );

        setBills(Array.isArray(storedBills) ? storedBills : []);
      } catch (error) {
        console.error("Failed to load bill history:", error);
        setBills([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBills();

    const handleStorageChange = () => {
      loadBills();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", loadBills);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", loadBills);
    };
  }, []);

  const visibleBills = useMemo(() => {
    let result = [...bills];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((bill) => {
        return (
          String(bill.billNumber || bill.id || "")
            .toLowerCase()
            .includes(search) ||
          String(bill.customerName || "")
            .toLowerCase()
            .includes(search)
        );
      });
    }

    if (dateFrom) {
      const fromTime = new Date(dateFrom).setHours(0, 0, 0, 0);

      result = result.filter((bill) => {
        return new Date(bill.date).getTime() >= fromTime;
      });
    }

    if (dateTo) {
      const toTime = new Date(dateTo).setHours(23, 59, 59, 999);

      result = result.filter((bill) => {
        return new Date(bill.date).getTime() <= toTime;
      });
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "date-asc":
          return new Date(a.date) - new Date(b.date);

        case "date-desc":
          return new Date(b.date) - new Date(a.date);

        case "amount-asc":
          return Number(a.amount || a.grandTotal || 0) -
            Number(b.amount || b.grandTotal || 0);

        case "amount-desc":
          return Number(b.amount || b.grandTotal || 0) -
            Number(a.amount || a.grandTotal || 0);

        default:
          return 0;
      }
    });

    return result;
  }, [
    bills,
    searchTerm,
    sortOption,
    dateFrom,
    dateTo,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setSortOption("date-desc");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    dateFrom !== "" ||
    dateTo !== "";

  const viewBill = (billId) => {
    navigate(`/billing/history/${billId}`);
  };

  const printBill = (event, billId) => {
    event.stopPropagation();

    const bill = bills.find(
      (item) => String(item.id) === String(billId)
    );

    if (!bill) {
      return;
    }

    window.print();
  };

  return (
    <>
      <div className="main-content">
        <div className="bill-history-view">

          <div className="bill-history-header">
            <h1 className="bill-history-title">
              BILL HISTORY
            </h1>

            <span className="bill-history-count">
              {visibleBills.length} bill
              {visibleBills.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="bill-history-search-wrapper">
            <img
              className="bill-history-search-icon"
              src={searchIcon}
              alt="Search"
            />

            <input
              type="text"
              className="bill-history-search-input"
              placeholder="Search by bill number or customer"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="bill-history-controls">

            <input
              type="date"
              className="bill-history-control-input"
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(event.target.value)
              }
            />

            <input
              type="date"
              className="bill-history-control-input"
              value={dateTo}
              onChange={(event) =>
                setDateTo(event.target.value)
              }
            />

            <select
              className="bill-history-control-input"
              value={sortOption}
              onChange={(event) =>
                setSortOption(event.target.value)
              }
            >
              <option value="date-desc">
                Newest first
              </option>

              <option value="date-asc">
                Oldest first
              </option>

              <option value="amount-desc">
                Amount: high to low
              </option>

              <option value="amount-asc">
                Amount: low to high
              </option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="bill-history-clear-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}

          </div>

          <div className="bill-history-grid">

            {isLoading ? (
              <div className="bill-history-empty">
                Loading bills...
              </div>
            ) : visibleBills.length === 0 ? (
              <div className="bill-history-empty">
                {bills.length === 0
                  ? "No bills yet."
                  : "No bills match your search or filters."}
              </div>
            ) : (
              visibleBills.map((bill) => {

                const billId =
                  bill.billNumber || bill.id;

                const amount =
                  Number(
                    bill.amount ??
                    bill.grandTotal ??
                    0
                  );

                const itemCount =
                  Number(
                    bill.itemCount ??
                    (bill.items || []).reduce(
                      (total, item) =>
                        total + Number(item.quantity || 0),
                      0
                    )
                  );

                const customerName =
                  bill.customerName ||
                  "Walk-in Customer";

                const paymentMode =
                  bill.paymentMode ||
                  "Cash";

                const storeName =
                  bill.storeName ||
                  "Store 1";

                return (
                  <div
                    className="bill-history-card"
                    key={bill.id || bill.billNumber}
                  >

                    <div className="bill-history-card-top">

                      <div className="bill-history-card-id-group">

                        <img
                          className="bill-history-card-icon"
                          src={receiptIcon}
                          alt=""
                        />

                        <span className="bill-history-card-id">
                          #{billId}
                        </span>

                      </div>

                      <span
                        className={`bill-history-badge ${
                          PAYMENT_BADGE_CLASS[paymentMode] ||
                          "bill-badge-accent"
                        }`}
                      >
                        {paymentMode}
                      </span>

                    </div>

                    <p className="bill-history-card-amount">
                      {formatCurrency(amount)}
                    </p>

                    <p className="bill-history-card-customer">
                      {customerName}
                    </p>

                    <div className="bill-history-card-details">

                      <div className="bill-history-card-detail-row">
                        <span>Items</span>
                        <span>{itemCount}</span>
                      </div>

                      <div className="bill-history-card-detail-row">
                        <span>Date</span>
                        <span>
                          {formatBillDateOnly(bill.date)}
                        </span>
                      </div>

                      <div className="bill-history-card-detail-row">
                        <span>Time</span>
                        <span>
                          {formatBillTimeOnly(bill.date)}
                        </span>
                      </div>

                      <div className="bill-history-card-detail-row">
                        <span>Store</span>
                        <span>{storeName}</span>
                      </div>

                    </div>

                    <div className="bill-history-card-actions">

                      <button
                        type="button"
                        className="bill-history-card-button"
                        onClick={() =>
                          viewBill(billId)
                        }
                      >
                        View
                      </button>

                      <button
                        type="button"
                        className="bill-history-card-button"
                        onClick={(event) =>
                          printBill(event, billId)
                        }
                      >
                        Print
                      </button>

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>
      </div>
    </>
  );
}
