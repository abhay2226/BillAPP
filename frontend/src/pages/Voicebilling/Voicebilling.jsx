import { useEffect, useMemo, useRef, useState } from "react";

import BillSuccess from "../../components/BillSuccess";

import pencilIcon from "../../assets/icons/pencil.png";
import deleteIcon from "../../assets/icons/delete.png";
import micIcon from "../../assets/icons/mic.png";

import "./Voicebilling.css";

import * as inventoryService from "../../services/inventoryService";
import * as discountService from "../../services/discountService";
import * as billService from "../../services/billService";
import * as customerService from "../../services/customerService";


// ============================================================
// CONSTANTS
// ============================================================

const SILENCE_TIMEOUT = 2500;

const WALKIN_CUSTOMER_PHONE = "0000000000";

const GST_RATE = 18;


// ============================================================
// BILLING COMPONENT
// ============================================================

const Billing = () => {
  // ==========================================================
  // VOICE STATE
  // ==========================================================

  const [isListening, setIsListening] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState("");

  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const silenceTimerRef = useRef(null);

  const hasSpokenRef = useRef(false);
  const isStoppingRef = useRef(false);


  // ==========================================================
  // BILL ITEMS
  // ==========================================================

  const [items, setItems] = useState([]);

  const [editingItemId, setEditingItemId] = useState(null);

  const [itemQuantity, setItemQuantity] = useState(1);

  const [showItemPopup, setShowItemPopup] = useState(false);


  // ==========================================================
  // CUSTOMER
  // ==========================================================

  const [customerPhone, setCustomerPhone] = useState("");


  // ==========================================================
  // INVENTORY (loaded from backend)
  // ==========================================================

  const [searchTerm, setSearchTerm] = useState("");

  const [inventory, setInventory] = useState([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [loadError, setLoadError] = useState("");


  // ==========================================================
  // SUCCESS SCREEN
  // ==========================================================

  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [successTotalAmount, setSuccessTotalAmount] = useState(0);


  // ==========================================================
  // DISCOUNTS (loaded from backend)
  // ==========================================================

  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [selectedDiscountId, setSelectedDiscountId] = useState("none");


  // ==========================================================
  // LOAD INVENTORY + DISCOUNTS FROM BACKEND
  // ==========================================================

  const loadInventoryData = async () => {
    setIsLoadingInventory(true);
    setLoadError("");

    try {
      const inventoryData = await inventoryService.getInventory();
      setInventory(inventoryData);
    } catch (error) {
      console.error("Unable to load inventory data:", error);
      setLoadError(error.message || "Unable to load inventory.");
      setInventory([]);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const loadDiscounts = async () => {
    try {
      const discounts = await discountService.getActiveDiscounts();
      setAvailableDiscounts(discounts);
    } catch (error) {
      console.error("Unable to load discounts:", error);
      setAvailableDiscounts([]);
    }
  };


  // ==========================================================
  // LOAD DATA ON PAGE LOAD
  // ==========================================================

  useEffect(() => {
    loadInventoryData();
    loadDiscounts();
  }, []);


  // ==========================================================
  // SEARCHABLE INVENTORY PRODUCTS
  // ==========================================================

  const searchableInventoryProducts = useMemo(() => {
    return inventory.map((inventoryItem) => ({
      inventoryId: inventoryItem.inventory_id,
      productId: inventoryItem.product_id,
      name: inventoryItem.product?.product_name || `Product #${inventoryItem.product_id}`,
      type: inventoryItem.product?.type?.type_name || "",
      brand: inventoryItem.product?.brand?.brand_name || "",
      sellingPrice: Number(inventoryItem.selling_price),
      quantity: Number(inventoryItem.qty),
      stockStatus: inventoryItem.qty > 0 ? "Available" : "Out of Stock",
    }));
  }, [inventory]);


  // ==========================================================
  // SEARCH INVENTORY PRODUCTS
  // ==========================================================

  const searchedInventoryProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return [];
    }

    return searchableInventoryProducts.filter((product) => {
      return [
        product.name,
        product.type,
        product.brand,
        product.sellingPrice,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [searchTerm, searchableInventoryProducts]);


  // ==========================================================
  // BILL CALCULATIONS
  // (mirrors backend: discount applies to pre-tax subtotal,
  // tax is added on top afterwards)
  // ==========================================================

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
  }, [items]);


  const gst = useMemo(() => {
    return subtotal * GST_RATE / 100;
  }, [subtotal]);


  const selectedDiscount = useMemo(() => {
    if (selectedDiscountId === "none") {
      return null;
    }

    return (
      availableDiscounts.find(
        (discount) =>
          String(discount.discount_id) === String(selectedDiscountId)
      ) || null
    );
  }, [selectedDiscountId, availableDiscounts]);


  const discountAmount = useMemo(() => {
    if (!selectedDiscount) {
      return 0;
    }

    const minBill = Number(selectedDiscount.min_bill_amount || 0);

    if (subtotal < minBill) {
      return 0;
    }

    const isPercentage = selectedDiscount.discountType?.code === "PERCENT";

    const rawDiscount = isPercentage
      ? subtotal * Number(selectedDiscount.discount_value) / 100
      : Number(selectedDiscount.discount_value);

    const maxDiscount = Number(selectedDiscount.max_discount_amount || 0);

    return Math.min(rawDiscount, maxDiscount, subtotal);
  }, [selectedDiscount, subtotal]);


  const grandTotal = useMemo(() => {
    return Math.max(
      0,
      subtotal - discountAmount + gst
    );
  }, [
    subtotal,
    discountAmount,
    gst,
  ]);


  // ==========================================================
  // SILENCE TIMER
  // ==========================================================

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };


  const resetSilenceTimer = () => {
    clearSilenceTimer();

    silenceTimerRef.current = setTimeout(() => {
      if (
        recognitionRef.current &&
        !isStoppingRef.current
      ) {
        isStoppingRef.current = true;

        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error(error);
        }
      }
    }, SILENCE_TIMEOUT);
  };


  // ==========================================================
  // TIMER
  // ==========================================================

  const startTimer = () => {
    setMinutes(0);
    setSeconds(0);

    timerRef.current = setInterval(() => {
      setSeconds((previousSeconds) => {
        if (previousSeconds === 59) {
          setMinutes(
            (previousMinutes) =>
              previousMinutes + 1
          );

          return 0;
        }

        return previousSeconds + 1;
      });
    }, 1000);
  };


  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };


  // ==========================================================
  // VOICE RECOGNITION
  // ==========================================================

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser."
      );

      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error(error);
      }
    }

    clearSilenceTimer();
    stopTimer();

    const recognition = new SpeechRecognition();

    recognition.lang =
      navigator.language || "en-US";

    recognition.interimResults = true;
    recognition.continuous = true;

    hasSpokenRef.current = false;
    isStoppingRef.current = false;

    setVoiceOutput("");
    setIsListening(true);

    startTimer();

    recognition.onstart = () => {
      setIsListening(true);
      resetSilenceTimer();
    };


    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += transcript + " ";
          hasSpokenRef.current = true;
        } else {
          interimText += transcript;
        }
      }

      const output =
        `${finalText}${interimText}`.trim();

      if (output) {
        setVoiceOutput(output);
        setSearchTerm(output);
        resetSilenceTimer();
      }
    };


    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      clearSilenceTimer();
      stopTimer();
      setIsListening(false);
    };


    recognition.onend = () => {
      clearSilenceTimer();
      stopTimer();
      setIsListening(false);

      isStoppingRef.current = false;
    };


    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      console.error(
        "Unable to start speech recognition:",
        error
      );

      setIsListening(false);
      stopTimer();
    }
  };


  // ==========================================================
  // STOP LISTENING
  // ==========================================================

  const stopListening = (
    clearOutput = false
  ) => {
    clearSilenceTimer();
    stopTimer();

    isStoppingRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error(error);
      }
    }

    setIsListening(false);

    if (clearOutput) {
      setVoiceOutput("");
    }
  };


  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      stopTimer();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error(error);
        }
      }
    };
  }, []);


  // ==========================================================
  // ADD INVENTORY PRODUCT TO BILL
  // ==========================================================

  const addInventoryProductToBill = (
    inventoryProduct
  ) => {
    if (!inventoryProduct) {
      return;
    }

    const availableQuantity =
      Number(inventoryProduct.quantity || 0);

    if (availableQuantity <= 0) {
      alert("This product is out of stock.");
      return;
    }

    setItems((previousItems) => {
      const existingItem =
        previousItems.find(
          (item) =>
            String(item.inventoryId) ===
            String(inventoryProduct.inventoryId)
        );

      if (existingItem) {
        const newQuantity =
          Number(existingItem.quantity) + 1;

        if (newQuantity > availableQuantity) {
          alert(
            `Only ${availableQuantity} unit(s) available in stock.`
          );

          return previousItems;
        }

        return previousItems.map((item) => {
          if (item.id !== existingItem.id) {
            return item;
          }

          return {
            ...item,
            quantity: newQuantity,
            total:
              newQuantity *
              Number(item.price || 0),
          };
        });
      }

      const price =
        Number(
          inventoryProduct.sellingPrice || 0
        );

      const newItem = {
        id:
          `${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`,

        inventoryId:
          inventoryProduct.inventoryId,

        productId:
          inventoryProduct.productId,

        name: inventoryProduct.name,

        quantity: 1,

        type:
          inventoryProduct.type || "",

        brand:
          inventoryProduct.brand || "",

        price,

        total: price,

        maxQuantity: availableQuantity,
      };

      return [
        ...previousItems,
        newItem,
      ];
    });

    setSearchTerm("");
  };


  // ==========================================================
  // EDIT BILL ITEM (quantity only — price/name come from inventory)
  // ==========================================================

  const handleItemSubmit = () => {
    const quantity = Number(itemQuantity);

    if (
      itemQuantity === "" ||
      !Number.isFinite(quantity) ||
      quantity < 1
    ) {
      alert("Quantity must be at least 1.");
      return;
    }

    setItems((previousItems) =>
      previousItems.map((item) => {
        if (item.id !== editingItemId) {
          return item;
        }

        const maxQuantity = Number(item.maxQuantity ?? Infinity);

        if (quantity > maxQuantity) {
          alert(`Only ${maxQuantity} unit(s) available in stock.`);
          return item;
        }

        return {
          ...item,
          quantity,
          total: quantity * Number(item.price || 0),
        };
      })
    );

    closeItemPopup();
  };


  // ==========================================================
  // DELETE ITEM
  // ==========================================================

  const deleteItem = (id) => {
    setItems((previousItems) =>
      previousItems.filter(
        (item) => item.id !== id
      )
    );
  };


  // ==========================================================
  // EDIT ITEM
  // ==========================================================

  const editItem = (item) => {
    setEditingItemId(item.id);
    setItemQuantity(item.quantity);
    setShowItemPopup(true);
  };


  // ==========================================================
  // CLOSE ITEM POPUP
  // ==========================================================

  const closeItemPopup = () => {
    setShowItemPopup(false);
    setEditingItemId(null);
    setItemQuantity(1);
  };


  const editingItem = items.find((item) => item.id === editingItemId);


  // ==========================================================
  // GENERATE BILL
  // ==========================================================

  const generateBill = async () => {
    if (items.length === 0) {
      alert(
        "Please add at least one item before generating the bill."
      );

      return;
    }

    if (items.some((item) => !item.inventoryId)) {
      alert(
        "Some items are not linked to inventory and cannot be billed."
      );

      return;
    }

    setIsSubmittingBill(true);

    try {
      const phone = customerPhone.trim() || WALKIN_CUSTOMER_PHONE;

      const customer = await customerService.findOrCreateCustomer(phone);

      const billItems = items.map((item) => ({
        inventory_id: item.inventoryId,
        qty: item.quantity,
      }));

      const taxTotal = Math.round(gst * 100) / 100;

      const bill = await billService.createBill({
        customer_id: customer.customer_id,
        items: billItems,
        discount_id: selectedDiscount ? selectedDiscount.discount_id : null,
        tax_total: taxTotal,
      });

      setBillNumber(bill.invoice_number);
      setBillDate(new Date(bill.created_at).toLocaleString());
      setSuccessTotalAmount(Number(bill.grand_total));

      setShowSuccessScreen(true);

      // Stock has changed on the server — refresh local inventory.
      loadInventoryData();
    } catch (error) {
      console.error("Failed to generate bill:", error);
      alert(error.message || "Failed to generate bill.");
    } finally {
      setIsSubmittingBill(false);
    }
  };


  // ==========================================================
  // SHARE RECEIPT
  // ==========================================================

  const shareReceipt = () => {
    const message =
      "Here is your bill receipt.";

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank"
    );
  };


  // ==========================================================
  // PRINT BILL
  // ==========================================================

  const printBill = () => {
    window.print();
  };


  // ==========================================================
  // CREATE NEW BILL
  // ==========================================================

  const createNewBill = () => {
    setItems([]);

    setSearchTerm("");

    setVoiceOutput("");

    setSelectedDiscountId("none");

    setCustomerPhone("");

    setShowSuccessScreen(false);

    setBillNumber("");
    setBillDate("");
    setSuccessTotalAmount(0);

    closeItemPopup();
  };


  // ==========================================================
  // SUCCESS SCREEN
  // ==========================================================

  if (showSuccessScreen) {
    return (
      <BillSuccess
        billNumber={billNumber}
        billDate={billDate}
        successTotalAmount={`₹${successTotalAmount.toFixed(2)}`}
        onNewBill={createNewBill}
        onShare={shareReceipt}
        onPrint={printBill}
      />
    );
  }


  // ==========================================================
  // JSX
  // ==========================================================

  return (
    <main className="main-content">

      <div className="voice-billing-view">

        {loadError && (
          <div className="bill-product-search-empty">
            {loadError}
          </div>
        )}

        {/* ==================================================
            VOICE SECTION
        ================================================== */}

        <section className="voice-section">

          {!isListening ? (
            <>
              <button
                type="button"
                className="voice-button"
                onClick={startListening}
              >
                <img
                  src={micIcon}
                  alt="Microphone"
                />
              </button>

              <div className="voice-button-static">
                Tap to speak
              </div>
            </>
          ) : (
            <div className="voice-listening-container">

              <button
                type="button"
                className="voice-button listening"
                onClick={() =>
                  stopListening(true)
                }
              >
                <img
                  src="/assets/icons/microphone.png"
                  alt="Microphone"
                />
              </button>

              <div className="voice-timer">
                {String(minutes).padStart(2, "0")}
                :
                {String(seconds).padStart(2, "0")}
              </div>

              <button
                type="button"
                className="voice-stop-button"
                onClick={() =>
                  stopListening(false)
                }
              >
                Stop
              </button>

            </div>
          )}

        </section>


        {/* ==================================================
            VOICE OUTPUT
        ================================================== */}

        <section className="voice-output-section">

          <div className="voice-output-container">

            <h3>
              WHAT I HEARD
            </h3>

            <p>
              {voiceOutput ||
                "Start speaking to create your bill."}
            </p>

          </div>


          {voiceOutput && (
            <div className="inventory-status">

              <div className="inventory-status-item">
                <strong>
                  {searchedInventoryProducts.length > 0
                    ? "Matched with inventory"
                    : "Item not found"}
                </strong>
              </div>

            </div>
          )}

        </section>


        {/* ==================================================
            INVENTORY PRODUCT SEARCH
        ================================================== */}

        <section className="bill-search-section">

          <input
            type="text"
            className="bill-search-input"
            placeholder={
              isLoadingInventory
                ? "Loading inventory..."
                : "Search bill items..."
            }
            value={searchTerm}
            disabled={isLoadingInventory}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />


          {/* ==================================================
              SEARCH RESULTS
          ================================================== */}

          {searchTerm.trim() && (
            <div className="bill-product-search-results">

              {searchedInventoryProducts.length > 0 ? (
                searchedInventoryProducts.map(
                  (product) => (
                    <div
                      className="bill-product-search-card"
                      key={product.inventoryId}
                    >

                      <div className="bill-product-search-info">

                        <h4>
                          {product.name}
                        </h4>

                        <p>
                          {product.type
                            ? product.type
                            : "No type"}

                          {" • "}

                          {product.brand
                            ? product.brand
                            : "No brand"}
                        </p>

                        <div className="bill-product-search-details">

                          <strong>
                            ₹
                            {product.sellingPrice.toFixed(
                              2
                            )}
                          </strong>

                          <span>
                            Qty:{" "}
                            {product.quantity}
                          </span>

                          <span
                            className={
                              product.quantity > 0
                                ? "stock-available"
                                : "stock-out"
                            }
                          >
                            {product.stockStatus}
                          </span>

                        </div>

                      </div>


                      <button
                        type="button"
                        className="bill-product-add-button"
                        disabled={
                          product.quantity <= 0
                        }
                        onClick={() =>
                          addInventoryProductToBill(
                            product
                          )
                        }
                      >
                        Add
                      </button>

                    </div>
                  )
                )
              ) : (
                <div className="bill-product-search-empty">
                  No matching inventory product found.
                </div>
              )}

            </div>
          )}

        </section>


        {/* ==================================================
            BILL CONTAINER
        ================================================== */}

        <section className="bill-container">

          <div className="bill-header">

            <h2>
              Bill Items
            </h2>

          </div>


          {/* ==================================================
              CUSTOMER
          ================================================== */}

          <div className="popup-field">
            <label htmlFor="customer-phone">
              Customer Phone (optional)
            </label>

            <input
              id="customer-phone"
              type="text"
              inputMode="numeric"
              placeholder="Walk-in customer"
              value={customerPhone}
              onChange={(event) =>
                setCustomerPhone(event.target.value)
              }
            />
          </div>


          {/* ==================================================
              DESKTOP TABLE
          ================================================== */}

          <div className="bill-table-container">

            <table className="bill-table">

              <thead>
                <tr>
                  <th>Qty</th>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id}>

                      <td>
                        {item.quantity}
                      </td>

                      <td>
                        <div className="bill-item-name">
                          {item.name}
                        </div>

                        {(item.type ||
                          item.brand) && (
                          <div className="bill-item-details">
                            (
                            {item.type || "N/A"}
                            {" - "}
                            {item.brand || "N/A"}
                            )
                          </div>
                        )}
                      </td>

                      <td>
                        ₹
                        {Number(
                          item.price
                        ).toFixed(2)}
                      </td>

                      <td>
                        ₹
                        {Number(
                          item.total
                        ).toFixed(2)}
                      </td>

                      <td>

                        <div className="bill-item-actions">

                          <button
                            type="button"
                            className="bill-edit-button"
                            onClick={() =>
                              editItem(item)
                            }
                          >
                            <img
                              src={pencilIcon}
                              alt="Edit"
                            />
                          </button>

                          <button
                            type="button"
                            className="bill-delete-button"
                            onClick={() =>
                              deleteItem(item.id)
                            }
                          >
                            <img
                              src={deleteIcon}
                              alt="Delete"
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="bill-empty-row"
                    >
                      No items added to the bill.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>


          {/* ==================================================
              MOBILE BILL CARDS
          ================================================== */}

          <div className="voice-bill-cards-container">

            {items.length > 0 ? (
              items.map((item) => (
                <div
                  className="voice-bill-card"
                  key={item.id}
                >

                  <div className="voice-bill-card-header">
                    <strong>
                      {item.name}
                    </strong>

                    <div className="bill-item-actions">

                      <button
                        type="button"
                        className="bill-edit-button"
                        onClick={() =>
                          editItem(item)
                        }
                      >
                        <img
                          src={pencilIcon}
                          alt="Edit"
                        />
                      </button>

                      <button
                        type="button"
                        className="bill-delete-button"
                        onClick={() =>
                          deleteItem(item.id)
                        }
                      >
                        <img
                          src={deleteIcon}
                          alt="Delete"
                        />
                      </button>

                    </div>

                  </div>


                  {(item.type ||
                    item.brand) && (
                    <div className="voice-bill-card-details">
                      {item.type || "N/A"}
                      {" - "}
                      {item.brand || "N/A"}
                    </div>
                  )}


                  <div className="voice-bill-card-row">

                    <span>
                      Quantity
                    </span>

                    <strong>
                      {item.quantity}
                    </strong>

                  </div>


                  <div className="voice-bill-card-row">

                    <span>
                      Price
                    </span>

                    <strong>
                      ₹
                      {Number(
                        item.price
                      ).toFixed(2)}
                    </strong>

                  </div>


                  <div className="voice-bill-card-row">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {Number(
                        item.total
                      ).toFixed(2)}
                    </strong>

                  </div>

                </div>
              ))
            ) : (
              <div className="voice-bill-empty-card">
                No items added to the bill.
              </div>
            )}

          </div>


          {/* ==================================================
              BILL SUMMARY
          ================================================== */}

          <div className="bill-summary">

            <div className="bill-summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {subtotal.toFixed(2)}
              </strong>

            </div>


            <div className="bill-summary-row">

              <span>
                Discount
              </span>

              <strong>
                ₹
                {discountAmount.toFixed(2)}
              </strong>

            </div>


            <div className="bill-summary-row">

              <span>
                GST ({GST_RATE}%)
              </span>

              <strong>
                ₹
                {gst.toFixed(2)}
              </strong>

            </div>


            <div className="bill-discount-section">

              <label htmlFor="bill-discount">
                Select Discount
              </label>

              <select
                id="bill-discount"
                value={selectedDiscountId}
                onChange={(event) =>
                  setSelectedDiscountId(
                    event.target.value
                  )
                }
              >

                <option value="none">
                  No discount
                </option>

                {availableDiscounts.map(
                  (discount) => (
                    <option
                      key={discount.discount_id}
                      value={discount.discount_id}
                    >
                      {discount.discount_name}
                    </option>
                  )
                )}

              </select>

            </div>


            <div className="bill-summary-grand-total">

              <span>
                Grand Total
              </span>

              <strong>
                ₹
                {grandTotal.toFixed(2)}
              </strong>

            </div>

          </div>


          {/* ==================================================
              GENERATE BILL
          ================================================== */}

          <div className="bill-action-section">

            <button
              type="button"
              className="generate-bill-button"
              onClick={generateBill}
              disabled={isSubmittingBill}
            >
              {isSubmittingBill ? "Generating..." : "Generate Bill"}
            </button>

          </div>

        </section>

      </div>


      {/* ======================================================
          EDIT ITEM POPUP
      ====================================================== */}

      {showItemPopup && editingItem && (
        <div className="billing-popup-overlay">

          <div className="pop-up">

            <h2>
              Edit bill item
            </h2>


            <div className="popup-form">

              <div className="popup-field">
                <label>Name</label>
                <input type="text" value={editingItem.name} disabled />
              </div>

              <div className="popup-field">

                <label>
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  max={editingItem.maxQuantity}
                  value={itemQuantity}
                  onChange={(event) =>
                    setItemQuantity(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="popup-field">
                <label>Price</label>
                <input
                  type="number"
                  value={editingItem.price}
                  disabled
                />
              </div>

            </div>


            <div className="popup-buttons">

              <button
                type="button"
                onClick={closeItemPopup}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleItemSubmit}
              >
                Save changes
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
};


export default Billing;
