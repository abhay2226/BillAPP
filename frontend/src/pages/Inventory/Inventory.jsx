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

import * as productService from "../../services/productService";
import * as inventoryService from "../../services/inventoryService";
import * as damageGoodsService from "../../services/damageGoodsService";
import * as masterDataService from "../../services/masterDataService";

const LOW_STOCK_THRESHOLD = 5;

function Inventory() {
  const [activeTab, setActiveTab] = useState("product");

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [damageGoods, setDamageGoods] = useState([]);

  const [productTypes, setProductTypes] = useState([]);
  const [productBrands, setProductBrands] = useState([]);
  const [units, setUnits] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchValue, setSearchValue] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingProductId, setEditingProductId] = useState(null);
  const [editingInventoryId, setEditingInventoryId] = useState(null);
  const [editingDamageId, setEditingDamageId] = useState(null);

  const [productActionMenuId, setProductActionMenuId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 6;

  /*
  ============================================================
  ADD NEW DROPDOWN STATES (product tab only)
  ============================================================
  */

  const [addingNewType, setAddingNewType] = useState(false);
  const [addingNewBrand, setAddingNewBrand] = useState(false);

  /*
  ============================================================
  FORM DATA
  ============================================================
  */

  const emptyForm = {
    // product tab
    productName: "",
    typeId: "",
    typeName: "",
    brandId: "",
    brandName: "",
    unitId: "",
    unitQuantity: "",

    // inventory tab
    productId: "",
    costPrice: "",
    sellingPrice: "",
    qty: "",

    // damage tab
    inventoryId: "",
    damageQty: "",
    reason: "",
    unitCost: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  /*
  ============================================================
  LOAD ALL DATA
  ============================================================
  */

  const loadAll = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [
        productsData,
        inventoryData,
        damageData,
        typesData,
        brandsData,
        unitsData,
      ] = await Promise.all([
        productService.getProducts(),
        inventoryService.getInventory(),
        damageGoodsService.getDamagedGoods(),
        masterDataService.getProductTypes(),
        masterDataService.getProductBrands(),
        masterDataService.getUnits(),
      ]);

      setProducts(productsData);
      setInventory(inventoryData);
      setDamageGoods(damageData);
      setProductTypes(typesData);
      setProductBrands(brandsData);
      setUnits(unitsData);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to load inventory data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
  ============================================================
  HELPERS: CROSS-REFERENCE PRODUCT <-> INVENTORY
  ============================================================
  */

  const inventoryByProductId = useMemo(() => {
    const map = new Map();

    inventory.forEach((item) => {
      map.set(item.product_id, item);
    });

    return map;
  }, [inventory]);

  const inventoryById = useMemo(() => {
    const map = new Map();

    inventory.forEach((item) => {
      map.set(item.inventory_id, item);
    });

    return map;
  }, [inventory]);

  const getProductStatus = (product) => {
    const inventoryRecord = inventoryByProductId.get(product.product_id);

    if (!inventoryRecord) {
      return "Not Stocked";
    }

    if (inventoryRecord.qty <= 0) {
      return "Out of Stock";
    }

    if (inventoryRecord.qty <= LOW_STOCK_THRESHOLD) {
      return "Low Stock";
    }

    return "Available";
  };

  const getInventoryStatus = (item) => {
    if (item.qty <= 0) {
      return "Out of Stock";
    }

    if (item.qty <= LOW_STOCK_THRESHOLD) {
      return "Low Stock";
    }

    return "Available";
  };

  /*
  ============================================================
  RESET FORM
  ============================================================
  */

  const resetForm = () => {
    setFormData(emptyForm);
    setAddingNewType(false);
    setAddingNewBrand(false);
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

  const handleTypeChange = (event) => {
    const value = event.target.value;

    if (value === "__ADD_NEW__") {
      setAddingNewType(true);
      setFormData((previous) => ({ ...previous, typeId: "", typeName: "" }));
      return;
    }

    setAddingNewType(false);

    setFormData((previous) => ({
      ...previous,
      typeId: value,
      typeName: "",
    }));
  };

  const handleBrandChange = (event) => {
    const value = event.target.value;

    if (value === "__ADD_NEW__") {
      setAddingNewBrand(true);
      setFormData((previous) => ({ ...previous, brandId: "", brandName: "" }));
      return;
    }

    setAddingNewBrand(false);

    setFormData((previous) => ({
      ...previous,
      brandId: value,
      brandName: "",
    }));
  };

  /*
  ============================================================
  OPEN / CLOSE POPUP
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
  PRODUCT: ADD / EDIT / DELETE
  ============================================================
  */

  const submitProduct = async () => {
    const productName = formData.productName.trim();
    const unitQuantity = Number(formData.unitQuantity);

    if (!productName || formData.unitQuantity === "" || !formData.unitId) {
      alert("Please fill all fields.");
      return;
    }

    if (!addingNewType && !formData.typeId) {
      alert("Please select or add a product type.");
      return;
    }

    if (!addingNewBrand && !formData.brandId) {
      alert("Please select or add a brand.");
      return;
    }

    if (addingNewType && !formData.typeName.trim()) {
      alert("Please enter the new type name.");
      return;
    }

    if (addingNewBrand && !formData.brandName.trim()) {
      alert("Please enter the new brand name.");
      return;
    }

    if (!Number.isFinite(unitQuantity) || unitQuantity <= 0) {
      alert("Unit quantity must be greater than 0.");
      return;
    }

    const payload = {
      product_name: productName,
      unit_id: Number(formData.unitId),
      unit_quantity: unitQuantity,
    };

    if (addingNewType) {
      payload.typeName = formData.typeName.trim();
    } else {
      payload.type_id = Number(formData.typeId);
    }

    if (addingNewBrand) {
      payload.brandName = formData.brandName.trim();
    } else {
      payload.brand_id = Number(formData.brandId);
    }

    setIsSubmitting(true);

    try {
      if (editingProductId !== null) {
        await productService.updateProduct(editingProductId, payload);
      } else {
        await productService.createProduct(payload);
      }

      await loadAll();
      closePopup();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Deactivate this product?")) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      await loadAll();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete product.");
    }
  };

  const editRow = (product) => {
    setFormData({
      ...emptyForm,
      productName: product.product_name,
      typeId: product.type_id,
      brandId: product.brand_id,
      unitId: product.unit_id,
      unitQuantity: product.unit_quantity,
    });

    setAddingNewType(false);
    setAddingNewBrand(false);

    setEditingProductId(product.product_id);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

  /*
  ============================================================
  ADD PRODUCT TO INVENTORY (from product row action menu)
  ============================================================
  */

  const addProductToInventory = (product) => {
    setProductActionMenuId(null);

    const existingInventory = inventoryByProductId.get(product.product_id);

    if (existingInventory) {
      alert("This product already has an inventory record. Edit it from the Inventory tab.");
      return;
    }

    setActiveTab("inventory");

    setFormData({
      ...emptyForm,
      productId: product.product_id,
    });

    setAddingNewType(false);
    setAddingNewBrand(false);

    setEditingProductId(null);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

  /*
  ============================================================
  DAMAGE PRODUCT (from product row action menu)
  ============================================================
  */

  const addProductToDamage = (product) => {
    setProductActionMenuId(null);

    const existingInventory = inventoryByProductId.get(product.product_id);

    if (!existingInventory) {
      alert("This product has no inventory record yet. Add it to inventory first.");
      return;
    }

    setActiveTab("damage");

    setFormData({
      ...emptyForm,
      inventoryId: existingInventory.inventory_id,
    });

    setEditingProductId(null);
    setEditingInventoryId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

  /*
  ============================================================
  INVENTORY: ADD / EDIT / DELETE
  ============================================================
  */

  const submitInventory = async () => {
    const costPrice = formData.costPrice === "" ? null : Number(formData.costPrice);
    const sellingPrice = Number(formData.sellingPrice);

    if (formData.sellingPrice === "") {
      alert("Please enter the selling price.");
      return;
    }

    if (costPrice !== null && (!Number.isFinite(costPrice) || costPrice < 0)) {
      alert("Cost price cannot be negative.");
      return;
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
      alert("Selling price cannot be negative.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingInventoryId !== null) {
        await inventoryService.updateInventoryPricing(editingInventoryId, {
          cost_price: costPrice,
          selling_price: sellingPrice,
        });
      } else {
        if (!formData.productId) {
          alert("Please select a product.");
          setIsSubmitting(false);
          return;
        }

        const qty = formData.qty === "" ? 0 : Number(formData.qty);

        if (!Number.isInteger(qty) || qty < 0) {
          alert("Quantity must be a non-negative whole number.");
          setIsSubmitting(false);
          return;
        }

        await inventoryService.createInventory({
          product_id: Number(formData.productId),
          qty,
          cost_price: costPrice,
          selling_price: sellingPrice,
        });
      }

      await loadAll();
      closePopup();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to save inventory.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteInventoryRow = async (id) => {
    if (!window.confirm("Deactivate this inventory record?")) {
      return;
    }

    try {
      await inventoryService.deactivateInventory(id);
      await loadAll();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete inventory record.");
    }
  };

  const editInventoryRow = (item) => {
    setFormData({
      ...emptyForm,
      productId: item.product_id,
      costPrice: item.cost_price ?? "",
      sellingPrice: item.selling_price,
      qty: item.qty,
    });

    setEditingInventoryId(item.inventory_id);
    setEditingProductId(null);
    setEditingDamageId(null);

    setShowPopup(true);
  };

  /*
  ============================================================
  DAMAGE: ADD / EDIT / DELETE
  ============================================================
  */

  const submitDamageGood = async () => {
    const quantity = Number(formData.damageQty);
    const reason = formData.reason.trim();
    const unitCost = Number(formData.unitCost);

    if (!formData.inventoryId) {
      alert("Please select a product.");
      return;
    }

    if (formData.damageQty === "" || !Number.isInteger(quantity) || quantity <= 0) {
      alert("Quantity must be a positive whole number.");
      return;
    }

    if (!reason) {
      alert("Please enter a reason.");
      return;
    }

    if (formData.unitCost === "" || !Number.isFinite(unitCost) || unitCost < 0) {
      alert("Please enter a valid unit cost.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingDamageId !== null) {
        await damageGoodsService.updateDamagedGoods(editingDamageId, {
          qty: quantity,
          reason,
          unit_cost: unitCost,
        });
      } else {
        await damageGoodsService.createDamagedGoods({
          inventory_id: Number(formData.inventoryId),
          qty: quantity,
          reason,
          unit_cost: unitCost,
        });
      }

      await loadAll();
      closePopup();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to save damage record.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteDamageRow = async (id) => {
    if (!window.confirm("Deactivate this damage record?")) {
      return;
    }

    try {
      await damageGoodsService.deactivateDamagedGoods(id);
      await loadAll();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to delete damage record.");
    }
  };

  const editDamageRow = (item) => {
    setFormData({
      ...emptyForm,
      inventoryId: item.inventory_id,
      damageQty: item.qty,
      reason: item.reason || "",
      unitCost: item.unit_cost,
    });

    setEditingDamageId(item.damage_id);
    setEditingProductId(null);
    setEditingInventoryId(null);

    setShowPopup(true);
  };

  const handleSubmit = () => {
    if (activeTab === "product") {
      submitProduct();
    } else if (activeTab === "inventory") {
      submitInventory();
    } else {
      submitDamageGood();
    }
  };

  /*
  ============================================================
  FILTER + DISPLAY ROWS
  ============================================================
  */

  const displayProducts = useMemo(() => {
    return products.map((product) => ({
      id: product.product_id,
      raw: product,
      product: product.product_name,
      type: product.type?.type_name || "",
      brand: product.brand?.brand_name || "",
      unit: product.uom?.unit_name || "",
      weight: product.unit_quantity,
      status: getProductStatus(product),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, inventoryByProductId]);

  const displayInventory = useMemo(() => {
    return inventory.map((item) => ({
      id: item.inventory_id,
      raw: item,
      product: item.product?.product_name || `Product #${item.product_id}`,
      cost: item.cost_price ?? "-",
      sellingPrice: item.selling_price,
      quantity: item.qty,
      stockStatus: getInventoryStatus(item),
    }));
  }, [inventory]);

  const displayDamageGoods = useMemo(() => {
    return damageGoods.map((item) => {
      const inventoryRecord = inventoryById.get(item.inventory_id) || item.inventory;

      return {
        id: item.damage_id,
        raw: item,
        product:
          inventoryRecord?.product?.product_name ||
          `Inventory #${item.inventory_id}`,
        quantity: item.qty,
        reason: item.reason,
        unitCost: item.unit_cost,
        lossValue: item.loss_value,
      };
    });
  }, [damageGoods, inventoryById]);

  const filteredProducts = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    if (search === "") {
      return displayProducts;
    }

    return displayProducts.filter(
      (product) =>
        product.product.toLowerCase().includes(search) ||
        product.type.toLowerCase().includes(search) ||
        product.brand.toLowerCase().includes(search) ||
        product.unit.toLowerCase().includes(search),
    );
  }, [displayProducts, searchValue]);

  const filteredInventory = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    if (search === "") {
      return displayInventory;
    }

    return displayInventory.filter(
      (item) =>
        item.product.toLowerCase().includes(search) ||
        item.stockStatus.toLowerCase().includes(search),
    );
  }, [displayInventory, searchValue]);

  const filteredDamageGoods = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    if (search === "") {
      return displayDamageGoods;
    }

    return displayDamageGoods.filter(
      (item) =>
        item.product.toLowerCase().includes(search) ||
        (item.reason || "").toLowerCase().includes(search),
    );
  }, [displayDamageGoods, searchValue]);

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

  /*
  ============================================================
  CARDS
  ============================================================
  */

  const itemsIn = displayProducts.filter((product) => product.status === "Available").length;
  const lowStock = displayProducts.filter((product) => product.status === "Low Stock").length;
  const outOfStock = displayProducts.filter(
    (product) => product.status === "Out of Stock" || product.status === "Not Stocked",
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

  const statusIconFor = (status) => (status === "Available" ? tickIcon : removeIcon);

  const statusIdFor = (status) => {
    if (status === "Available") return "available";
    if (status === "Low Stock") return "lowStock";
    return "outOfStock";
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  if (isLoading) {
    return (
      <section className="main-container">
        <div className="empty-bill-cell">Loading inventory...</div>
      </section>
    );
  }

  return (
    <>
      <section className="main-container">
        <div>
          {errorMessage && (
            <div className="empty-bill-cell" style={{ color: "#c0392b" }}>
              {errorMessage}
            </div>
          )}

          {/* ==================================================
              TABS
          ================================================== */}

          <div className="inventory-tabs">
            <button
              type="button"
              className={activeTab === "product" ? "inventory-tab active" : "inventory-tab"}
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
              className={activeTab === "inventory" ? "inventory-tab active" : "inventory-tab"}
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
              className={activeTab === "damage" ? "inventory-tab active" : "inventory-tab"}
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
                <img className="search-icon" src={searchIcon} alt="Search" />

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
                  onChange={(event) => setSearchValue(event.target.value)}
                />
              </div>
            </div>

            <div className="card_section">
              <div className="card_box">
                <div className="card_box_header">Items IN</div>
                <div className="card_box_count">{String(itemsIn).padStart(2, "0")}</div>
              </div>

              <div className="card_box">
                <div className="card_box_header">Low Stock</div>
                <div className="card_box_count">{String(lowStock).padStart(2, "0")}</div>
              </div>

              <div className="card_box">
                <div className="card_box_header">Out of Stock</div>
                <div className="card_box_count">{String(outOfStock).padStart(2, "0")}</div>
              </div>
            </div>
          </div>

          {/* ==================================================
              ADD BUTTON
          ================================================== */}

          <div className="add-product-container">
            {activeTab === "product" && (
              <button className="add-product-button" type="button" onClick={openPopup}>
                Add Product
              </button>
            )}

            {activeTab === "inventory" && (
              <button className="add-product-button" type="button" onClick={openPopup}>
                Add Inventory
              </button>
            )}

            {activeTab === "damage" && (
              <button className="add-product-button" type="button" onClick={openPopup}>
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
                        <td colSpan="7" className="empty-bill-cell">
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

                          <td className="meta-text">{product.type}</td>
                          <td className="meta-text">{product.brand}</td>
                          <td className="meta-text">{product.unit}</td>
                          <td className="meta-text">{product.weight}</td>

                          <td className="status-cell" id={statusIdFor(product.status)}>
                            <button className="status-btn" type="button" title={product.status}>
                              <img src={statusIconFor(product.status)} alt={product.status} />
                            </button>
                          </td>

                          <td className="action-buttons">
                            <button
                              className="icon-btn"
                              type="button"
                              onClick={() =>
                                setProductActionMenuId(
                                  productActionMenuId === product.id ? null : product.id,
                                )
                              }
                            >
                              <img src={moreIcon} alt="More" />
                            </button>

                            {productActionMenuId === product.id && (
                              <div className="product-action-menu">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProductActionMenuId(null);
                                    editRow(product.raw);
                                  }}
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setProductActionMenuId(null);
                                    deleteRow(product.id);
                                  }}
                                >
                                  Delete
                                </button>

                                <button
                                  type="button"
                                  onClick={() => addProductToInventory(product.raw)}
                                >
                                  Add to Inventory
                                </button>

                                <button
                                  type="button"
                                  onClick={() => addProductToDamage(product.raw)}
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
                      <th>Quantity</th>
                      <th>Stock Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-bill-cell">
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
                            {item.cost === "-" ? "-" : `₹${item.cost}`}
                          </td>

                          <td className="meta-text">₹{item.sellingPrice}</td>
                          <td className="meta-text">{item.quantity}</td>

                          <td className="status-cell" id={statusIdFor(item.stockStatus)}>
                            <button className="status-btn" type="button" title={item.stockStatus}>
                              <img src={statusIconFor(item.stockStatus)} alt={item.stockStatus} />
                            </button>
                          </td>

                          <td className="action-buttons">
                            <button
                              className="icon-btn"
                              type="button"
                              onClick={() => editInventoryRow(item.raw)}
                            >
                              <img src={pencilIcon} alt="Edit" />
                            </button>

                            <button
                              className="icon-btn"
                              type="button"
                              onClick={() => deleteInventoryRow(item.id)}
                            >
                              <img src={deleteIcon} alt="Delete" />
                            </button>
                          </td>
                        </tr>
                      ))
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
                        <td colSpan="6" className="empty-bill-cell">
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

                          <td className="meta-text">{item.quantity}</td>
                          <td className="meta-text">{item.reason}</td>
                          <td className="price">₹{item.unitCost}</td>
                          <td className="price">₹{item.lossValue}</td>

                          <td className="action-buttons">
                            <button
                              className="icon-btn"
                              type="button"
                              onClick={() => editDamageRow(item.raw)}
                            >
                              <img src={pencilIcon} alt="Edit" />
                            </button>

                            <button
                              className="icon-btn"
                              type="button"
                              onClick={() => deleteDamageRow(item.id)}
                            >
                              <img src={deleteIcon} alt="Delete" />
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
                <div className="bill-card" key={item.id}>
                  <div className="bill-card-header">
                    <strong>{item.product}</strong>

                    <div className="row-actions">
                      {activeTab === "product" && (
                        <button
                          className="edit-item-button"
                          type="button"
                          onClick={() => editRow(item.raw)}
                        >
                          <img src={pencilIcon} alt="Edit" />
                        </button>
                      )}

                      {activeTab === "inventory" && (
                        <button
                          className="edit-item-button"
                          type="button"
                          onClick={() => editInventoryRow(item.raw)}
                        >
                          <img src={pencilIcon} alt="Edit" />
                        </button>
                      )}

                      {activeTab === "damage" && (
                        <button
                          className="edit-item-button"
                          type="button"
                          onClick={() => editDamageRow(item.raw)}
                        >
                          <img src={pencilIcon} alt="Edit" />
                        </button>
                      )}

                      <button
                        className="delete-item-button"
                        type="button"
                        onClick={() => {
                          if (activeTab === "product") {
                            deleteRow(item.id);
                          } else if (activeTab === "inventory") {
                            deleteInventoryRow(item.id);
                          } else {
                            deleteDamageRow(item.id);
                          }
                        }}
                      >
                        <img src={deleteIcon} alt="Delete" />
                      </button>

                      {activeTab === "product" && (
                        <div className="mobile-product-more">
                          <button
                            className="more-item-button"
                            type="button"
                            onClick={() =>
                              setProductActionMenuId(
                                productActionMenuId === item.id ? null : item.id,
                              )
                            }
                          >
                            <img src={moreIcon} alt="More" />
                          </button>

                          {productActionMenuId === item.id && (
                            <div className="mobile-product-action-menu">
                              <button
                                type="button"
                                onClick={() => addProductToInventory(item.raw)}
                              >
                                Add to Inventory
                              </button>

                              <button type="button" onClick={() => addProductToDamage(item.raw)}>
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
                        <span className="bill-card-label">Type</span>
                        <span className="bill-card-value">{item.type}</span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">Brand</span>
                        <span className="bill-card-value">{item.brand}</span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">Unit</span>
                        <span className="bill-card-value">{item.unit}</span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">Status</span>
                        <span className="bill-card-value">
                          <button className="status-btn" type="button">
                            <img src={statusIconFor(item.status)} alt={item.status} />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {activeTab === "inventory" && (
                    <>
                      <div className="bill-card-row">
                        <span className="bill-card-label">Cost Price</span>
                        <span className="bill-card-value">
                          {item.cost === "-" ? "-" : `₹${item.cost}`}
                        </span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">Selling Price</span>
                        <span className="bill-card-value">₹{item.sellingPrice}</span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">Quantity</span>
                        <span className="bill-card-value">{item.quantity}</span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">Stock Status</span>
                        <span className="bill-card-value">
                          <button className="status-btn" type="button">
                            <img
                              src={statusIconFor(item.stockStatus)}
                              alt={item.stockStatus}
                            />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {activeTab === "damage" && (
                    <>
                      <div className="bill-card-row">
                        <span className="bill-card-label">Quantity</span>
                        <span className="bill-card-value">{item.quantity}</span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">Reason</span>
                        <span className="bill-card-value">{item.reason}</span>
                      </div>

                      <div className="bill-card-row">
                        <span className="bill-card-label">Unit Cost</span>
                        <span className="bill-card-value">₹{item.unitCost}</span>
                      </div>

                      <div className="bill-card-row bill-card-total">
                        <span className="bill-card-label">Loss Value</span>
                        <span className="bill-card-value">₹{item.lossValue}</span>
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
            <div className="pagination-text">{paginationText}</div>

            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                type="button"
                onClick={previousPage}
                disabled={currentPage === 1 || totalProducts === 0}
              >
                <img src={leftIcon} alt="Previous" />
              </button>

              <button
                className="pagination-btn"
                type="button"
                onClick={nextPage}
                disabled={currentPage >= totalPages || totalProducts === 0}
              >
                <img src={chevronIcon} alt="Next" />
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
            if (event.target === event.currentTarget) {
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
                <h2>{editingProductId !== null ? "Edit Product" : "Add Product"}</h2>

                <input
                  type="text"
                  name="productName"
                  placeholder="Product Name"
                  value={formData.productName}
                  onChange={handleInputChange}
                />

                {/* TYPE */}

                {!addingNewType ? (
                  <select name="typeId" value={formData.typeId} onChange={handleTypeChange}>
                    <option value="">Select Type</option>

                    {productTypes.map((type) => (
                      <option key={type.product_type_id} value={type.product_type_id}>
                        {type.type_name}
                      </option>
                    ))}

                    <option value="__ADD_NEW__">+ Add New Type</option>
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="typeName"
                      placeholder="Enter New Type"
                      value={formData.typeName}
                      onChange={handleInputChange}
                    />

                    <button type="button" onClick={() => setAddingNewType(false)}>
                      Use Existing Type
                    </button>
                  </div>
                )}

                {/* BRAND */}

                {!addingNewBrand ? (
                  <select name="brandId" value={formData.brandId} onChange={handleBrandChange}>
                    <option value="">Select Brand</option>

                    {productBrands.map((brand) => (
                      <option key={brand.product_brand_id} value={brand.product_brand_id}>
                        {brand.brand_name}
                      </option>
                    ))}

                    <option value="__ADD_NEW__">+ Add New Brand</option>
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="brandName"
                      placeholder="Enter New Brand"
                      value={formData.brandName}
                      onChange={handleInputChange}
                    />

                    <button type="button" onClick={() => setAddingNewBrand(false)}>
                      Use Existing Brand
                    </button>
                  </div>
                )}

                {/* UNIT */}

                <select name="unitId" value={formData.unitId} onChange={handleInputChange}>
                  <option value="">Select Unit</option>

                  {units.map((unit) => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit_name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  name="unitQuantity"
                  placeholder="Unit Quantity (e.g. 500)"
                  value={formData.unitQuantity}
                  onChange={handleInputChange}
                />

                <div className="popup-buttons">
                  <button type="button" onClick={closePopup}>
                    Close
                  </button>

                  <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
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
                <h2>{editingInventoryId !== null ? "Edit Inventory" : "Add Inventory"}</h2>

                {editingInventoryId === null ? (
                  <select name="productId" value={formData.productId} onChange={handleInputChange}>
                    <option value="">Select Product</option>

                    {products
                      .filter((product) => !inventoryByProductId.has(product.product_id))
                      .map((product) => (
                        <option key={product.product_id} value={product.product_id}>
                          {product.product_name}
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={
                      products.find((p) => p.product_id === formData.productId)?.product_name ||
                      ""
                    }
                    disabled
                  />
                )}

                <input
                  type="number"
                  name="costPrice"
                  placeholder="Cost Price"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="sellingPrice"
                  placeholder="Selling Price"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                />

                {editingInventoryId === null && (
                  <input
                    type="number"
                    name="qty"
                    placeholder="Quantity"
                    value={formData.qty}
                    onChange={handleInputChange}
                  />
                )}

                {editingInventoryId !== null && (
                  <p className="meta-text">
                    Current quantity: {formData.qty} (use Damage Goods to reduce stock)
                  </p>
                )}

                <div className="popup-buttons">
                  <button type="button" onClick={closePopup}>
                    Close
                  </button>

                  <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
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
                <h2>{editingDamageId !== null ? "Edit Damage Good" : "Add Damage Good"}</h2>

                {editingDamageId === null ? (
                  <select
                    name="inventoryId"
                    value={formData.inventoryId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Product</option>

                    {inventory.map((item) => (
                      <option key={item.inventory_id} value={item.inventory_id}>
                        {item.product?.product_name || `Product #${item.product_id}`} (
                        {item.qty} in stock)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={
                      inventoryById.get(formData.inventoryId)?.product?.product_name ||
                      `Inventory #${formData.inventoryId}`
                    }
                    disabled
                  />
                )}

                <input
                  type="number"
                  name="damageQty"
                  placeholder="Quantity"
                  value={formData.damageQty}
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
                  placeholder="Loss Value"
                  value={
                    formData.damageQty !== "" && formData.unitCost !== ""
                      ? Number(formData.damageQty) * Number(formData.unitCost)
                      : ""
                  }
                  readOnly
                />

                <div className="popup-buttons">
                  <button type="button" onClick={closePopup}>
                    Close
                  </button>

                  <button type="button" onClick={handleSubmit} disabled={isSubmitting}>
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