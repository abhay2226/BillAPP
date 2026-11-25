
import { useEffect, useMemo, useState } from "react";

import "./BillHistory.css";
import { useAuth } from "../../components/layout/AuthContext";
import useSessionDraftState from "../../useSessionDraftState";

import searchIcon from "../../assets/icons/search.png";
import receiptIcon from "../../assets/icons/box.png";

import * as billService from "../../services/billService";

const STATUS_BADGE_CLASS = {
  COMPLETED: "bill-badge-success",
  VOID: "bill-badge-warning",
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
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useSessionDraftState(
    "billHistory",
    "searchTerm",
    "",
    user?.userId
  );
  const [sortOption, setSortOption] = useSessionDraftState(
    "billHistory",
    "sortOption",
    "date-desc",
    user?.userId
  );
  const [dateFrom, setDateFrom] = useSessionDraftState(
    "billHistory",
    "dateFrom",
    "",
    user?.userId
  );
  const [dateTo, setDateTo] = useSessionDraftState(
    "billHistory",
    "dateTo",
    "",
    user?.userId
  );

  const [expandedBillId, setExpandedBillId] = useState(null);
  const [billItemsById, setBillItemsById] = useState({});
  const [loadingItemsForBillId, setLoadingItemsForBillId] = useState(null);
  const [printingBill, setPrintingBill] = useState(null);

  const loadBills = async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const data = await billService.getBillHistory();
      setBills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load bill history:", error);
      setLoadError(error.message || "Failed to load bill history.");
      setBills([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBills();

    window.addEventListener("focus", loadBills);

    return () => {
      window.removeEventListener("focus", loadBills);
    };
  }, []);

  const visibleBills = useMemo(() => {
    let result = [...bills];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      result = result.filter((bill) => {
        return (
          String(bill.invoice_number || bill.bill_id || "")
            .toLowerCase()
            .includes(search) ||
          String(bill.customer?.phone_no || "")
            .toLowerCase()
            .includes(search)
        );
      });
    }

    if (dateFrom) {
      const fromTime = new Date(dateFrom).setHours(0, 0, 0, 0);

      result = result.filter((bill) => {
        return new Date(bill.created_at).getTime() >= fromTime;
      });
    }

    if (dateTo) {
      const toTime = new Date(dateTo).setHours(23, 59, 59, 999);

      result = result.filter((bill) => {
        return new Date(bill.created_at).getTime() <= toTime;
      });
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "date-asc":
          return new Date(a.created_at) - new Date(b.created_at);

        case "date-desc":
          return new Date(b.created_at) - new Date(a.created_at);

        case "amount-asc":
          return Number(a.grand_total || 0) - Number(b.grand_total || 0);

        case "amount-desc":
          return Number(b.grand_total || 0) - Number(a.grand_total || 0);

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

  const viewBill = async (bill) => {
    const billId = bill.bill_id;

    if (expandedBillId === billId) {
      setExpandedBillId(null);
      return;
    }

    setExpandedBillId(billId);

    if (!billItemsById[billId]) {
      setLoadingItemsForBillId(billId);

      try {
        const items = await billService.getBillItems(billId);

        setBillItemsById((previous) => ({
          ...previous,
          [billId]: items,
        }));
      } catch (error) {
        console.error("Failed to load bill items:", error);
        if (error?.isSessionExpired) {
          return;
        }
        alert(error.message || "Failed to load bill items.");
      } finally {
        setLoadingItemsForBillId(null);
      }
    }
  };

  const printBill = async (event, billId) => {
    event.stopPropagation();

    const bill = bills.find(
      (item) => item.bill_id === billId
    );

    if (!bill) {
      return;
    }

    try {
      let items = billItemsById[billId];

      if (!items) {
        items = await billService.getBillItems(billId);
        setBillItemsById((previous) => ({
          ...previous,
          [billId]: items,
        }));
      }

      setPrintingBill({
        bill,
        items: Array.isArray(items) ? items : [],
      });

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.print();
          setPrintingBill(null);
        });
      });
    } catch (error) {
      console.error("Failed to load bill for printing:", error);
      if (error?.isSessionExpired) {
        return;
      }
      alert(error.message || "Failed to prepare bill for printing.");
    }
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
              placeholder="Search by bill number or customer phone"
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

          {loadError && (
            <div className="bill-history-empty">
              {loadError}
            </div>
          )}

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

                const billId = bill.bill_id;

                const amount = Number(bill.grand_total ?? 0);

                const customerName =
                  bill.customer?.phone_no ||
                  "Walk-in Customer";

                const status = bill.status || "COMPLETED";

                const isExpanded = expandedBillId === billId;
                const items = billItemsById[billId];

                return (
                  <div
                    className="bill-history-card"
                    key={billId}
                  >

                    <div className="bill-history-card-top">

                      <div className="bill-history-card-id-group">

                        <img
                          className="bill-history-card-icon"
                          src={receiptIcon}
                          alt=""
                        />

                        <span className="bill-history-card-id">
                          #{bill.invoice_number}
                        </span>

                      </div>

                      <span
                        className={`bill-history-badge ${
                          STATUS_BADGE_CLASS[status] ||
                          "bill-badge-accent"
                        }`}
                      >
                        {status}
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
                        <span>Subtotal</span>
                        <span>{formatCurrency(bill.subtotal)}</span>
                      </div>

                      <div className="bill-history-card-detail-row">
                        <span>Discount</span>
                        <span>{formatCurrency(bill.bill_discount_total)}</span>
                      </div>

                      <div className="bill-history-card-detail-row">
                        <span>Date</span>
                        <span>
                          {formatBillDateOnly(bill.created_at)}
                        </span>
                      </div>

                      <div className="bill-history-card-detail-row">
                        <span>Time</span>
                        <span>
                          {formatBillTimeOnly(bill.created_at)}
                        </span>
                      </div>

                    </div>

                    {isExpanded && (
                      <div className="bill-history-card-details">
                        {loadingItemsForBillId === billId ? (
                          <div className="bill-history-card-detail-row">
                            <span>Loading items...</span>
                          </div>
                        ) : (items || []).length === 0 ? (
                          <div className="bill-history-card-detail-row">
                            <span>No items found.</span>
                          </div>
                        ) : (
                          (items || []).map((item) => (
                            <div
                              className="bill-history-card-detail-row"
                              key={item.billItemId}
                            >
                              <span>
                                {item.productName} × {item.qty}
                              </span>
                              <span>{formatCurrency(item.lineTotal)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div className="bill-history-card-actions">

                      <button
                        type="button"
                        className="bill-history-card-button"
                        onClick={() =>
                          viewBill(bill)
                        }
                      >
                        {isExpanded ? "Hide" : "View"}
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

        {printingBill && (
          <div className="printable-bill formatted-bill printable-bill-only">
            <div className="formatted-bill-header">
              <strong>PROSHOP</strong>
              <span>Tax Invoice</span>
            </div>

            <section className="formatted-bill-meta">
              <div>
                <span>Bill Number</span>
                <strong>#{printingBill.bill.invoice_number}</strong>
              </div>
              <div>
                <span>Date</span>
                <strong>
                  {formatBillDateOnly(printingBill.bill.created_at)}
                  {" "}
                  {formatBillTimeOnly(printingBill.bill.created_at)}
                </strong>
              </div>
              <div>
                <span>Customer</span>
                <strong>
                  {printingBill.bill.customer?.phone_no || "Walk-in Customer"}
                </strong>
              </div>
            </section>

            <section className="formatted-bill-items">
              <div className="formatted-bill-item formatted-bill-item-head">
                <span>Item</span>
                <span>Qty</span>
                <span>Amount</span>
              </div>

              {printingBill.items.map((item) => (
                <div
                  className="formatted-bill-item"
                  key={item.billItemId}
                >
                  <span>{item.productName}</span>
                  <span>{item.qty}</span>
                  <span>{formatCurrency(item.lineTotal)}</span>
                </div>
              ))}
            </section>

            <section className="formatted-bill-totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatCurrency(printingBill.bill.subtotal)}</strong>
              </div>
              <div>
                <span>Discount</span>
                <strong>- {formatCurrency(printingBill.bill.bill_discount_total)}</strong>
              </div>
              <div>
                <span>GST (18%)</span>
                <strong>{formatCurrency(printingBill.bill.tax_total)}</strong>
              </div>
              <div className="formatted-bill-grand-total">
                <span>Grand Total</span>
                <strong>{formatCurrency(printingBill.bill.grand_total)}</strong>
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
