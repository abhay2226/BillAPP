import React, { useCallback,useEffect, useState } from "react";
import "./Discounts.css";
import * as discountServices from "../../services/discountService";
import { getCurrentStoreId } from "../../services/api";

export default function Discounts() {
  // ============================================================
  // STATE
  // ============================================================

  const [discounts, setDiscounts] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    discount_name: "",
    discount_value: "",
    min_bill_amount: "",
    max_discount_amount: "",
    discount_from: "",
    discount_to: "",
    description: "",
    discount_type_id: "",
  });

  // ============================================================
  // LOAD DISCOUNTS
  // ============================================================

  const loadDiscounts = useCallback(async () => {
  try {
    setIsLoading(true);
    setErrorMessage("");

    const data = await discountServices.getAllDiscounts(
      statusFilter,
      searchTerm
    );

    setDiscounts(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Unable to load discounts:", error);

    setErrorMessage(
      error?.message || "Unable to load discounts."
    );

    setDiscounts([]);
  } finally {
    setIsLoading(false);
  }
}, [statusFilter, searchTerm]);

  // ============================================================
  // LOAD DISCOUNT TYPES
  // ============================================================

  const loadDiscountTypes = async () => {
    try {
      const data = await discountServices.getDiscountTypes();

      setDiscountTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load discount types:", error);

      setDiscountTypes([]);
    }
  };

  // ============================================================
  // PAGE LOAD
  // ============================================================

  useEffect(() => {
  loadDiscounts();
}, [loadDiscounts]);

  // ============================================================
  // FORM
  // ============================================================

  const resetForm = () => {
    setFormData({
      discount_name: "",
      discount_value: "",
      min_bill_amount: "",
      max_discount_amount: "",
      discount_from: "",
      discount_to: "",
      description: "",
      discount_type_id: "",
    });

    setEditingDiscount(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddDiscount = () => {
    resetForm();
    setShowForm(true);
  };

  // ============================================================
  // DATE HELPERS
  // ============================================================

  const formatDateForInput = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    const hours = String(date.getHours()).padStart(2, "0");

    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "No expiry";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString();
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (discount) => {
    setEditingDiscount(discount);

    setFormData({
      discount_name: discount.discount_name || "",

      discount_value: discount.discount_value ?? "",

      min_bill_amount: discount.min_bill_amount ?? "",

      max_discount_amount: discount.max_discount_amount ?? "",

      discount_from: formatDateForInput(
        discount.discount_from
      ),

      discount_to: formatDateForInput(
        discount.discount_to
      ),

      description: discount.description || "",

      discount_type_id: discount.discount_type_id ?? "",
    });

    setShowForm(true);
  };

  // ============================================================
  // CLOSE FORM
  // ============================================================

  const handleCloseForm = () => {
    if (isSaving) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const storeId = getCurrentStoreId();

    if (!storeId) {
      alert("No store selected.");
      return;
    }

    if (!formData.discount_name.trim()) {
      alert("Discount name is required.");
      return;
    }

    if (!formData.discount_type_id) {
      alert("Please select a discount type.");
      return;
    }

    const discountValue = Number(formData.discount_value);

    const minBillAmount = Number(formData.min_bill_amount);

    const maxDiscountAmount =
      formData.max_discount_amount.trim() === ""
        ? null
        : Number(formData.max_discount_amount);

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      alert("Discount value must be greater than 0.");
      return;
    }

    if (
      !Number.isFinite(minBillAmount) ||
      minBillAmount < 0
    ) {
      alert("Minimum bill amount cannot be negative.");
      return;
    }

    if (
      maxDiscountAmount !== null &&
      (!Number.isFinite(maxDiscountAmount) ||
        maxDiscountAmount <= 0)
    ) {
      alert(
        "Maximum discount amount must be greater than 0 if provided."
      );
      return;
    }

    if (!formData.discount_from) {
      alert("Discount start date is required.");
      return;
    }

    const startDate = new Date(formData.discount_from);

    if (Number.isNaN(startDate.getTime())) {
      alert("Invalid discount start date.");
      return;
    }

    let endDate = null;

    if (formData.discount_to) {
      endDate = new Date(formData.discount_to);

      if (Number.isNaN(endDate.getTime())) {
        alert("Invalid discount end date.");
        return;
      }

      if (endDate < startDate) {
        alert(
          "Discount end date cannot be before the start date."
        );
        return;
      }
    }

    // ==========================================================
    // SAVE
    // ==========================================================

    try {
      setIsSaving(true);

      const data = {
        discount_name: formData.discount_name.trim(),

        discount_value: discountValue,

        min_bill_amount: minBillAmount,

        max_discount_amount: maxDiscountAmount,

        discount_from: startDate.toISOString(),

        discount_to: endDate
          ? endDate.toISOString()
          : null,

        description: formData.description.trim(),

        discount_type_id: Number(
          formData.discount_type_id
        ),

        store_id: Number(storeId),
      };

      if (editingDiscount) {
        await discountServices.updateDiscount(
          editingDiscount.discount_id,
          data
        );

        alert("Discount updated successfully.");
      } else {
        await discountServices.createDiscount(data);

        alert("Discount created successfully.");
      }

      setShowForm(false);
      resetForm();

      await loadDiscounts();
    } catch (error) {
      console.error("Discount save error:", error);

      alert(
        error?.message || "Unable to save discount."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================
  // ACTIVATE / DEACTIVATE
  // ============================================================

  const handleDeactivate = async (discount) => {
    const action = discount.is_active
      ? "deactivate"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${discount.discount_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await discountServices.setDiscountActive(
        discount.discount_id,
        !discount.is_active
      );

      await loadDiscounts();
    } catch (error) {
      console.error(
        "Unable to change discount status:",
        error
      );

      alert(
        error?.message ||
          "Unable to update discount status."
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div className="discounts-page">
        <div className="discounts-header">
          <h2>DISCOUNTS</h2>
        </div>

        <div className="discount-card">
          Loading discounts...
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="discounts-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="discounts-header">

        <h2>DISCOUNTS</h2>

        <button
          className="add-discount-button"
          onClick={handleAddDiscount}
        >
          <span className="plus-icon">+</span>
          Add discount
        </button>

      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="discounts-filters">

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="ALL">
            All discounts
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Deactivated
          </option>
        </select>

        <input
          type="text"
          placeholder="Search by name or value..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {errorMessage && (
        <div className="discount-card">
          {errorMessage}
        </div>
      )}

      {/* ======================================================
          DISCOUNTS GRID
      ====================================================== */}

      <div className="discounts-grid">

        {discounts.length === 0 ? (

          <div className="discount-card">

            <div className="discount-name">
              {statusFilter === "ACTIVE"
                ? "No active discounts found."
                : statusFilter === "INACTIVE"
                  ? "No deactivated discounts found."
                  : "No discounts found."}
            </div>

          </div>

        ) : (

          discounts.map((discount) => {

            const isPercentage =
              discount.discountType?.code === "PERCENT";

            return (

              <div
                className="discount-card"
                key={discount.discount_id}
              >

                {/* ==================================================
                    CARD TOP
                ================================================== */}

                <div className="discount-card-top">

                  <div className="discount-name">

                    <span className="discount-ticket">
                      ♧
                    </span>

                    <span>
                      {discount.discount_name}
                    </span>

                  </div>

                  {discount.is_active && (
                    <div className="active-status">

                      <span className="active-dot"></span>

                      Active

                    </div>
                  )}

                  {!discount.is_active && (
                    <div className="inactive-status">
                      Deactivated
                    </div>
                  )}

                </div>

                {/* ==================================================
                    DISCOUNT VALUE
                ================================================== */}

                <div className="discount-value-row">

                  <span className="discount-value">
                    {Number(
                      discount.discount_value
                    ).toFixed(2)}
                  </span>

                  {isPercentage ? (

                    <span className="discount-type-pill percentage-pill">
                      %
                    </span>

                  ) : (

                    <span className="discount-type-pill flat-pill">
                      FLAT
                    </span>

                  )}

                </div>

                {/* ==================================================
                    DETAILS
                ================================================== */}

                <div className="discount-details">

                  <div className="detail-row">

                    <span className="detail-label">
                      Min bill
                    </span>

                    <span className="detail-value">
                      ₹
                      {Number(
                        discount.min_bill_amount
                      ).toFixed(2)}
                    </span>

                  </div>

                  <div className="detail-row">

                    <span className="detail-label">
                      Max discount
                    </span>

                    <span className="detail-value">

                      {discount.max_discount_amount != null
                        ? `₹${Number(
                            discount.max_discount_amount
                          ).toFixed(2)}`
                        : "No cap"}

                    </span>

                  </div>

                  <div className="detail-row">

                    <span className="detail-label">
                      Valid
                    </span>

                    <span className="detail-value">

                      {formatDate(
                        discount.discount_from
                      )}

                      {" - "}

                      {formatDate(
                        discount.discount_to
                      )}

                    </span>

                  </div>

                  <div className="detail-row">

                    <span className="detail-label">
                      Store
                    </span>

                    <span className="detail-value">

                      {discount.store?.store_name ||
                        discount.store_id}

                    </span>

                  </div>

                </div>

                {/* ==================================================
                    BUTTONS
                ================================================== */}

                <div className="discount-actions">

                  <button
                    className="edit-button"
                    onClick={() =>
                      handleEdit(discount)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="deactivate-button"
                    onClick={() =>
                      handleDeactivate(discount)
                    }
                  >
                    {discount.is_active
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* ======================================================
          ADD / EDIT POPUP
      ====================================================== */}

      {showForm && (

        <div className="discount-popup-overlay">

          <div className="discount-popup">

            <h2>
              {editingDiscount
                ? "Edit discount"
                : "Add discount"}
            </h2>

            <form onSubmit={handleSubmit}>

              {/* Discount name */}

              <div className="popup-field">

                <label>
                  Discount name
                </label>

                <input
                  type="text"
                  name="discount_name"
                  value={formData.discount_name}
                  onChange={handleInputChange}
                />

              </div>

              {/* Discount type */}

              <div className="popup-field">

                <label>
                  Discount type
                </label>

                <select
                  name="discount_type_id"
                  value={formData.discount_type_id}
                  onChange={handleInputChange}
                >

                  <option value="">
                    Select discount type
                  </option>

                  {discountTypes.map((type) => (

                    <option
                      key={type.discount_type_id}
                      value={type.discount_type_id}
                    >
                      {type.code}
                      {" - "}
                      {type.description}
                    </option>

                  ))}

                </select>

              </div>

              {/* Discount value */}

              <div className="popup-field">

                <label>
                  Discount value
                </label>

                <input
                  type="number"
                  name="discount_value"
                  min="0"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                />

              </div>

              {/* Minimum bill */}

              <div className="popup-field">

                <label>
                  Minimum bill amount
                </label>

                <input
                  type="number"
                  name="min_bill_amount"
                  min="0"
                  step="0.01"
                  value={formData.min_bill_amount}
                  onChange={handleInputChange}
                />

              </div>

              {/* Maximum discount */}

              <div className="popup-field">

                <label>
                  Maximum discount amount (optional)
                </label>

                <input
                  type="number"
                  name="max_discount_amount"
                  min="0"
                  step="0.01"
                  value={formData.max_discount_amount}
                  onChange={handleInputChange}
                />

              </div>

              {/* Valid from */}

              <div className="popup-field">

                <label>
                  Valid from
                </label>

                <input
                  type="datetime-local"
                  name="discount_from"
                  value={formData.discount_from}
                  onChange={handleInputChange}
                />

              </div>

              {/* Valid until */}

              <div className="popup-field">

                <label>
                  Valid until
                </label>

                <input
                  type="datetime-local"
                  name="discount_to"
                  value={formData.discount_to}
                  onChange={handleInputChange}
                />

              </div>

              {/* Description */}

              <div className="popup-field">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />

              </div>

              {/* Buttons */}

              <div className="popup-buttons">

                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingDiscount
                      ? "Save changes"
                      : "Create discount"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}