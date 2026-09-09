import { useEffect, useMemo, useRef, useState } from "react";

import BillSuccess from "../../components/BillSuccess";

import pencilIcon from "../../assets/icons/pencil.png";
import deleteIcon from "../../assets/icons/delete.png";
import micIcon from "../../assets/icons/mic.png";

import "./Voicebilling.css";


// ============================================================
// CONSTANTS
// ============================================================

const SILENCE_TIMEOUT = 2500;

const INVENTORY_STORAGE_KEY = "shopkeeperInventoryData";


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

  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemType, setItemType] = useState("");
  const [itemBrand, setItemBrand] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const [showItemPopup, setShowItemPopup] = useState(false);


  // ==========================================================
  // INVENTORY SEARCH
  // ==========================================================

  const [searchTerm, setSearchTerm] = useState("");

  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [inventoryStock, setInventoryStock] = useState([]);


  // ==========================================================
  // SUCCESS SCREEN
  // ==========================================================

  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [successTotalAmount, setSuccessTotalAmount] = useState(0);

  const todayBillCountRef = useRef(0);


  // ==========================================================
  // DISCOUNTS
  // ==========================================================

  const availableDiscounts = [
    {
      id: "none",
      label: "No discount",
      type: null,
      value: 0,
      minBill: 0,
      maxDiscount: 0,
    },
    {
      id: "festival-offer",
      label: "Festival Offer — 10% (max ₹200)",
      type: "PERCENTAGE",
      value: 10,
      minBill: 500,
      maxDiscount: 200,
    },
    {
      id: "new-year-offer",
      label: "New Year Offer — Flat ₹100",
      type: "FLAT",
      value: 100,
      minBill: 1000,
      maxDiscount: 100,
    },
  ];

  const [selectedDiscountId, setSelectedDiscountId] = useState("none");


  // ==========================================================
  // LOAD INVENTORY DATA
  // ==========================================================

  const loadInventoryData = () => {
    try {
      const storedData = localStorage.getItem(INVENTORY_STORAGE_KEY);

      if (!storedData) {
        setInventoryProducts([]);
        setInventoryStock([]);
        return;
      }

      const parsedData = JSON.parse(storedData);

      setInventoryProducts(
        Array.isArray(parsedData.products)
          ? parsedData.products
          : []
      );

      setInventoryStock(
        Array.isArray(parsedData.inventory)
          ? parsedData.inventory
          : []
      );
    } catch (error) {
      console.error("Unable to load inventory data:", error);

      setInventoryProducts([]);
      setInventoryStock([]);
    }
  };


  // ==========================================================
  // LOAD INVENTORY ON PAGE LOAD
  // ==========================================================

  useEffect(() => {
    loadInventoryData();

    const handleInventoryUpdated = () => {
      loadInventoryData();
    };

    const handleStorageChange = (event) => {
      if (event.key === INVENTORY_STORAGE_KEY) {
        loadInventoryData();
      }
    };

    window.addEventListener(
      "inventoryUpdated",
      handleInventoryUpdated
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "inventoryUpdated",
        handleInventoryUpdated
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);


  // ==========================================================
  // NORMALIZE PRODUCT NAME
  // ==========================================================

  const normalizeName = (value) => {
    return String(value ?? "")
      .trim()
      .toLowerCase();
  };


  // ==========================================================
  // GET PRODUCT NAME
  // ==========================================================

  const getProductName = (product) => {
    return (
      product.product ??
      product.productName ??
      product.name ??
      ""
    );
  };


  // ==========================================================
  // GET PRODUCT ID
  // ==========================================================

  const getProductId = (product) => {
    return (
      product.productId ??
      product.product_id ??
      product.id ??
      null
    );
  };


  // ==========================================================
  // GET PRODUCT TYPE
  // ==========================================================

  const getProductType = (product) => {
    return (
      product.type ??
      product.productType ??
      ""
    );
  };


  // ==========================================================
  // GET PRODUCT BRAND
  // ==========================================================

  const getProductBrand = (product) => {
    return (
      product.brand ??
      product.productBrand ??
      ""
    );
  };


  // ==========================================================
  // MERGE PRODUCT TAB + INVENTORY TAB
  // ==========================================================

  const searchableInventoryProducts = useMemo(() => {
    const results = [];

    inventoryStock.forEach((inventoryItem) => {
      const inventoryProductName = getProductName(inventoryItem);

      let product = null;

      const inventoryProductId =
        inventoryItem.productId ??
        inventoryItem.product_id ??
        inventoryItem.id ??
        null;

      if (inventoryProductId !== null) {
        product = inventoryProducts.find(
          (productItem) => {
            const productId = getProductId(productItem);

            return (
              productId !== null &&
              String(productId) === String(inventoryProductId)
            );
          }
        );
      }

      if (!product && inventoryProductName) {
        product = inventoryProducts.find(
          (productItem) =>
            normalizeName(getProductName(productItem)) ===
            normalizeName(inventoryProductName)
        );
      }

      const name =
        getProductName(product || {}) ||
        inventoryProductName;

      const type =
        getProductType(product || {}) ||
        getProductType(inventoryItem);

      const brand =
        getProductBrand(product || {}) ||
        getProductBrand(inventoryItem);

      const sellingPrice = Number(
        inventoryItem.sellingPrice ??
        inventoryItem.price ??
        0
      );

      const quantity = Number(
        inventoryItem.quantity ??
        inventoryItem.qty ??
        0
      );

      const stockStatus =
        inventoryItem.stockStatus ??
        (quantity > 0 ? "Available" : "Out of Stock");

      results.push({
        inventoryId:
          inventoryItem.id ??
          inventoryItem.inventoryId ??
          inventoryItem.inventory_id ??
          null,

        productId:
          getProductId(product || {}) ??
          inventoryProductId,

        name,
        type,
        brand,
        sellingPrice,
        quantity,
        stockStatus,
      });
    });

    return results;
  }, [inventoryProducts, inventoryStock]);


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
  // ==========================================================

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
  }, [items]);


  const gst = useMemo(() => {
    return subtotal * 18 / 100;
  }, [subtotal]);


  const subtotalWithGST = useMemo(() => {
    return subtotal + gst;
  }, [subtotal, gst]);


  const selectedDiscount = useMemo(() => {
    return (
      availableDiscounts.find(
        (discount) =>
          discount.id === selectedDiscountId
      ) || availableDiscounts[0]
    );
  }, [selectedDiscountId]);


  const discountAmount = useMemo(() => {
    if (
      selectedDiscount.id === "none" ||
      subtotalWithGST < selectedDiscount.minBill
    ) {
      return 0;
    }

    if (selectedDiscount.type === "PERCENTAGE") {
      const calculatedDiscount =
        subtotalWithGST *
        selectedDiscount.value /
        100;

      return Math.min(
        calculatedDiscount,
        selectedDiscount.maxDiscount
      );
    }

    if (selectedDiscount.type === "FLAT") {
      return Math.min(
        selectedDiscount.value,
        subtotalWithGST
      );
    }

    return 0;
  }, [
    selectedDiscount,
    subtotalWithGST,
  ]);


  const grandTotal = useMemo(() => {
    return Math.max(
      0,
      subtotalWithGST - discountAmount
    );
  }, [
    subtotalWithGST,
    discountAmount,
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

    const productName =
      inventoryProduct.name.trim();

    setItems((previousItems) => {
      const existingItem =
        previousItems.find(
          (item) =>
            (
              item.inventoryId !== null &&
              inventoryProduct.inventoryId !== null &&
              String(item.inventoryId) ===
                String(inventoryProduct.inventoryId)
            ) ||
            (
              normalizeName(item.name) ===
              normalizeName(productName)
            )
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

        name: productName,

        quantity: 1,

        type:
          inventoryProduct.type || "",

        brand:
          inventoryProduct.brand || "",

        price,

        total: price,
      };

      return [
        ...previousItems,
        newItem,
      ];
    });

    setSearchTerm("");
  };


  // ==========================================================
  // ADD / EDIT BILL ITEM
  // ==========================================================

  const handleItemSubmit = () => {
    const name = itemName.trim();
    const quantity = Number(itemQuantity);
    const price = Number(itemPrice);

    if (!name) {
      alert("Please enter item name.");
      return;
    }

    if (
      itemQuantity === "" ||
      !Number.isFinite(quantity) ||
      quantity < 1
    ) {
      alert(
        "Quantity must be at least 1."
      );

      return;
    }

    if (
      itemPrice === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      alert(
        "Price cannot be negative."
      );

      return;
    }

    if (editingItemId !== null) {
      setItems((previousItems) =>
        previousItems.map((item) => {
          if (
            item.id !== editingItemId
          ) {
            return item;
          }

          return {
            ...item,
            name,
            quantity,
            type: itemType.trim(),
            brand: itemBrand.trim(),
            price,
            total:
              quantity * price,
          };
        })
      );
    } else {
      const newItem = {
        id:
          `${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`,

        inventoryId: null,
        productId: null,

        name,

        quantity,

        type: itemType.trim(),

        brand: itemBrand.trim(),

        price,

        total:
          quantity * price,
      };

      setItems((previousItems) => [
        ...previousItems,
        newItem,
      ]);
    }

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

    setItemName(item.name);
    setItemQuantity(item.quantity);
    setItemType(item.type || "");
    setItemBrand(item.brand || "");
    setItemPrice(item.price);

    setShowItemPopup(true);
  };


  // ==========================================================
  // CLOSE ITEM POPUP
  // ==========================================================

  const closeItemPopup = () => {
    setShowItemPopup(false);

    setEditingItemId(null);

    setItemName("");
    setItemQuantity(1);
    setItemType("");
    setItemBrand("");
    setItemPrice("");
  };


  // ==========================================================
  // GENERATE BILL
  // ==========================================================

  const generateBill = () => {
    if (items.length === 0) {
      alert(
        "Please add at least one item before generating the bill."
      );

      return;
    }

    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        now.getDate()
      ).padStart(2, "0");

    const generatedBillNumber =
      `${year}${month}${day}-` +
      `${String(
        todayBillCountRef.current + 1
      ).padStart(4, "0")}`;

    todayBillCountRef.current += 1;

    setBillNumber(
      generatedBillNumber
    );

    setBillDate(
      now.toLocaleString()
    );

    setSuccessTotalAmount(
      grandTotal
    );

    setShowSuccessScreen(true);
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
        totalAmount={successTotalAmount}
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
                  Matched with inventory
                </strong>
              </div>

              <div className="inventory-status-item">
                <strong>
                  Item not found
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
            placeholder="Search bill items..."
            value={searchTerm}
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
                      key={
                        product.inventoryId ??
                        product.productId ??
                        product.name
                      }
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
                GST (18%)
              </span>

              <strong>
                ₹
                {gst.toFixed(2)}
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

                {availableDiscounts.map(
                  (discount) => (
                    <option
                      key={discount.id}
                      value={discount.id}
                    >
                      {discount.label}
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
            >
              Generate Bill
            </button>

          </div>

        </section>

      </div>


      {/* ======================================================
          EDIT ITEM POPUP
      ====================================================== */}

      {showItemPopup && (
        <div className="billing-popup-overlay">

          <div className="pop-up">

            <h2>
              Edit bill item
            </h2>


            <div className="popup-form">

              <div className="popup-field">

                <label>
                  Name
                </label>

                <input
                  type="text"
                  value={itemName}
                  onChange={(event) =>
                    setItemName(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="popup-field">

                <label>
                  Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(event) =>
                    setItemQuantity(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="popup-field">

                <label>
                  Type
                </label>

                <input
                  type="text"
                  value={itemType}
                  onChange={(event) =>
                    setItemType(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="popup-field">

                <label>
                  Brand
                </label>

                <input
                  type="text"
                  value={itemBrand}
                  onChange={(event) =>
                    setItemBrand(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="popup-field">

                <label>
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemPrice}
                  onChange={(event) =>
                    setItemPrice(
                      event.target.value
                    )
                  }
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