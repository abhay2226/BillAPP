import { useEffect, useMemo, useState } from "react";

import searchIcon from "../../assets/icons/search.png";
import leftIcon from "../../assets/icons/left.png";
import chevronIcon from "../../assets/icons/chevron.png";
import tickIcon from "../../assets/icons/tick.png";
import removeIcon from "../../assets/icons/remove.png";
import pencilIcon from "../../assets/icons/pencil.png";
import deleteIcon from "../../assets/icons/delete.png";
import moreIcon from "../../assets/icons/more.png";

import "./Inventory.css";

function Inventory() {
  const [activeTab, setActiveTab] = useState("product");

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [damageGoods, setDamageGoods] = useState([]);

  const [searchValue, setSearchValue] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  const [editingProductId, setEditingProductId] = useState(null);
  const [editingInventoryId, setEditingInventoryId] = useState(null);
  const [editingDamageId, setEditingDamageId] = useState(null);

  const [productActionMenuId, setProductActionMenuId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 6;

  /*
  ============================================================
  DROPDOWN MASTER VALUES
  ============================================================
  */

  const [productNames, setProductNames] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [productBrands, setProductBrands] = useState([]);
  const [units, setUnits] = useState([]);

  /*
  ============================================================
  ADD NEW DROPDOWN STATES
  ============================================================
  */

  const [addingNewType, setAddingNewType] = useState(false);
  const [addingNewBrand, setAddingNewBrand] = useState(false);
  const [addingNewUnit, setAddingNewUnit] = useState(false);

  /*
  ============================================================
  FORM DATA
  ============================================================
  */

  const [formData, setFormData] = useState({
    product: "",
    type: "",
    brand: "",
    unit: "",
    cost: "",
    sellingPrice: "",
    weight: "",
    quantity: "",
    reason: "",
    unitCost: "",
    lossValue: "",
    stockStatus: "Available",
    status: "Available",
  });

  /*
  ============================================================
  RESET FORM
  ============================================================
  */

  const resetForm = () => {
    setFormData({
      product: "",
      type: "",
      brand: "",
      unit: "",
      cost: "",
      sellingPrice: "",
      weight: "",
      quantity: "",
      reason: "",
      unitCost: "",
      lossValue: "",
      stockStatus: "Available",
      status: "Available",
    });

    setAddingNewType(false);
    setAddingNewBrand(false);
    setAddingNewUnit(false);
  };

  /*
  ============================================================
  BACK
  ============================================================
  */

  const goBack = () => {
    window.history.back();
  };

  /*
  ============================================================
  INPUT CHANGE
  ============================================================
  */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  ============================================================
  DROPDOWN CHANGE
  ============================================================
  */

  const handleProductChange = (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      product: value,
    }));
  };

  const handleTypeChange = (event) => {
    const value = event.target.value;

    if (value === "__ADD_NEW__") {
      setAddingNewType(true);

      setFormData((previous) => ({
        ...previous,
        type: "",
      }));

      return;
    }

    setAddingNewType(false);

    setFormData((previous) => ({
      ...previous,
      type: value,
    }));
  };

  const handleBrandChange = (event) => {
    const value = event.target.value;

    if (value === "__ADD_NEW__") {
      setAddingNewBrand(true);

      setFormData((previous) => ({
        ...previous,
        brand: "",
      }));

      return;
    }

    setAddingNewBrand(false);

    setFormData((previous) => ({
      ...previous,
      brand: value,
    }));
  };

  const handleUnitChange = (event) => {
    const value = event.target.value;

    if (value === "__ADD_NEW__") {
      setAddingNewUnit(true);

      setFormData((previous) => ({
        ...previous,
        unit: "",
      }));

      return;
    }

    setAddingNewUnit(false);

    setFormData((previous) => ({
      ...previous,
      unit: value,
    }));
  };

  /*
  ============================================================
  ADD NEW VALUE TO DROPDOWN
  ============================================================
  */

  const saveNewType = () => {
    const value = formData.type.trim();

    if (value === "") {
      alert("Please enter type.");
      return false;
    }

    const exists = productTypes.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (!exists) {
      setProductTypes((previous) => [...previous, value]);
    }

    return value;
  };

  const saveNewBrand = () => {
    const value = formData.brand.trim();

    if (value === "") {
      alert("Please enter brand.");
      return false;
    }

    const exists = productBrands.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (!exists) {
      setProductBrands((previous) => [...previous, value]);
    }

    return value;
  };

  const saveNewUnit = () => {
    const value = formData.unit.trim();

    if (value === "") {
      alert("Please enter unit.");
      return false;
    }

    const exists = units.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (!exists) {
      setUnits((previous) => [...previous, value]);
    }

    return value;
  };

  /*
  ============================================================
  OPEN POPUP
  ============================================================
  */

  const openPopup = () => {
    setProductActionMenuId(null);

    setEditingProductId(null);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    resetForm();

    setShowPopup(true);
  };

  /*
  ============================================================
  CLOSE POPUP
  ============================================================
  */

  const closePopup = () => {
    setShowPopup(false);

    setEditingProductId(null);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    setProductActionMenuId(null);

    resetForm();
  };

  /*
  ============================================================
  ADD PRODUCT
  ============================================================
  */

  const addProduct = () => {
    let product = formData.product.trim();
    let productType = formData.type.trim();
    let productBrand = formData.brand.trim();
    let productUnit = formData.unit.trim();

    const productWeight = formData.weight.trim();
    const productQuantity = Number(formData.quantity);

    /*
    SAVE NEW DROPDOWN VALUES
    */

    if (addingNewType) {
      const result = saveNewType();

      if (result === false) {
        return;
      }

      productType = result;
    }

    if (addingNewBrand) {
      const result = saveNewBrand();

      if (result === false) {
        return;
      }

      productBrand = result;
    }

    if (addingNewUnit) {
      const result = saveNewUnit();

      if (result === false) {
        return;
      }

      productUnit = result;
    }

    if (
      product === "" ||
      productWeight === "" ||
      formData.quantity === "" ||
      productType === "" ||
      productBrand === "" ||
      productUnit === ""
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (productQuantity < 0) {
      alert("Quantity cannot be negative.");
      return;
    }

    /*
    ============================================================
    EDIT PRODUCT
    ============================================================
    */

    if (editingProductId !== null) {
      setProducts((previousProducts) =>
        previousProducts.map((item) => {
          if (item.id === editingProductId) {
            return {
              ...item,
              product,
              weight: productWeight,
              quantity: productQuantity,
              type: productType,
              brand: productBrand,
              unit: productUnit,
            };
          }

          return item;
        }),
      );
    }

    /*
    ============================================================
    ADD PRODUCT
    ============================================================
    */

    else {
      const newProduct = {
        id: Date.now(),
        product,
        weight: productWeight,
        quantity: productQuantity,
        status: "Available",
        type: productType,
        brand: productBrand,
        unit: productUnit,
      };

      setProducts((previousProducts) => [
        ...previousProducts,
        newProduct,
      ]);
    }

    /*
    ENSURE VALUES ARE IN DROPDOWNS
    */

    if (
      !productNames.some(
        (item) => item.toLowerCase() === product.toLowerCase(),
      )
    ) {
      setProductNames((previous) => [...previous, product]);
    }

    if (
      !productTypes.some(
        (item) => item.toLowerCase() === productType.toLowerCase(),
      )
    ) {
      setProductTypes((previous) => [
        ...previous,
        productType,
      ]);
    }

    if (
      !productBrands.some(
        (item) => item.toLowerCase() === productBrand.toLowerCase(),
      )
    ) {
      setProductBrands((previous) => [
        ...previous,
        productBrand,
      ]);
    }

    if (
      !units.some(
        (item) => item.toLowerCase() === productUnit.toLowerCase(),
      )
    ) {
      setUnits((previous) => [...previous, productUnit]);
    }

    closePopup();
  };

  /*
  ============================================================
  ADD INVENTORY
  ============================================================
  */

  const addInventory = () => {
    const product = formData.product.trim();
    const cost = Number(formData.cost);
    const sellingPrice = Number(formData.sellingPrice);
    const weight = formData.weight.trim();
    const quantity = Number(formData.quantity);

    if (
      product === "" ||
      formData.cost === "" ||
      formData.sellingPrice === "" ||
      weight === "" ||
      formData.quantity === ""
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (
      cost < 0 ||
      sellingPrice < 0 ||
      quantity < 0
    ) {
      alert("Values cannot be negative.");
      return;
    }

    /*
    ============================================================
    EDIT INVENTORY
    ============================================================
    */

    if (editingInventoryId !== null) {
      setInventory((previousInventory) =>
        previousInventory.map((item) => {
          if (item.id === editingInventoryId) {
            return {
              ...item,
              product,
              cost,
              sellingPrice,
              weight,
              quantity,
            };
          }

          return item;
        }),
      );
    }

    /*
    ============================================================
    ADD INVENTORY
    ============================================================
    */

    else {
      const newInventory = {
        id: Date.now(),
        product,
        cost,
        sellingPrice,
        weight,
        quantity,
        stockStatus: "Available",
      };

      setInventory((previousInventory) => [
        ...previousInventory,
        newInventory,
      ]);
    }

    closePopup();
  };

  /*
  ============================================================
  ADD DAMAGE GOOD
  ============================================================
  */

  const addDamageGood = () => {
    const product = formData.product.trim();
    const quantity = Number(formData.quantity);
    const reason = formData.reason.trim();
    const unitCost = Number(formData.unitCost);

    if (
      product === "" ||
      formData.quantity === "" ||
      reason === "" ||
      formData.unitCost === ""
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (quantity < 0 || unitCost < 0) {
      alert("Values cannot be negative.");
      return;
    }

    const lossValue = quantity * unitCost;

    if (editingDamageId !== null) {
      setDamageGoods((previousDamageGoods) =>
        previousDamageGoods.map((item) => {
          if (item.id === editingDamageId) {
            return {
              ...item,
              product,
              quantity,
              reason,
              unitCost,
              lossValue,
            };
          }

          return item;
        }),
      );
    } else {
      const newDamageGood = {
        id: Date.now(),
        product,
        quantity,
        reason,
        unitCost,
        lossValue,
      };

      setDamageGoods((previousDamageGoods) => [
        ...previousDamageGoods,
        newDamageGood,
      ]);
    }

    closePopup();
  };

  /*
  ============================================================
  DELETE PRODUCT
  ============================================================
  */

  const deleteRow = (id) => {
    setProducts((previousProducts) =>
      previousProducts.filter(
        (product) => product.id !== id,
      ),
    );
  };

  /*
  ============================================================
  EDIT PRODUCT
  ============================================================
  */

  const editRow = (product) => {
    setFormData({
      product: product.product,
      type: product.type,
      brand: product.brand,
      unit: product.unit,
      cost: "",
      sellingPrice: "",
      weight: product.weight,
      quantity: product.quantity,
      reason: "",
      unitCost: "",
      lossValue: "",
      stockStatus: "Available",
      status: product.status || "Available",
    });

    setAddingNewType(false);
    setAddingNewBrand(false);
    setAddingNewUnit(false);

    setEditingProductId(product.id);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

  /*
  ============================================================
  ADD PRODUCT TO INVENTORY
  ============================================================
  */

  const addProductToInventory = (product) => {
    setProductActionMenuId(null);

    setActiveTab("inventory");

    setFormData({
      product: product.product,
      type: "",
      brand: "",
      unit: "",
      cost: "",
      sellingPrice: "",
      weight: product.weight,
      quantity: "",
      reason: "",
      unitCost: "",
      lossValue: "",
      stockStatus: "Available",
      status: "Available",
    });

    setAddingNewType(false);
    setAddingNewBrand(false);
    setAddingNewUnit(false);

    setEditingProductId(null);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

  /*
  ============================================================
  ADD PRODUCT TO DAMAGE
  ============================================================
  */

  const addProductToDamage = (product) => {
    setProductActionMenuId(null);

    setActiveTab("damage");

    setFormData({
      product: product.product,
      type: "",
      brand: "",
      unit: "",
      cost: "",
      sellingPrice: "",
      weight: "",
      quantity: "",
      reason: "",
      unitCost: "",
      lossValue: "",
      stockStatus: "Available",
      status: "Available",
    });

    setAddingNewType(false);
    setAddingNewBrand(false);
    setAddingNewUnit(false);

    setEditingProductId(null);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

  /*
  ============================================================
  EDIT INVENTORY
  ============================================================
  */

  const editInventoryRow = (item) => {
    setFormData({
      product: item.product,
      type: "",
      brand: "",
      unit: "",
      cost: item.cost,
      sellingPrice: item.sellingPrice,
      weight: item.weight,
      quantity: item.quantity,
      reason: "",
      unitCost: "",
      lossValue: "",
      stockStatus: item.stockStatus || "Available",
      status: "Available",
    });

    setAddingNewType(false);
    setAddingNewBrand(false);
    setAddingNewUnit(false);

    setEditingInventoryId(item.id);
    setEditingProductId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

  /*
  ============================================================
  EDIT DAMAGE
  ============================================================
  */

  const editDamageRow = (item) => {
    setFormData({
      product: item.product,
      type: "",
      brand: "",
      unit: "",
      cost: "",
      sellingPrice: "",
      weight: "",
      quantity: item.quantity,
      reason: item.reason,
      unitCost: item.unitCost,
      lossValue: item.lossValue,
      stockStatus: "Available",
      status: "Available",
    });

    setAddingNewType(false);
    setAddingNewBrand(false);
    setAddingNewUnit(false);

    setEditingDamageId(item.id);
    setEditingProductId(null);
    setEditingInventoryId(null);

    setShowPopup(true);
  };

  /*
  ============================================================
  DELETE INVENTORY
  ============================================================
  */

  const deleteInventoryRow = (id) => {
    setInventory((previousInventory) =>
      previousInventory.filter(
        (item) => item.id !== id,
      ),
    );
  };

  /*
  ============================================================
  DELETE DAMAGE
  ============================================================
  */

  const deleteDamageRow = (id) => {
    setDamageGoods((previousDamageGoods) =>
      previousDamageGoods.filter(
        (item) => item.id !== id,
      ),
    );
  };

  /*
  ============================================================
  FILTER PRODUCTS
  ============================================================
  */

  const filteredProducts = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    if (search === "") {
      return products;
    }

    return products.filter(
      (product) =>
        product.product
          .toLowerCase()
          .includes(search) ||
        product.type
          .toLowerCase()
          .includes(search) ||
        product.brand
          .toLowerCase()
          .includes(search) ||
        product.unit
          .toLowerCase()
          .includes(search),
    );
  }, [products, searchValue]);

  /*
  ============================================================
  FILTER INVENTORY
  ============================================================
  */

  const filteredInventory = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    if (search === "") {
      return inventory;
    }

    return inventory.filter(
      (item) =>
        item.product
          .toLowerCase()
          .includes(search) ||
        item.stockStatus
          .toLowerCase()
          .includes(search),
    );
  }, [inventory, searchValue]);

  /*
  ============================================================
  FILTER DAMAGE
  ============================================================
  */

  const filteredDamageGoods = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    if (search === "") {
      return damageGoods;
    }

    return damageGoods.filter(
      (item) =>
        item.product
          .toLowerCase()
          .includes(search) ||
        item.reason
          .toLowerCase()
          .includes(search),
    );
  }, [damageGoods, searchValue]);

  /*
  ============================================================
  ACTIVE DATA
  ============================================================
  */

  const activeData =
    activeTab === "product"
      ? filteredProducts
      : activeTab === "inventory"
        ? filteredInventory
        : filteredDamageGoods;

  /*
  ============================================================
  PAGINATION
  ============================================================
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, activeTab]);

  const totalProducts = activeData.length;

  const totalPages = Math.ceil(
    totalProducts / rowsPerPage,
  );

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    (currentPage - 1) * rowsPerPage;

  const endIndex =
    startIndex + rowsPerPage;

  const currentProducts = activeData.slice(
    startIndex,
    endIndex,
  );

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(
        (previous) => previous - 1,
      );
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(
        (previous) => previous + 1,
      );
    }
  };

  /*
  ============================================================
  CARDS
  ============================================================
  */

  const itemsIn = products.filter(
    (product) =>
      product.status === "Available",
  ).length;

  const lowStock = products.filter(
    (product) =>
      product.status === "Low Stock",
  ).length;

  const outOfStock = products.filter(
    (product) =>
      product.status === "Out of Stock",
  ).length;

  let paginationText = "Showing 0 of 0";

  if (totalProducts > 0) {
    const firstProduct = startIndex + 1;

    const lastProduct = Math.min(
      endIndex,
      totalProducts,
    );

    const label =
      activeTab === "product"
        ? "products"
        : activeTab === "inventory"
          ? "inventory items"
          : "damage goods";

    paginationText =
      `Showing ${firstProduct}-${lastProduct} of ${totalProducts} ${label}`;
  }

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <>
      <section className="main-container">
        <div>
          {/* ==================================================
              TABS
          ================================================== */}

          <div className="inventory-tabs">
            <button
              type="button"
              className={
                activeTab === "product"
                  ? "inventory-tab active"
                  : "inventory-tab"
              }
              onClick={() => {
                setActiveTab("product");
                setSearchValue("");
                setProductActionMenuId(null);
              }}
            >
              Product
            </button>

            <button
              type="button"
              className={
                activeTab === "inventory"
                  ? "inventory-tab active"
                  : "inventory-tab"
              }
              onClick={() => {
                setActiveTab("inventory");
                setSearchValue("");
                setProductActionMenuId(null);
              }}
            >
              Inventory
            </button>

            <button
              type="button"
              className={
                activeTab === "damage"
                  ? "inventory-tab active"
                  : "inventory-tab"
              }
              onClick={() => {
                setActiveTab("damage");
                setSearchValue("");
                setProductActionMenuId(null);
              }}
            >
              DamageGood
            </button>
          </div>

          {/* ==================================================
              SEARCH + CARDS
          ================================================== */}

          <div className="search-inventory-cards">
            <div className="search-container">
              <div className="search-input-wrapper">
                <img
                  className="search-icon"
                  src={searchIcon}
                  alt="Search"
                />

                <input
                  type="text"
                  className="search-input"
                  placeholder={
                    activeTab === "product"
                      ? "Search Product"
                      : activeTab === "inventory"
                        ? "Search Inventory"
                        : "Search DamageGood"
                  }
                  value={searchValue}
                  onChange={(event) =>
                    setSearchValue(
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>

            <div className="card_section">
              <div className="card_box">
                <div className="card_box_header">
                  Items IN
                </div>

                <div className="card_box_count">
                  {String(itemsIn).padStart(
                    2,
                    "0",
                  )}
                </div>
              </div>

              <div className="card_box">
                <div className="card_box_header">
                  Low Stock
                </div>

                <div className="card_box_count">
                  {String(lowStock).padStart(
                    2,
                    "0",
                  )}
                </div>
              </div>

              <div className="card_box">
                <div className="card_box_header">
                  Out of Stock
                </div>

                <div className="card_box_count">
                  {String(
                    outOfStock,
                  ).padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              ADD BUTTON
          ================================================== */}

          <div className="add-product-container">
            {activeTab === "product" && (
              <button
                className="add-product-button"
                type="button"
                onClick={openPopup}
              >
                Add Product to Inventory
              </button>
            )}

            {activeTab === "inventory" && (
              <button
                className="add-product-button"
                type="button"
                onClick={openPopup}
              >
                Add Inventory
              </button>
            )}

            {activeTab === "damage" && (
              <button
                className="add-product-button"
                type="button"
                onClick={openPopup}
              >
                Add Damage Good
              </button>
            )}
          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="table-container">
            <table>
              {/* PRODUCT TABLE */}

              {activeTab === "product" && (
                <>
                  <thead>
                    <tr>
                      <th>Prod Name</th>
                      <th>Type</th>
                      <th>Brand</th>
                      <th>Unit</th>
                      <th>Weight</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="empty-bill-cell"
                        >
                          Add Items to Product
                        </td>
                      </tr>
                    ) : (
                      currentProducts.map(
                        (product) => (
                          <tr
                            key={
                              product.id
                            }
                          >
                            <td>
                              <div className="item">
                                <strong>
                                  {
                                    product.product
                                  }
                                </strong>
                              </div>
                            </td>

                            <td className="meta-text">
                              {product.type}
                            </td>

                            <td className="meta-text">
                              {product.brand}
                            </td>

                            <td className="meta-text">
                              {product.unit}
                            </td>

                            <td className="meta-text">
                              {product.weight}
                            </td>

                            <td
                              className="status-cell"
                              id={
                                product.status ===
                                "Available"
                                  ? "available"
                                  : product.status ===
                                      "Low Stock"
                                    ? "lowStock"
                                    : "outOfStock"
                              }
                            >
                              <button
                                className="status-btn"
                                type="button"
                              >
                                <img
                                  src={
                                    product.status ===
                                    "Out of Stock"
                                      ? removeIcon
                                      : tickIcon
                                  }
                                  alt={
                                    product.status
                                  }
                                />
                              </button>
                            </td>

                            <td className="action-buttons">
                              <button
                                className="icon-btn"
                                type="button"
                                onClick={() =>
                                  setProductActionMenuId(
                                    productActionMenuId ===
                                      product.id
                                      ? null
                                      : product.id,
                                  )
                                }
                              >
                                <img
                                  src={
                                    moreIcon
                                  }
                                  alt="More"
                                />
                              </button>

                              {productActionMenuId ===
                                product.id && (
                                <div className="product-action-menu">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProductActionMenuId(
                                        null,
                                      );
                                      editRow(
                                        product,
                                      );
                                    }}
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProductActionMenuId(
                                        null,
                                      );
                                      deleteRow(
                                        product.id,
                                      );
                                    }}
                                  >
                                    Delete
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      addProductToInventory(
                                        product,
                                      )
                                    }
                                  >
                                    Add to Inventory
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      addProductToDamage(
                                        product,
                                      )
                                    }
                                  >
                                    Damage Product
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </>
              )}

              {/* INVENTORY TABLE */}

              {activeTab === "inventory" && (
                <>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Cost Price</th>
                      <th>Selling Price</th>
                      <th>Weight</th>
                      <th>Quantity</th>
                      <th>Stock Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="empty-bill-cell"
                        >
                          No Inventory Items
                        </td>
                      </tr>
                    ) : (
                      currentProducts.map(
                        (item) => (
                          <tr
                            key={item.id}
                          >
                            <td>
                              <div className="item">
                                <strong>
                                  {
                                    item.product
                                  }
                                </strong>
                              </div>
                            </td>

                            <td className="meta-text">
                              ₹{item.cost}
                            </td>

                            <td className="meta-text">
                              ₹
                              {
                                item.sellingPrice
                              }
                            </td>

                            <td className="meta-text">
                              {item.weight}
                            </td>

                            <td className="meta-text">
                              {item.quantity}
                            </td>

                            <td
                              className="status-cell"
                              id={
                                item.stockStatus ===
                                "Available"
                                  ? "available"
                                  : item.stockStatus ===
                                      "Low Stock"
                                    ? "lowStock"
                                    : "outOfStock"
                              }
                            >
                              <button
                                className="status-btn"
                                type="button"
                              >
                                <img
                                  src={
                                    item.stockStatus ===
                                    "Out of Stock"
                                      ? removeIcon
                                      : tickIcon
                                  }
                                  alt={
                                    item.stockStatus
                                  }
                                />
                              </button>
                            </td>

                            <td className="action-buttons">
                              <button
                                className="icon-btn"
                                type="button"
                                onClick={() =>
                                  editInventoryRow(
                                    item,
                                  )
                                }
                              >
                                <img
                                  src={
                                    pencilIcon
                                  }
                                  alt="Edit"
                                />
                              </button>

                              <button
                                className="icon-btn"
                                type="button"
                                onClick={() =>
                                  deleteInventoryRow(
                                    item.id,
                                  )
                                }
                              >
                                <img
                                  src={
                                    deleteIcon
                                  }
                                  alt="Delete"
                                />
                              </button>
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </>
              )}

              {/* DAMAGE TABLE */}

              {activeTab === "damage" && (
                <>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Reason</th>
                      <th>Unit Cost</th>
                      <th>Loss Value</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="empty-bill-cell"
                        >
                          No Damage Goods
                        </td>
                      </tr>
                    ) : (
                      currentProducts.map(
                        (item) => (
                          <tr
                            key={item.id}
                          >
                            <td>
                              <div className="item">
                                <strong>
                                  {
                                    item.product
                                  }
                                </strong>
                              </div>
                            </td>

                            <td className="meta-text">
                              {item.quantity}
                            </td>

                            <td className="meta-text">
                              {item.reason}
                            </td>

                            <td className="price">
                              ₹{item.unitCost}
                            </td>

                            <td className="price">
                              ₹{item.lossValue}
                            </td>

                            <td className="action-buttons">
                              <button
                                className="icon-btn"
                                type="button"
                                onClick={() =>
                                  editDamageRow(
                                    item,
                                  )
                                }
                              >
                                <img
                                  src={
                                    pencilIcon
                                  }
                                  alt="Edit"
                                />
                              </button>

                              <button
                                className="icon-btn"
                                type="button"
                                onClick={() =>
                                  deleteDamageRow(
                                    item.id,
                                  )
                                }
                              >
                                <img
                                  src={
                                    deleteIcon
                                  }
                                  alt="Delete"
                                />
                              </button>
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </>
              )}
            </table>
          </div>

          {/* ==================================================
              MOBILE CARDS
          ================================================== */}

          <div className="bill-cards-container">
            {currentProducts.length === 0 ? (
              <div className="empty-bill-cell">
                {activeTab === "product"
                  ? "Add Items to Product."
                  : activeTab === "inventory"
                    ? "No Inventory Items."
                    : "No Damage Goods."}
              </div>
            ) : (
              currentProducts.map((item) => (
                <div
                  className="bill-card"
                  key={item.id}
                >
                  <div className="bill-card-header">
                    <strong>
                      {item.product}
                    </strong>

                    <div className="row-actions">
                      {activeTab === "product" && (
                        <button
                          className="edit-item-button"
                          type="button"
                          onClick={() =>
                            editRow(item)
                          }
                        >
                          <img
                            src={pencilIcon}
                            alt="Edit"
                          />
                        </button>
                      )}

                      {activeTab === "inventory" && (
                        <button
                          className="edit-item-button"
                          type="button"
                          onClick={() =>
                            editInventoryRow(
                              item,
                            )
                          }
                        >
                          <img
                            src={pencilIcon}
                            alt="Edit"
                          />
                        </button>
                      )}

                      {activeTab === "damage" && (
                        <button
                          className="edit-item-button"
                          type="button"
                          onClick={() =>
                            editDamageRow(item)
                          }
                        >
                          <img
                            src={pencilIcon}
                            alt="Edit"
                          />
                        </button>
                      )}

                      <button
                        className="delete-item-button"
                        type="button"
                        onClick={() => {
                          if (
                            activeTab ===
                            "product"
                          ) {
                            deleteRow(item.id);
                          } else if (
                            activeTab ===
                            "inventory"
                          ) {
                            deleteInventoryRow(
                              item.id,
                            );
                          } else {
                            deleteDamageRow(
                              item.id,
                            );
                          }
                        }}
                      >
                        <img
                          src={deleteIcon}
                          alt="Delete"
                        />
                      </button>

                      {activeTab === "product" && (
                        <div className="mobile-product-more">
                          <button
                            className="more-item-button"
                            type="button"
                            onClick={() =>
                              setProductActionMenuId(
                                productActionMenuId ===
                                  item.id
                                  ? null
                                  : item.id,
                              )
                            }
                          >
                            <img
                              src={moreIcon}
                              alt="More"
                            />
                          </button>

                          {productActionMenuId ===
                            item.id && (
                            <div className="mobile-product-action-menu">
                              <button
                                type="button"
                                onClick={() =>
                                  addProductToInventory(
                                    item,
                                  )
                                }
                              >
                                Add to Inventory
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  addProductToDamage(
                                    item,
                                  )
                                }
                              >
                                Damage Product
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {activeTab === "product" && (
                    <>
                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Type
                        </span>

                        <span className="bill-card-value">
                          {item.type}
                        </span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Brand
                        </span>

                        <span className="bill-card-value">
                          {item.brand}
                        </span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Unit
                        </span>

                        <span className="bill-card-value">
                          {item.unit}
                        </span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Status
                        </span>

                        <span className="bill-card-value">
                          <button
                            className="status-btn"
                            type="button"
                          >
                            <img
                              src={
                                item.status ===
                                "Out of Stock"
                                  ? removeIcon
                                  : tickIcon
                              }
                              alt={
                                item.status
                              }
                            />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {activeTab === "inventory" && (
                    <>
                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Cost Price
                        </span>

                        <span className="bill-card-value">
                          ₹{item.cost}
                        </span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Selling Price
                        </span>

                        <span className="bill-card-value">
                          ₹
                          {
                            item.sellingPrice
                          }
                        </span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Weight
                        </span>

                        <span className="bill-card-value">
                          {item.weight}
                        </span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Quantity
                        </span>

                        <span className="bill-card-value">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Stock Status
                        </span>

                        <span className="bill-card-value">
                          <button
                            className="status-btn"
                            type="button"
                          >
                            <img
                              src={
                                item.stockStatus ===
                                "Out of Stock"
                                  ? removeIcon
                                  : tickIcon
                              }
                              alt={
                                item.stockStatus
                              }
                            />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {activeTab === "damage" && (
                    <>
                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Quantity
                        </span>

                        <span className="bill-card-value">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Reason
                        </span>

                        <span className="bill-card-value">
                          {item.reason}
                        </span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">
                          Unit Cost
                        </span>

                        <span className="bill-card-value">
                          ₹{item.unitCost}
                        </span>
                      </div>

                      <div className="bill-card-row bill-card-total">
                        <span className="bill-card-label">
                          Loss Value
                        </span>

                        <span className="bill-card-value">
                          ₹
                          {
                            item.lossValue
                          }
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          <div className="pagination-container">
            <div className="pagination-text">
              {paginationText}
            </div>

            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                type="button"
                onClick={previousPage}
                disabled={
                  currentPage === 1 ||
                  totalProducts === 0
                }
              >
                <img
                  src={leftIcon}
                  alt="Previous"
                />
              </button>

              <button
                className="pagination-btn"
                type="button"
                onClick={nextPage}
                disabled={
                  currentPage >= totalPages ||
                  totalProducts === 0
                }
              >
                <img
                  src={chevronIcon}
                  alt="Next"
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          POPUP
      ====================================================== */}

      {showPopup && (
        <div
          className="popup"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closePopup();
            }
          }}
        >
          <div className="popup-content">

            {/* ==================================================
                PRODUCT POPUP
            ================================================== */}

            {activeTab === "product" && (
              <>
                <h2>
                  {editingProductId !== null
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                {/* PRODUCT NAME - TEXT BOX */}

                <input
                  type="text"
                  name="product"
                  placeholder="Product Name"
                  value={formData.product}
                  onChange={
                    handleInputChange
                  }
                />

                {/* TYPE */}

                {!addingNewType ? (
                  <select
                    name="type"
                    value={formData.type}
                    onChange={
                      handleTypeChange
                    }
                  >
                    <option value="">
                      Select Type
                    </option>

                    {productTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      ),
                    )}

                    <option value="__ADD_NEW__">
                      + Add New Type
                    </option>
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="type"
                      placeholder="Enter New Type"
                      value={formData.type}
                      onChange={
                        handleInputChange
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setAddingNewType(
                          false,
                        )
                      }
                    >
                      Use Existing Type
                    </button>
                  </div>
                )}

                {/* BRAND */}

                {!addingNewBrand ? (
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={
                      handleBrandChange
                    }
                  >
                    <option value="">
                      Select Brand
                    </option>

                    {productBrands.map(
                      (brand) => (
                        <option
                          key={brand}
                          value={brand}
                        >
                          {brand}
                        </option>
                      ),
                    )}

                    <option value="__ADD_NEW__">
                      + Add New Brand
                    </option>
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="brand"
                      placeholder="Enter New Brand"
                      value={
                        formData.brand
                      }
                      onChange={
                        handleInputChange
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setAddingNewBrand(
                          false,
                        )
                      }
                    >
                      Use Existing Brand
                    </button>
                  </div>
                )}

                {/* UNIT */}

                {!addingNewUnit ? (
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={
                      handleUnitChange
                    }
                  >
                    <option value="">
                      Select Unit
                    </option>

                    {units.map((unit) => (
                      <option
                        key={unit}
                        value={unit}
                      >
                        {unit}
                      </option>
                    ))}

                    <option value="__ADD_NEW__">
                      + Add New Unit
                    </option>
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="unit"
                      placeholder="Enter New Unit"
                      value={formData.unit}
                      onChange={
                        handleInputChange
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setAddingNewUnit(
                          false,
                        )
                      }
                    >
                      Use Existing Unit
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  name="weight"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={
                    handleInputChange
                  }
                />

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={
                    formData.quantity
                  }
                  onChange={
                    handleInputChange
                  }
                />

                <div className="popup-buttons">
                  <button
                    type="button"
                    onClick={closePopup}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={addProduct}
                  >
                    Submit
                  </button>
                </div>
              </>
            )}

            {/* ==================================================
                INVENTORY POPUP
            ================================================== */}

            {activeTab === "inventory" && (
              <>
                <h2>
                  {editingInventoryId !==
                  null
                    ? "Edit Inventory"
                    : "Add Inventory"}
                </h2>

                {/* PRODUCT DROPDOWN */}

                <select
                  name="product"
                  value={formData.product}
                  onChange={
                    handleProductChange
                  }
                >
                  <option value="">
                    Select Product
                  </option>

                  {productNames.map(
                    (product) => (
                      <option
                        key={product}
                        value={product}
                      >
                        {product}
                      </option>
                    ),
                  )}
                </select>

                <input
                  type="number"
                  name="cost"
                  placeholder="Cost Price"
                  value={formData.cost}
                  onChange={
                    handleInputChange
                  }
                />

                <input
                  type="number"
                  name="sellingPrice"
                  placeholder="Selling Price"
                  value={
                    formData.sellingPrice
                  }
                  onChange={
                    handleInputChange
                  }
                />

                <input
                  type="text"
                  name="weight"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={
                    handleInputChange
                  }
                />

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={
                    formData.quantity
                  }
                  onChange={
                    handleInputChange
                  }
                />

                <div className="popup-buttons">
                  <button
                    type="button"
                    onClick={closePopup}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={
                      addInventory
                    }
                  >
                    Submit
                  </button>
                </div>
              </>
            )}

            {/* ==================================================
                DAMAGE GOOD POPUP
            ================================================== */}

            {activeTab === "damage" && (
              <>
                <h2>
                  {editingDamageId !== null
                    ? "Edit Damage Good"
                    : "Add Damage Good"}
                </h2>

                <select
                  name="product"
                  value={formData.product}
                  onChange={
                    handleProductChange
                  }
                >
                  <option value="">
                    Select Product
                  </option>

                  {productNames.map(
                    (product) => (
                      <option
                        key={product}
                        value={product}
                      >
                        {product}
                      </option>
                    ),
                  )}
                </select>

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={
                    formData.quantity
                  }
                  onChange={
                    handleInputChange
                  }
                />

                <input
                  type="text"
                  name="reason"
                  placeholder="Reason"
                  value={formData.reason}
                  onChange={
                    handleInputChange
                  }
                />

                <input
                  type="number"
                  name="unitCost"
                  placeholder="Unit Cost"
                  value={
                    formData.unitCost
                  }
                  onChange={
                    handleInputChange
                  }
                />

                <input
                  type="number"
                  name="lossValue"
                  placeholder="Loss Value"
                  value={
                    formData.quantity !==
                      "" &&
                    formData.unitCost !==
                      ""
                      ? Number(
                          formData.quantity,
                        ) *
                        Number(
                          formData.unitCost,
                        )
                      : ""
                  }
                  readOnly
                />

                <div className="popup-buttons">
                  <button
                    type="button"
                    onClick={closePopup}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={
                      addDamageGood
                    }
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Inventory;