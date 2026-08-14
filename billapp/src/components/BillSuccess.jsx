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
  onShare,
  onPrint,
  onNewBill,
}) {
  return (
    <div
      id="billSuccessScreen"
      className="bill-success-page"
    >

      {/* ================= SUCCESS ================= */}

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

      {/* ================= BILL DETAILS ================= */}

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

      {/* ================= AMOUNT ================= */}

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

      {/* ================= ACTIONS ================= */}

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

      {/* ================= NEW BILL ================= */}

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