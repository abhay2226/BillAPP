import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import BottomNav from "../../components/BottomNav";
import "./Voicebilling.css";

function Billing() {
  /* =========================================================
     VOICE BILLING
     ========================================================= */

  const [isListening, setIsListening] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState("");
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  /* =========================================================
     BILL ITEMS
     ========================================================= */

  const [items, setItems] = useState([]);

  const [editingItemId, setEditingItemId] = useState(null);

  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemType, setItemType] = useState("");
  const [itemBrand, setItemBrand] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const [showItemPopup, setShowItemPopup] = useState(false);

  /* =========================================================
     DISCOUNT
     ========================================================= */

  const [discountPercent, setDiscountPercent] = useState(18);

  /* =========================================================
     SUCCESS SCREEN
     ========================================================= */

  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [successTotalAmount, setSuccessTotalAmount] = useState("");

  const todayBillCountRef = useRef(0);

  /* =========================================================
     PROFILE POPUP
     ========================================================= */

  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [gstID, setGstID] = useState("");

  /* =========================================================
     BILL CALCULATIONS
     ========================================================= */

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  const gst = useMemo(() => {
    return (subtotal * 18) / 100;
  }, [subtotal]);

  const subtotalWithGST = subtotal + gst;

  const discountAmount = useMemo(() => {
    return (subtotalWithGST * Number(discountPercent || 0)) / 100;
  }, [subtotalWithGST, discountPercent]);

  const grandTotal = subtotalWithGST - discountAmount;

  /* =========================================================
     VOICE RECOGNITION
     ========================================================= */

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = window.navigator.language;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const result =
        event.results[event.results.length - 1][0].transcript;

      setVoiceOutput(result);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    recognition.onerror = () => {
      setIsListening(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  /* =========================================================
     START VOICE
     ========================================================= */

  const startVoiceBilling = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    setVoiceOutput("");
    setMinutes(0);
    setSeconds(0);
    setIsListening(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setSeconds((previousSeconds) => {
        if (previousSeconds === 59) {
          setMinutes((previousMinutes) => previousMinutes + 1);
          return 0;
        }

        return previousSeconds + 1;
      });
    }, 1000);

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.log("Speech recognition already running.");
    }
  };

  /* =========================================================
     STOP VOICE
     ========================================================= */

  const stopVoiceBilling = () => {
    setIsListening(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setVoiceOutput("");
    setMinutes(0);
    setSeconds(0);
  };

  /* =========================================================
     OPEN ADD ITEM POPUP
     ========================================================= */

  const openAddItemPopup = () => {
    setEditingItemId(null);

    setItemName("");
    setItemQuantity(1);
    setItemType("");
    setItemBrand("");
    setItemPrice("");

    setShowItemPopup(true);
  };

  /* =========================================================
     CLOSE ITEM POPUP
     ========================================================= */

  const closeItemPopup = () => {
    setShowItemPopup(false);

    setEditingItemId(null);

    setItemName("");
    setItemQuantity(1);
    setItemType("");
    setItemBrand("");
    setItemPrice("");
  };

  /* =========================================================
     ADD / EDIT ITEM
     ========================================================= */

  const handleItemSubmit = (event) => {
    event.preventDefault();

    const quantity = Number(itemQuantity);
    const price = Number(itemPrice);

    if (!itemName.trim()) {
      alert("Please enter item name.");
      return;
    }

    if (!quantity || quantity < 1) {
      alert("Please enter valid quantity.");
      return;
    }

    if (price < 0 || Number.isNaN(price)) {
      alert("Please enter valid price.");
      return;
    }

    /* =====================================================
       EDIT EXISTING ITEM
       ===================================================== */

    if (editingItemId !== null) {
      setItems((previousItems) =>
        previousItems.map((item) => {
          if (item.id !== editingItemId) {
            return item;
          }

          return {
            ...item,
            name: itemName.trim(),
            quantity,
            type: itemType.trim(),
            brand: itemBrand.trim(),
            price,
            total: quantity * price,
          };
        })
      );

      closeItemPopup();
      return;
    }

    /* =====================================================
       ADD NEW ITEM
       ===================================================== */

    const newItem = {
      id: `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`,

      name: itemName.trim(),
      quantity,
      type: itemType.trim(),
      brand: itemBrand.trim(),
      price,
      total: quantity * price,
    };

    setItems((previousItems) => [
      ...previousItems,
      newItem,
    ]);

    closeItemPopup();
  };

  /* =========================================================
     DELETE ITEM
     ========================================================= */

  const deleteItem = (id) => {
    setItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );
  };

  /* =========================================================
     EDIT ITEM
     ========================================================= */

  const editItem = (item) => {
    setEditingItemId(item.id);

    setItemName(item.name);
    setItemQuantity(item.quantity);
    setItemType(item.type);
    setItemBrand(item.brand);
    setItemPrice(item.price);

    setShowItemPopup(true);
  };

  /* =========================================================
     GENERATE BILL
     ========================================================= */

  const generateBill = () => {
    if (items.length === 0) {
      alert("No bill items to generate a bill.");
      return;
    }

    setSuccessTotalAmount(`₹${grandTotal.toFixed(2)}`);

    const date = new Date();

    const days = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ];

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedDate =
      `${days[date.getDay()]}, ` +
      `${date.getDate()} ` +
      `${months[date.getMonth()]} ` +
      `${date.getFullYear()}`;

    setBillDate(formattedDate);

    todayBillCountRef.current += 1;

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const generatedBillNumber =
      `${year}${month}${day}-` +
      `${String(todayBillCountRef.current).padStart(
        4,
        "0"
      )}`;

    setBillNumber(generatedBillNumber);

    setShowSuccessScreen(true);
  };

  /* =========================================================
     SHARE RECEIPT
     ========================================================= */

  const shareReceipt = () => {
    const message =
      "Here is your bill receipt.";

    const whatsappURL =
      "https://wa.me/?text=" +
      encodeURIComponent(message);

    window.open(whatsappURL, "_blank");
  };

  /* =========================================================
     PRINT BILL
     ========================================================= */

  const printBill = () => {
    window.print();
  };

  /* =========================================================
     NEW BILL
     ========================================================= */

  const createNewBill = () => {
    setShowSuccessScreen(false);

    setItems([]);

    setEditingItemId(null);

    setItemName("");
    setItemQuantity(1);
    setItemType("");
    setItemBrand("");
    setItemPrice("");

    setVoiceOutput("");

    setMinutes(0);
    setSeconds(0);

    setDiscountPercent(18);

    setSuccessTotalAmount("");
    setBillNumber("");
    setBillDate("");
  };

  /* =========================================================
     PROFILE
     ========================================================= */

  const openProfilePopup = () => {
    setShowProfilePopup(true);
  };

  const closeProfilePopup = () => {
    setShowProfilePopup(false);
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();

    setShowProfilePopup(false);
  };

  /* =========================================================
     RETURN
     ========================================================= */

  return (
    <div className="billing-page">

      <Header />

      <div className="billing-layout">

        <Sidebar />

        <main className="billing-main">

          {!showSuccessScreen ? (

            /* =================================================
               BILLING SCREEN
               ================================================= */

            <div
              id="voiceBillingView"
              className="voice-billing-view"
            >

              {/* ================= VOICE SECTION ================= */}

              <section className="voice-section">

                {!isListening ? (

                  <div className="voice-button-container">

                    <button
                      className="voice-button"
                      type="button"
                      onClick={startVoiceBilling}
                      aria-label="Start voice billing"
                    >
                      <img
                        src="/assets/icons/microphone.png"
                        alt="Voice"
                      />
                    </button>

                    <div className="voice-button-static">
                      <span>Tap to speak</span>
                    </div>

                  </div>

                ) : (

                  <div className="voice-button-container">

                    <button
                      className="voice-button"
                      type="button"
                      aria-label="Listening"
                    >
                      <img
                        src="/assets/icons/microphone.png"
                        alt="Listening"
                      />
                    </button>

                    <div className="voice-button-use">

                      <div className="listening-timer-container">

                        <span className="voice-text">
                          Listening
                        </span>

                        <span className="listening-timer">
                          {String(minutes).padStart(2, "0")}
                        </span>

                        <span>:</span>

                        <span className="listening-timer">
                          {String(seconds).padStart(2, "0")}
                        </span>

                      </div>

                      <button
                        id="stopVoiceButton"
                        type="button"
                        onClick={stopVoiceBilling}
                      >
                        Stop
                      </button>

                    </div>

                  </div>

                )}

              </section>

              {/* ================= VOICE OUTPUT ================= */}

              <section className="voice-output-section">

                <div className="voice-output-container">

                  <span className="voice-output-label">
                    WHAT I HEARD
                  </span>

                  <p className="voice-output-text">
                    {voiceOutput}
                  </p>

                  <div className="inventory-status">

                    <div className="item-found">
                      <span>
                        Matched with inventory
                      </span>
                    </div>

                    <div className="item-not-found">
                      <span>
                        Item not found
                      </span>
                    </div>

                  </div>

                </div>

              </section>

              {/* ================= BILL CONTAINER ================= */}

              <section className="bill-container">

                {/* BILL HEADER */}

                <div className="bill-header">

                  <h2>Bill Items</h2>

                  <div className="add-item-button-container">

                    <img
                      src="/assets/icons/plus2.png"
                      alt=""
                    />

                    <button
                      className="add-item-button"
                      type="button"
                      onClick={openAddItemPopup}
                    >
                      Add Item manually
                    </button>

                  </div>

                </div>

                {/* BILL TABLE */}

                <div className="bill-table-container">

                  <table className="bill-table">

                    <thead>

                      <tr>
                        <th style={{ width: "12%" }}>
                          Qty
                        </th>

                        <th style={{ width: "32%" }}>
                          Item
                        </th>

                        <th style={{ width: "16%" }}>
                          Price
                        </th>

                        <th style={{ width: "16%" }}>
                          Total
                        </th>

                        <th style={{ width: "24%" }}>
                          Actions
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {items.length === 0 ? (

                        <tr>

                          <td
                            colSpan="5"
                            className="empty-bill-cell"
                          >
                            No bill items yet. Use Add
                            Item or voice billing.
                          </td>

                        </tr>

                      ) : (

                        items.map((item) => (

                          <tr key={item.id}>

                            <td className="quantity-cell">
                              {item.quantity}
                            </td>

                            <td>

                              <strong>
                                {item.name}
                              </strong>

                              <br />

                              <span className="item-description">
                                ({item.type} - {item.brand})
                              </span>

                            </td>

                            <td className="price-cell">
                              ₹{item.price.toFixed(2)}
                            </td>

                            <td className="total-cell">
                              ₹{item.total.toFixed(2)}
                            </td>

                            <td>

                              <div className="row-actions">

                                <button
                                  className="edit-item-button"
                                  type="button"
                                  onClick={() =>
                                    editItem(item)
                                  }
                                  aria-label={`Edit ${item.name}`}
                                >
                                  <img
                                    src="/assets/icons/pencil.png"
                                    alt=""
                                  />
                                </button>

                                <button
                                  className="delete-item-button"
                                  type="button"
                                  onClick={() =>
                                    deleteItem(item.id)
                                  }
                                  aria-label={`Remove ${item.name}`}
                                >
                                  <img
                                    src="/assets/icons/delete.png"
                                    alt=""
                                  />
                                </button>

                              </div>

                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>

                {/* ================= SUMMARY ================= */}

                <div className="bill-summary">

                  <div className="summary-row">

                    <span>
                      Subtotal
                    </span>

                    <span>
                      ₹{subtotal.toFixed(2)}
                    </span>

                  </div>

                  <div className="summary-row">

                    <span>
                      GST (18%)
                    </span>

                    <span>
                      ₹{gst.toFixed(2)}
                    </span>

                  </div>

                  <div className="summary-row discount-row">

                    <div className="discount-button">

                      <span>
                        Discount
                      </span>

                      <input
                        id="discount-per"
                        className="discount-input"
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(event) =>
                          setDiscountPercent(
                            Number(event.target.value)
                          )
                        }
                      />

                      <span>%</span>

                      <img
                        src="/assets/icons/pencil.png"
                        alt=""
                      />

                    </div>

                    <span>
                      ₹{discountAmount.toFixed(2)}
                    </span>

                  </div>

                  <div className="summary-line"></div>

                  <div className="grand-total-row">

                    <span className="grand-total-label">
                      Grand Total
                    </span>

                    <span className="grand-total-price">
                      ₹{grandTotal.toFixed(2)}
                    </span>

                  </div>

                </div>

                {/* ================= ACTIONS ================= */}

                <div className="bill-actions">

                  <button
                    className="bill-action-button"
                    type="button"
                    onClick={printBill}
                  >
                    <img
                      src="/assets/icons/printing.png"
                      alt=""
                    />

                    <span>
                      Print
                    </span>
                  </button>

                  <button
                    className="bill-action-button"
                    type="button"
                    onClick={shareReceipt}
                  >
                    <img
                      src="/assets/icons/share.png"
                      alt=""
                    />

                    <span>
                      WhatsApp
                    </span>
                  </button>

                </div>

                {/* ================= GENERATE BILL ================= */}

                <div className="new-bill-container">

                  <button
                    className="new-bill"
                    type="button"
                    onClick={generateBill}
                  >
                    <p>
                      Generate Bill
                    </p>
                  </button>

                </div>

                <div className="footer-gap"></div>

                <div className="footer-section">
                  <footer>
                    <span>
                      Copyright @2026
                    </span>
                  </footer>
                </div>

              </section>

            </div>

          ) : (

            /* =================================================
               BILL SUCCESS SCREEN
               ================================================= */

            <main
              id="billSuccessScreen"
              className="mobile-screen"
            >

              {/* ================= SUCCESS ================= */}

              <section className="success">

                <div className="success-outer-circle">

                  <div className="success-icon">

                    <img
                      src="/assets/icons/check (1).png"
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
                    src="/assets/icons/bill.png"
                    alt="Receipt"
                  />

                </button>

              </section>

              {/* ================= ACTIONS ================= */}

              <section className="action-list">

                <button
                  className="action-item"
                  type="button"
                  onClick={shareReceipt}
                >

                  <div className="action-left">

                    <div className="action-icon">

                      <img
                        src="/assets/icons/share.png"
                        alt="Share"
                      />

                    </div>

                    <p>
                      Share Receipt
                    </p>

                  </div>

                  <div className="arrow">

                    <img
                      src="/assets/icons/chevron.png"
                      alt="Next"
                    />

                  </div>

                </button>

                <button
                  className="action-item"
                  type="button"
                  onClick={printBill}
                >

                  <div className="action-left">

                    <div className="action-icon">

                      <img
                        src="/assets/icons/printing.png"
                        alt="Print"
                      />

                    </div>

                    <p>
                      Print Bill
                    </p>

                  </div>

                  <div className="arrow">

                    <img
                      src="/assets/icons/chevron.png"
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
                  onClick={createNewBill}
                >

                  <img
                    src="/assets/icons/add (2).png"
                    alt="Add"
                  />

                  <p>
                    New Bill
                  </p>

                </button>

              </div>

            </main>

          )}

        </main>

      </div>

      {/* =====================================================
         ADD / EDIT ITEM POPUP
         ===================================================== */}

      {showItemPopup && (

        <div
          className="billing-popup-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeItemPopup();
            }
          }}
        >

          <div className="pop-up">

            <h2>
              {editingItemId !== null
                ? "Edit bill item"
                : "Add bill item"}
            </h2>

            <form
              id="addItemForm"
              onSubmit={handleItemSubmit}
            >

              <input
                type="text"
                placeholder="Name"
                value={itemName}
                onChange={(event) =>
                  setItemName(event.target.value)
                }
                required
              />

              <input
                type="number"
                placeholder="Quantity"
                min="1"
                value={itemQuantity}
                onChange={(event) =>
                  setItemQuantity(event.target.value)
                }
                required
              />

              <input
                type="text"
                placeholder="Type"
                value={itemType}
                onChange={(event) =>
                  setItemType(event.target.value)
                }
                required
              />

              <input
                type="text"
                placeholder="Brand"
                value={itemBrand}
                onChange={(event) =>
                  setItemBrand(event.target.value)
                }
                required
              />

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={itemPrice}
                onChange={(event) =>
                  setItemPrice(event.target.value)
                }
                required
              />

              <div className="popup-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeItemPopup}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingItemId !== null
                    ? "Save changes"
                    : "Add item"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
         PROFILE POPUP
         ===================================================== */}

      {showProfilePopup && (

        <div
          className="billing-popup-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeProfilePopup();
            }
          }}
        >

          <div className="pop-up">

            <h2>
              User Profile
            </h2>

            <form
              id="addUserForm"
              onSubmit={handleProfileSubmit}
            >

              <input
                type="text"
                placeholder="FirstName"
                value={userFirstName}
                onChange={(event) =>
                  setUserFirstName(event.target.value)
                }
                required
              />

              <input
                type="text"
                placeholder="LastName"
                value={userLastName}
                onChange={(event) =>
                  setUserLastName(event.target.value)
                }
                required
              />

              <input
                type="text"
                inputMode="numeric"
                maxLength="10"
                placeholder="Phone Number"
                value={userNumber}
                onChange={(event) =>
                  setUserNumber(event.target.value)
                }
                required
              />

              <input
                type="email"
                inputMode="email"
                placeholder="E-mail"
                value={userEmail}
                onChange={(event) =>
                  setUserEmail(event.target.value)
                }
                required
              />

              <input
                type="text"
                placeholder="GstID"
                value={gstID}
                onChange={(event) =>
                  setGstID(event.target.value)
                }
                required
              />

              <div className="popup-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeProfilePopup}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  Edit Details
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      <BottomNav />

    </div>
  );
}

export default Billing;