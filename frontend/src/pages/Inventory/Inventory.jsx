import { useEffect, useMemo, useState } from "react";

// import { useOutletContext } from "react-router-dom";

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

  // // SIDEBAR TOGGLE
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  // EDIT
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingInventoryId, setEditingInventoryId] = useState(null);
  const [editingDamageId, setEditingDamageId] = useState(null);

  const [productActionMenuId, setProductActionMenuId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 6;

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

  const goBack = () => {
    window.history.back();
  };

  // SIDEBAR TOGGLE FUNCTION
  // const handleMenuToggle = () => {
  //   setSidebarOpen((previous) => !previous);
  // };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openPopup = () => {
    setProductActionMenuId(null);

    setEditingProductId(null);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    if (activeTab === "product") {
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
    }

    if (activeTab === "inventory") {
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
    }

    if (activeTab === "damage") {
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
    }

    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);

    setEditingProductId(null);
    setEditingInventoryId(null);
    setEditingDamageId(null);
    setProductActionMenuId(null);

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
  };

  const addProduct = () => {
    const product = formData.product.trim();
    const productCost = Number(formData.cost);
    const productWeight = formData.weight.trim();
    const productQuantity = Number(formData.quantity);
    const productType = formData.type.trim();
    const productBrand = formData.brand.trim();
    const productUnit = formData.unit.trim();
    const productStatus = formData.status;

    if (
      product === "" ||
      formData.cost === "" ||
      productWeight === "" ||
      formData.quantity === "" ||
      productType === "" ||
      productBrand === "" ||
      productUnit === ""
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (productCost < 0) {
      alert("Cost cannot be negative.");
      return;
    }

    if (productQuantity < 0) {
      alert("Quantity cannot be negative.");
      return;
    }

    if (editingProductId !== null) {
      setProducts((previousProducts) =>
        previousProducts.map((item) => {
          if (item.id === editingProductId) {
            return {
              ...item,
              product,
              cost: productCost,
              weight: productWeight,
              quantity: productQuantity,
              status: productStatus,
              type: productType,
              brand: productBrand,
              unit: productUnit,
            };
          }

          return item;
        }),
      );
    } else {
      const newProduct = {
        id: Date.now(),
        product,
        cost: productCost,
        weight: productWeight,
        quantity: productQuantity,
        status: productStatus,
        type: productType,
        brand: productBrand,
        unit: productUnit,
      };

      setProducts((previousProducts) => [
        ...previousProducts,
        newProduct,
      ]);
    }

    closePopup();
  };

  const addInventory = () => {
    const product = formData.product.trim();
    const cost = Number(formData.cost);
    const sellingPrice = Number(formData.sellingPrice);
    const weight = formData.weight.trim();
    const quantity = Number(formData.quantity);
    const stockStatus = formData.stockStatus;

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

    if (cost < 0 || sellingPrice < 0 || quantity < 0) {
      alert("Values cannot be negative.");
      return;
    }

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
              stockStatus,
              unit: weight,
            };
          }

          return item;
        }),
      );
    } else {
      const newInventory = {
        id: Date.now(),
        product,
        cost,
        sellingPrice,
        weight,
        quantity,
        stockStatus,
        unit: weight,
      };

      setInventory((previousInventory) => [
        ...previousInventory,
        newInventory,
      ]);
    }

    closePopup();
  };

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

  const deleteRow = (id) => {
    setProducts((previousProducts) =>
      previousProducts.filter((product) => product.id !== id),
    );
  };

  const editRow = (product) => {
    setFormData({
      product: product.product,
      type: product.type,
      brand: product.brand,
      unit: product.unit,
      cost: product.cost,
      sellingPrice: "",
      weight: product.weight,
      quantity: product.quantity,
      reason: "",
      unitCost: "",
      lossValue: "",
      stockStatus: "Available",
      status: product.status,
    });

    setEditingProductId(product.id);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

  const addProductToInventory = (product) => {
    setProductActionMenuId(null);

    setActiveTab("inventory");

    setFormData({
      product: product.product,
      type: "",
      brand: "",
      unit: product.unit,
      cost: product.cost,
      sellingPrice: "",
      weight: product.weight,
      quantity: "",
      reason: "",
      unitCost: "",
      lossValue: "",
      stockStatus: "Available",
      status: "Available",
    });

    setEditingProductId(null);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

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
      unitCost: product.cost,
      lossValue: "",
      stockStatus: "Available",
      status: "Available",
    });

    setEditingProductId(null);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

  const editInventoryRow = (item) => {
    setFormData({
      product: item.product,
      type: "",
      brand: "",
      unit: item.unit,
      cost: item.cost,
      sellingPrice: item.sellingPrice,
      weight: item.weight,
      quantity: item.quantity,
      reason: "",
      unitCost: "",
      lossValue: "",
      stockStatus: item.stockStatus,
      status: "Available",
    });

    setEditingInventoryId(item.id);
    setEditingProductId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

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

    setEditingDamageId(item.id);
    setEditingProductId(null);
    setEditingInventoryId(null);

    setShowPopup(true);
  };

  const deleteInventoryRow = (id) => {
    setInventory((previousInventory) =>
      previousInventory.filter((item) => item.id !== id),
    );
  };

  const deleteDamageRow = (id) => {
    setDamageGoods((previousDamageGoods) =>
      previousDamageGoods.filter((item) => item.id !== id),
    );
  };

  const filteredProducts = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    if (search === "") {
      return products;
    }

    return products.filter(
      (product) =>
        product.product.toLowerCase().includes(search) ||
        product.type.toLowerCase().includes(search) ||
        product.brand.toLowerCase().includes(search) ||
        product.unit.toLowerCase().includes(search),
    );
  }, [products, searchValue]);

  const filteredInventory = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    if (search === "") {
      return inventory;
    }

    return inventory.filter(
      (item) =>
        item.product.toLowerCase().includes(search) ||
        item.unit.toLowerCase().includes(search) ||
        item.stockStatus.toLowerCase().includes(search),
    );
  }, [inventory, searchValue]);

  const filteredDamageGoods = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    if (search === "") {
      return damageGoods;
    }

    return damageGoods.filter(
      (item) =>
        item.product.toLowerCase().includes(search) ||
        item.reason.toLowerCase().includes(search),
    );
  }, [damageGoods, searchValue]);

  const activeData =
    activeTab === "product"
      ? filteredProducts
      : activeTab === "inventory"
        ? filteredInventory
        : filteredDamageGoods;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, activeTab]);

  const totalProducts = activeData.length;

  const totalPages = Math.ceil(totalProducts / rowsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const currentProducts = activeData.slice(startIndex, endIndex);

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((previous) => previous - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((previous) => previous + 1);
    }
  };

  const itemsIn = products.filter(
    (product) => product.status === "Available",
  ).length;

  const lowStock = products.filter(
    (product) => product.status === "Low Stock",
  ).length;

  const outOfStock = products.filter(
    (product) => product.status === "Out of Stock",
  ).length;

  let paginationText = "Showing 0 of 0";

  if (totalProducts > 0) {
    const firstProduct = startIndex + 1;
    const lastProduct = Math.min(endIndex, totalProducts);

    const label =
      activeTab === "product"
        ? "products"
        : activeTab === "inventory"
          ? "inventory items"
          : "damage goods";

    paginationText = `Showing ${firstProduct}-${lastProduct} of ${totalProducts} ${label}`;
  }

  return (
    <>
      {/* HEADER
      <Header
        onBack={goBack}
        onAddProduct={openPopup}
        onMenuToggle={handleMenuToggle}
      /> */}

      {/* MAIN */}
      <section className="main-container">
        {/* MAIN CONTENT */}
        <div>
          {/* TABS */}
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

          <div className="search-inventory-cards">
            {/* SEARCH */}
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
                    setSearchValue(event.target.value)
                  }
                />
              </div>
            </div>

            {/* CARDS */}
            <div className="card_section">
              <div className="card_box">
                <div className="card_box_header">Items IN</div>
                <div className="card_box_count">
                  {String(itemsIn).padStart(2, "0")}
                </div>
              </div>

              <div className="card_box">
                <div className="card_box_header">Low Stock</div>
                <div className="card_box_count">
                  {String(lowStock).padStart(2, "0")}
                </div>
              </div>

              <div className="card_box">
                <div className="card_box_header">Out of Stock</div>
                <div className="card_box_count">
                  {String(outOfStock).padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>

          {/* ADD BUTTON */}
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

          {/* TABLE */}
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
                      currentProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div className="item">
                              <strong>{product.product}</strong>
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
                              product.status === "Available"
                                ? "available"
                                : product.status === "Low Stock"
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
                                alt={product.status}
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
                                src={moreIcon}
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
                                    editRow(product);
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
                                    deleteRow(product.id);
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
                      ))
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
                      currentProducts.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="item">
                              <strong>{item.product}</strong>
                            </div>
                          </td>

                          <td className="meta-text">
                            ₹{item.cost}
                          </td>

                          <td className="meta-text">
                            ₹{item.sellingPrice}
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
                              item.stockStatus === "Available"
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
                                alt={item.stockStatus}
                              />
                            </button>
                          </td>

                          <td className="action-buttons">
                            <button
                              className="icon-btn"
                              type="button"
                              onClick={() =>
                                editInventoryRow(item)
                              }
                            >
                              <img
                                src={pencilIcon}
                                alt="Edit"
                              />
                            </button>

                            <button
                              className="icon-btn"
                              type="button"
                              onClick={() =>
                                deleteInventoryRow(item.id)
                              }
                            >
                              <img
                                src={deleteIcon}
                                alt="Delete"
                              />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}

              {/* DAMAGE GOOD TABLE */}
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
                      currentProducts.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="item">
                              <strong>{item.product}</strong>
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
                                editDamageRow(item)
                              }
                            >
                              <img
                                src={pencilIcon}
                                alt="Edit"
                              />
                            </button>

                            <button
                              className="icon-btn"
                              type="button"
                              onClick={() =>
                                deleteDamageRow(item.id)
                              }
                            >
                              <img
                                src={deleteIcon}
                                alt="Delete"
                              />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}
            </table>
          </div>

          {/* BILL CARDS (mobile) */}
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
                <div className="bill-card" key={item.id}>
                  <div className="bill-card-header">
                    <strong>{item.product}</strong>

                    <div className="row-actions">
                      {activeTab === "product" && (
                        <button
                          className="edit-item-button"
                          type="button"
                          onClick={() => editRow(item)}
                          aria-label={`Edit ${item.product}`}
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
                            editInventoryRow(item)
                          }
                          aria-label={`Edit ${item.product}`}
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
                          aria-label={`Edit ${item.product}`}
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
                          if (activeTab === "product") {
                            deleteRow(item.id);
                          } else if (
                            activeTab === "inventory"
                          ) {
                            deleteInventoryRow(item.id);
                          } else {
                            deleteDamageRow(item.id);
                          }
                        }}
                        aria-label={`Remove ${item.product}`}
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
                                productActionMenuId === item.id
                                  ? null
                                  : item.id,
                              )
                            }
                            aria-label={`More actions for ${item.product}`}
                          >
                            <img
                              src={moreIcon}
                              alt="More"
                            />
                          </button>

                          {productActionMenuId === item.id && (
                            <div className="mobile-product-action-menu">
                              <button
                                type="button"
                                onClick={() =>
                                  addProductToInventory(item)
                                }
                              >
                                Add to Inventory
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  addProductToDamage(item)
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

                  {/* PRODUCT MOBILE CARD */}
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

                        <span
                          className="bill-card-value"
                          id={
                            item.status === "Available"
                              ? "available"
                              : item.status === "Low Stock"
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
                                item.status === "Out of Stock"
                                  ? removeIcon
                                  : tickIcon
                              }
                              alt={item.status}
                            />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {/* INVENTORY MOBILE CARD */}
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
                          ₹{item.sellingPrice}
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
                              alt={item.stockStatus}
                            />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {/* DAMAGE GOOD MOBILE CARD */}
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
                          ₹{item.lossValue}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* PAGINATION */}
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
                  currentPage === 1 || totalProducts === 0
                }
              >
                <img src={leftIcon} alt="Previous" />
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
                <img src={chevronIcon} alt="Next" />
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        {/* {sidebarOpen && <Sidebar />} */}
      </section>

      {/* BOTTOM NAV */}
      {/* <BottomNav /> */}

      {/* POPUP */}
      {showPopup && (
        <div
          className="popup"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closePopup();
            }
          }}
        >
          <div className="popup-content">

            {/* PRODUCT POPUP */}
            {activeTab === "product" && (
              <>
                <h2>
                  {editingProductId !== null
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <input
                  type="text"
                  name="product"
                  placeholder="Product Name"
                  value={formData.product}
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  name="type"
                  placeholder="Type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  name="brand"
                  placeholder="Brand"
                  required
                  value={formData.brand}
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  name="unit"
                  placeholder="Unit"
                  required
                  value={formData.unit}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="cost"
                  placeholder="Cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  name="weight"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Available">
                    Available
                  </option>

                  <option value="Low Stock">
                    Low Stock
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>
                </select>

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

            {/* INVENTORY POPUP */}
            {activeTab === "inventory" && (
              <>
                <h2>
                  {editingInventoryId !== null
                    ? "Edit Inventory"
                    : "Add Inventory"}
                </h2>

                <input
                  type="text"
                  name="product"
                  placeholder="Product"
                  value={formData.product}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="cost"
                  placeholder="Cost Price"
                  value={formData.cost}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="sellingPrice"
                  placeholder="Selling Price"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  name="weight"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />

                <select
                  name="stockStatus"
                  value={formData.stockStatus}
                  onChange={handleInputChange}
                >
                  <option value="Available">
                    Available
                  </option>

                  <option value="Low Stock">
                    Low Stock
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>
                </select>

                <div className="popup-buttons">
                  <button
                    type="button"
                    onClick={closePopup}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={addInventory}
                  >
                    Submit
                  </button>
                </div>
              </>
            )}

            {/* DAMAGE GOOD POPUP */}
            {activeTab === "damage" && (
              <>
                <h2>
                  {editingDamageId !== null
                    ? "Edit Damage Good"
                    : "Add Damage Good"}
                </h2>

                <input
                  type="text"
                  name="product"
                  placeholder="Product"
                  value={formData.product}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                />

                <input
                  type="text"
                  name="reason"
                  placeholder="Reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="unitCost"
                  placeholder="Unit Cost"
                  value={formData.unitCost}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="lossValue"
                  placeholder="Loss Value"
                  value={
                    formData.quantity !== "" &&
                    formData.unitCost !== ""
                      ? Number(formData.quantity) *
                        Number(formData.unitCost)
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
                    onClick={addDamageGood}
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