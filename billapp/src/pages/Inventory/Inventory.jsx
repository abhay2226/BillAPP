import { useEffect, useMemo, useState } from "react";

// import { useOutletContext } from "react-router-dom";

import searchIcon from "../../assets/icons/search.png";
import leftIcon from "../../assets/icons/left.png";
import chevronIcon from "../../assets/icons/chevron.png";
import tickIcon from "../../assets/icons/tick.png";
import removeIcon from "../../assets/icons/remove.png";
import pencilIcon from "../../assets/icons/pencil.png";
import deleteIcon from "../../assets/icons/delete.png";

import "./Inventory.css";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  // // SIDEBAR TOGGLE
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  // EDIT
  const [editingProductId, setEditingProductId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 6;

  const [formData, setFormData] = useState({
    product: "",
    type: "",
    brand: "",
    cost: "",
    weight: "",
    quantity: "",
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
    setShowPopup(true);
  };

//   useEffect(() => {
//   setHeaderAction(() => openPopup);

//   return () => {
//     setHeaderAction(null);
//   };
// }, [setHeaderAction]);

  const closePopup = () => {
    setShowPopup(false);

    setEditingProductId(null);

    setFormData({
      product: "",
      type: "",
      brand: "",
      cost: "",
      weight: "",
      quantity: "",
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
    const productStatus = formData.status;

    if (
      product === "" ||
      formData.cost === "" ||
      productWeight === "" ||
      formData.quantity === "" ||
      productType === "" ||
      productBrand === ""
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

    // EDIT
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
            };
          }

          return item;
        }),
      );
    }

    // ADD
    else {
      const newProduct = {
        id: Date.now(),
        product,
        cost: productCost,
        weight: productWeight,
        quantity: productQuantity,
        status: productStatus,
        type: productType,
        brand: productBrand,
      };

      setProducts((previousProducts) => [
        ...previousProducts,
        newProduct,
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
      cost: product.cost,
      weight: product.weight,
      quantity: product.quantity,
      status: product.status,
    });

    setEditingProductId(product.id);

    setShowPopup(true);
  };

  const filteredProducts = useMemo(() => {
    const search = searchValue.toLowerCase().trim();

    if (search === "") {
      return products;
    }

    return products.filter((product) =>
      product.product.toLowerCase().includes(search),
    );
  }, [products, searchValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  // PAGINATION

  const totalProducts = filteredProducts.length;

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

  const currentProducts = filteredProducts.slice(
    startIndex,
    endIndex,
  );

  // PREVIOUS PAGE

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((previous) => previous - 1);
    }
  };

  // NEXT PAGE

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((previous) => previous + 1);
    }
  };

  // CARD COUNTS

  const itemsIn = products.filter(
    (product) => product.status === "Available",
  ).length;

  const lowStock = products.filter(
    (product) => product.status === "Low Stock",
  ).length;

  const outOfStock = products.filter(
    (product) => product.status === "Out of Stock",
  ).length;

  let paginationText = "Showing 0 of 0 products";

  if (totalProducts > 0) {
    const firstProduct = startIndex + 1;

    const lastProduct = Math.min(endIndex, totalProducts);

    paginationText = `Showing ${firstProduct}-${lastProduct} of
${totalProducts} products`;
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
        <div
          // className={
          //   sidebarOpen
          //     ? "main-content sidebar-open"
          //     : "main-content"
          // }
        >

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
                placeholder="Search Product"
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
              <div className="card_box_header">
                Items IN
              </div>

              <div className="card_box_count">
                {String(itemsIn).padStart(2, "0")}
              </div>
            </div>

            <div className="card_box">
              <div className="card_box_header">
                Low Stock
              </div>

              <div className="card_box_count">
                {String(lowStock).padStart(2, "0")}
              </div>
            </div>

            <div className="card_box">
              <div className="card_box_header">
                Out of Stock
              </div>

              <div className="card_box_count">
                {String(outOfStock).padStart(2, "0")}
              </div>
            </div>

          </div>

          <div className="add-product-container">
              <button  className="add-product-button" type="button"
onClick={openPopup}>
                Add Product to Inventory
              </button>
          </div>

          {/* TABLE */}
          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>Item</th>
                  <th>Cost</th>
                  <th>Weight</th>
                  <th>Qty</th>
                  <th>Status</th>
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
                      Add Items to Inventory
                    </td>
                  </tr>
                ) : (
                  currentProducts.map((product) => (

                    <tr key={product.id}>

                      <td>
                        <div className="item">

                          <strong>
                            {product.product}
                          </strong>

                          <small>
                            ({product.type} - {product.brand})
                          </small>

                        </div>
                      </td>

                      <td className="price">
                        ₹{product.cost}
                      </td>

                      <td className="meta-text">
                        {product.weight}
                      </td>

                      <td className="meta-text">
                        {product.quantity}
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
                              product.status === "Out of Stock"
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
                          onClick={() => editRow(product)}
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
                            deleteRow(product.id)
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

            </table>

          </div>

          {/* BILL CARDS (mobile) */}
          <div className="bill-cards-container">
            {currentProducts.length === 0 ? (
              <div className="empty-bill-cell">
                Add Items to Inventory.
              </div>
            ) : (
              currentProducts.map((product) => (
                <div className="bill-card" key={product.id}>
                  <div className="bill-card-header">
                    <strong>{product.product}</strong>
                    <div className="row-actions">
                      <button
                        className="edit-item-button"
                        type="button"
                        onClick={() => editRow(product)}
                        aria-label={`Edit ${product.product}`}
                      >
                        <img src={pencilIcon} alt="Edit" />
                      </button>
                      <button
                        className="delete-item-button"
                        type="button"
                        onClick={() => deleteRow(product.id)}
                        aria-label={`Remove ${product.product}`}
                      >
                        <img src={deleteIcon} alt="Delete" />
                      </button>
                    </div>
                  </div>

                  <div className="bill-card-row">
                    <span className="bill-card-label">Type / Brand</span>
                    <span className="bill-card-value">
                      {product.type} - {product.brand}
                    </span>
                  </div>

                  <div className="bill-card-row">
                    <span className="bill-card-label">Price</span>
                    <span
className="bill-card-value">₹{product.cost.toFixed(2)}</span>
                  </div>
                  <div className="bill-card-row bill-card-total">
                    <span className="bill-card-label">Weight</span>
                    <span className="bill-card-value">
                      {product.weight}
                    </span>
                  </div>

                  <div className="bill-card-row">
                    <span className="bill-card-label">Qty</span>
                    <span className="bill-card-value">
                      {product.quantity}
                    </span>
                  </div>

                  <div className="bill-card-row bill-card-status">
                    <span className="bill-card-label">Status</span>
                    <span
                      className="bill-card-value"
                      id={
                        product.status === "Available"
                          ? "available"
                          : product.status === "Low Stock"
                          ? "lowStock"
                          : "outOfStock"
                      }
                    >
                      <button className="status-btn" type="button">
                        <img
                          src={product.status === "Out of Stock" ?
removeIcon : tickIcon}
                          alt={product.status}
                        />
                      </button>
                    </span>
                  </div>

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

        {/* SIDEBAR */}
        {/* {sidebarOpen && <Sidebar />} */}

      </section>

      {/* BOTTOM NAV */}
      {/* <BottomNav /> */}

      {/* ADD PRODUCT POPUP */}
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

            <h2>
              {editingProductId !== null
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <input
              type="text"
              name="product"
              placeholder="Item"
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

          </div>

        </div>

      )}

    </>
  );
}

export default Inventory;
