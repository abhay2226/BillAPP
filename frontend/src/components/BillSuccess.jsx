import React from "react";
import "../pages/Voicebilling/BillSuccess.css";
import checkIcon from "../../src/assets/icons/check.png";
import BillIcon from "../../src/assets/icons/bill.png";
import shareIcon from "../../src/assets/icons/share.png";
import printing from "../../src/assets/icons/printing.png";
import chevron from "../../src/assets/icons/chevron.png";
import plus from "../../src/assets/icons/plus.png";




function BillSuccess({
  billNumber,
  billDate,
  successTotalAmount,
  billItems = [],
  billSubtotal = 0,
  billDiscount = 0,
  billTax = 0,
  onShare,
  onPrint,
  onNewBill,
}) {
  const formatCurrency = (value) =>
    `₹${Number(value || 0).toFixed(2)}`;

  return (
    <div
      id="billSuccessScreen"
      className="bill-success-page"
    >

      {/* ------ SUCCESS --------*/}

      <section className="success">

        <div className="success-outer-circle">

          <div className="success-icon">

            <img
              src={checkIcon}
              alt="Success"
            />

          </div>

        </div>

        <h2>
          Bill Generated Successfully
        </h2>

        <p className="description">
          The transaction has been processed
          and recorded in your inventory system.
        </p>

      </section>

      {/* ------ BILL DETAILS ----------
          (printable-bill: this is the only part of the page
          that should show up when "Print Bill" is used)
      ---------------------------------- */}

      <div className="printable-bill formatted-bill">
        <div className="formatted-bill-header">
          <strong>PROSHOP</strong>
          <span>Tax Invoice</span>
        </div>

        <section className="bill-details">

          <article className="card">

            <strong>
              BILL NUMBER
            </strong>

            <h2>
              {billNumber}
            </h2>

          </article>

          <article className="card">

            <strong>
              DATE
            </strong>

            <h2>
              {billDate}
            </h2>

          </article>

        </section>

        <section className="formatted-bill-items">
          <div className="formatted-bill-item formatted-bill-item-head">
            <span>Item</span>
            <span>Qty</span>
            <span>Amount</span>
          </div>

          {billItems.map((item) => (
            <div
              className="formatted-bill-item"
              key={item.id}
            >
              <span>{item.name}</span>
              <span>{item.quantity}</span>
              <span>{formatCurrency(item.total)}</span>
            </div>
          ))}
        </section>

        <section className="formatted-bill-totals">
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(billSubtotal)}</strong>
          </div>
          <div>
            <span>Discount</span>
            <strong>- {formatCurrency(billDiscount)}</strong>
          </div>
          <div>
            <span>GST (18%)</span>
            <strong>{formatCurrency(billTax)}</strong>
          </div>
          <div className="formatted-bill-grand-total">
            <span>Grand Total</span>
            <strong>{successTotalAmount}</strong>
          </div>
        </section>

        {/* -------- AMOUNT --------- */}

        <section className="amount-card">

          <div className="amount-content">

            <strong>
              Total Amount Paid
            </strong>

            <h1>
              {successTotalAmount}
            </h1>

          </div>

          <button
            className="receipt-btn"
            type="button"
            aria-label="View Receipt"
          >

            <img
              src={BillIcon}
              alt="Receipt"
            />

          </button>

        </section>

      </div>

      {/* ---------- ACTIONS ---------- */}

      <section className="action-list">

        <button
          className="action-item"
          type="button"
          onClick={onShare}
        >

          <div className="action-left">

            <div className="action-icon">

              <img
                src={shareIcon}
                alt="Share"
              />

            </div>

            <p>
              Share Receipt
            </p>

          </div>

          <div className="arrow">

            <img
              src={chevron}
              alt="Next"
            />

          </div>

        </button>

        <button
          className="action-item"
          type="button"
          onClick={onPrint}
        >

          <div className="action-left">

            <div className="action-icon">

              <img
                src={printing}
                alt="Print"
              />

            </div>

            <p>
              Print Bill
            </p>

          </div>

          <div className="arrow">

            <img
              src={chevron}
              alt="Next"
            />

          </div>

        </button>

      </section>

      {/* -------NEW BILL--------- */}

      <div className="new-bill-container">

        <button
          className="new-bill"
          type="button"
          onClick={onNewBill}
        >

          <img
            src={plus}
            alt="Add"
          />

          <p>
            New Bill
          </p>

        </button>

      </div>

       {/* <div className="footer-section">


            <footer>
              <span>
                Copyright @2026
              </span>
            </footer>


          </div> */}


    </div>
  );
}

export default BillSuccess;