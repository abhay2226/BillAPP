import { useEffect, useMemo, useRef, useState } from "react";

import BillSuccess from "../../components/BillSuccess";

import pencilIcon from "../../assets/icons/pencil.png";
import deleteIcon from "../../assets/icons/delete.png";
import micIcon from "../../assets/icons/mic.png";

import "./Voicebilling.css";

const SILENCE_TIMEOUT = 2500;

function Billing() {
  /*
      VOICE BILLING
  */
  const [isListening, setIsListening] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState("");
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const hasSpokenRef = useRef(false);

  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  /*
      BILL ITEMS
  */
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);

  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemType, setItemType] = useState("");
  const [itemBrand, setItemBrand] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const [showItemPopup, setShowItemPopup] = useState(false);

  /*
      DISCOUNT
  */
  const [discountPercent, setDiscountPercent] = useState(18);

  /*
      SUCCESS SCREEN DATA
  */
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [successTotalAmount, setSuccessTotalAmount] = useState("");

  const todayBillCountRef = useRef(0);

  /*
      BILL CALCULATIONS
  */
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

  /*
      VOICE RECOGNITION & TIMER
  */
  useEffect(() => {
    if (isListening) {
      timerRef.current = setInterval(() => {
        setSeconds((prevSec) => {
          if (prevSec === 59) {
            setMinutes((prevMin) => prevMin + 1);
            return 0;
          }
          return prevSec + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setMinutes(0);
      setSeconds(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearSilenceTimer();
    };
  }, [isListening]);

  const resetSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      stopVoiceBilling({ clearOutput: true });
    }, SILENCE_TIMEOUT);
  };

  /*
      START / STOP VOICE
  */
  const isStoppingRef = useRef(false);


  const startVoiceBilling = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    isStoppingRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    clearSilenceTimer();

    hasSpokenRef.current = false;
    setVoiceOutput("");
    setMinutes(0);
    setSeconds(0);

    const recognition = new SpeechRecognition();

    recognition.lang = window.navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      hasSpokenRef.current = true;

      if (isStoppingRef.current) return;

      let interimTranscript = "";
      let finalTranscript = "";

      // Corrected spelling: length and transcript
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setVoiceOutput((finalTranscript + interimTranscript).trim());
      resetSilenceTimer();
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        stopVoiceBilling({ clearOutput: true });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      clearSilenceTimer();
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  };

  const stopVoiceBilling = (options = {}) => {

    isStoppingRef.current = true;
    clearSilenceTimer();
    const clearOutput = typeof options?.clearOutput === "boolean" ? options.clearOutput : true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    setIsListening(false);
    setMinutes(0);
    setSeconds(0);

    if (clearOutput) {
      setVoiceOutput("");
    }
  };

  /*
      ADD / EDIT / DELETE ITEMS
  */
  const openAddItemPopup = () => {
    setEditingItemId(null);
    setItemName("");
    setItemQuantity(1);
    setItemType("");
    setItemBrand("");
    setItemPrice("");
    setShowItemPopup(true);
  };

  const closeItemPopup = () => {
    setShowItemPopup(false);
    setEditingItemId(null);
    setItemName("");
    setItemQuantity(1);
    setItemType("");
    setItemBrand("");
    setItemPrice("");
  };

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

    if (editingItemId !== null) {
      setItems((previousItems) =>
        previousItems.map((item) => {
          if (item.id !== editingItemId) return item;
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

    const newItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: itemName.trim(),
      quantity,
      type: itemType.trim(),
      brand: itemBrand.trim(),
      price,
      total: quantity * price,
    };

    setItems((previousItems) => [...previousItems, newItem]);
    closeItemPopup();
  };

  const deleteItem = (id) => {
    setItems((previousItems) => previousItems.filter((item) => item.id !== id));
  };

  const editItem = (item) => {
    setEditingItemId(item.id);
    setItemName(item.name);
    setItemQuantity(item.quantity);
    setItemType(item.type);
    setItemBrand(item.brand);
    setItemPrice(item.price);
    setShowItemPopup(true);
  };

  /*
      GENERATE / PRINT / SHARE
  */
  const generateBill = () => {
    if (items.length === 0) {
      alert("No bill items to generate a bill.");
      return;
    }

    setSuccessTotalAmount(`₹${grandTotal.toFixed(2)}`);

    const date = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formattedDate = `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    setBillDate(formattedDate);

    todayBillCountRef.current += 1;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const generatedBillNumber = `${year}${month}${day}-${String(todayBillCountRef.current).padStart(4, "0")}`;
    setBillNumber(generatedBillNumber);

    setShowSuccessScreen(true);
  };

  const shareReceipt = () => {
    const message = "Here is your bill receipt.";
    const whatsappURL = "https://wa.me/?text=" + encodeURIComponent(message);
    window.open(whatsappURL, "_blank");
  };

  const printBill = () => {
    window.print();
  };

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

  return (
    <>
      <div className="main-content">
        {!showSuccessScreen ? (
          <div id="voiceBillingView" className="voice-billing-view">
            {/* ----- VOICE SECTION ------ */}
            <section className="voice-section">
              {!isListening ? (
                <div className="voice-button-container">
                  <button
                    className="voice-button"
                    type="button"
                    onClick={startVoiceBilling}
                    aria-label="Start voice billing"
                  >
                    <img src={micIcon} alt="Voice" />
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
                    <img src="/assets/icons/microphone.png" alt="Listening" />
                  </button>
                  <div className="voice-button-use">
                    <div className="listening-timer-container">
                      <span className="voice-text">Listening</span>
                      <div className="listening-timer-content">
                        <span className="listening-timer">
                          {String(minutes).padStart(2, "0")}
                        </span>
                        <span>:</span>
                        <span className="listening-timer">
                          {String(seconds).padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                    <button
                      id="stopVoiceButton"
                      type="button"
                      onClick={() => stopVoiceBilling({ clearOutput: true })}
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
                <span className="voice-output-label">WHAT I HEARD</span>
                <p className="voice-output-text">{voiceOutput || "Say items to add..."}</p>
                {voiceOutput.trim() && (
                  <div className="inventory-status">
                    <div className="item-found">
                      <span>Matched with inventory</span>
                    </div>
                    <div className="item-not-found">
                      <span>Item not found</span>
                    </div>
                  </div>
                )}
                
              </div>
            </section>

            {/* ------------ BILL CONTAINER ---------- */}
            <section className="bill-container">
              <div className="bill-header">
                <h2>Bill Items</h2>
                <div className="add-item-button-container">
                  <img src="/assets/icons/plus2.png" alt="" />
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
                      <th style={{ width: "12%" }}>Qty</th>
                      <th style={{ width: "32%" }}>Item</th>
                      <th style={{ width: "16%" }}>Price</th>
                      <th style={{ width: "16%" }}>Total</th>
                      <th style={{ width: "24%" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="empty-bill-cell">
                          No bill items yet. Use Add Item or voice billing.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id}>
                          <td className="quantity-cell">{item.quantity}</td>
                          <td>
                            <strong>{item.name}</strong>
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
                                onClick={() => editItem(item)}
                                aria-label={`Edit ${item.name}`}
                              >
                                <img src={pencilIcon} alt="Edit" />
                              </button>
                              <button
                                className="delete-item-button"
                                type="button"
                                onClick={() => deleteItem(item.id)}
                                aria-label={`Remove ${item.name}`}
                              >
                                <img src={deleteIcon} alt="Delete" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* BILL CARDS (Mobile) */}
              <div className="voice-bill-cards-container">
                {items.length === 0 ? (
                  <div className="voice-empty-bill-cell">
                    No bill items yet. Use Add Item or voice billing.
                  </div>
                ) : (
                  items.map((item) => (
                    <div className="voice-bill-card" key={item.id}>
                      <div className="voice-bill-card-header">
                        <strong>{item.name}</strong>
                        <div className="voice-row-actions">
                          <button
                            className="voice-edit-item-button"
                            type="button"
                            onClick={() => editItem(item)}
                            aria-label={`Edit ${item.name}`}
                          >
                            <img src={pencilIcon} alt="Edit" />
                          </button>
                          <button
                            className="voice-delete-item-button"
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                          >
                            <img src={deleteIcon} alt="Delete" />
                          </button>
                        </div>
                      </div>

                      <div className="voice-bill-card-row">
                        <span className="voice-bill-card-label">Type / Brand</span>
                        <span className="voice-bill-card-value">
                          {item.type} - {item.brand}
                        </span>
                      </div>

                      <div className="voice-bill-card-row">
                        <span className="voice-bill-card-label">Qty</span>
                        <span className="voice-bill-card-value">{item.quantity}</span>
                      </div>

                      <div className="voice-bill-card-row">
                        <span className="voice-bill-card-label">Price</span>
                        <span className="voice-bill-card-value">
                          ₹{item.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="voice-bill-card-row voice-bill-card-total">
                        <span className="voice-bill-card-label">Total</span>
                        <span className="voice-bill-card-value">
                          ₹{item.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* SUMMARY */}
              <div className="bill-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="summary-row discount-row">
                  <div className="discount-button">
                    <span>Discount</span>
                    <input
                      id="discount-per"
                      className="discount-input"
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(event) =>
                        setDiscountPercent(Number(event.target.value))
                      }
                    />
                    <span>%</span>
                    <img src={pencilIcon} alt="" />
                  </div>
                  <span>₹{discountAmount.toFixed(2)}</span>
                </div>
                <div className="summary-line"></div>
                <div className="grand-total-row">
                  <span className="grand-total-label">Grand Total</span>
                  <span className="grand-total-price">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="bill-actions">
                {/* <button
                  className="bill-action-button"
                  type="button"
                  onClick={printBill}
                >
                  <img src="/assets/icons/printing.png" alt="" />
                  <span>Print</span>
                </button>
                <button
                  className="bill-action-button"
                  type="button"
                  onClick={shareReceipt}
                >
                  <img src="/assets/icons/share.png" alt="" />
                  <span>WhatsApp</span>
                </button> */}
              </div>

              {/* GENERATE BILL */}
              <div className="new-bill-container">
                <button
                  className="new-bill"
                  type="button"
                  onClick={generateBill}
                >
                  <p>Generate Bill</p>
                </button>
              </div>
            </section>
          </div>
        ) : (
          <BillSuccess
            billNumber={billNumber}
            billDate={billDate}
            successTotalAmount={successTotalAmount}
            onShare={shareReceipt}
            onPrint={printBill}
            onNewBill={createNewBill}
          />
        )}
      </div>

      {/* ADD / EDIT POPUP */}
      {showItemPopup && (
        <div
          className="billing-popup-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeItemPopup();
            }
          }}
        >
          <div className="pop-up">
            <h2>
              {editingItemId !== null ? "Edit bill item" : "Add bill item"}
            </h2>
            <form id="addItemForm" onSubmit={handleItemSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                min="1"
                value={itemQuantity}
                onChange={(event) => setItemQuantity(event.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Type"
                value={itemType}
                onChange={(event) => setItemType(event.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Brand"
                value={itemBrand}
                onChange={(event) => setItemBrand(event.target.value)}
                required
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={itemPrice}
                onChange={(event) => setItemPrice(event.target.value)}
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
                <button type="submit" className="primary-button">
                  {editingItemId !== null ? "Save changes" : "Add item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Billing;