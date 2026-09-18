import React, { useCallback, useEffect, useState } from "react";
import * as discountServices from "../../services/discountService";
import { getCurrentStoreId } from "../../services/api";
import "./Discounts.css";


export default function Discounts() {
  // ======================================================
  // STATE
  // ======================================================

  const [discounts, setDiscounts] = useState([]);
  const [discountTypes, setDiscountTypes] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);

  const [formData, setFormData] = useState({
    discount_name: "",
    discount_type_id: "",
    discount_value: "",
    min_bill_amount: "",
    max_discount_amount: "",
    discount_from: "",
    discount_to: "",
    description: "",
  });

  const storeId = getCurrentStoreId();

  // ======================================================
  // LOAD DISCOUNTS
  // ======================================================

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

  // ======================================================
  // LOAD DISCOUNT TYPES
  // ======================================================

  const loadDiscountTypes = useCallback(async () => {
    try {
      const data = await discountServices.getDiscountTypes();

      setDiscountTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load discount types:", error);

      setDiscountTypes([]);
    }
  }, []);

  // ======================================================
  // EFFECTS
  // ======================================================

  useEffect(() => {
    loadDiscountTypes();
  }, [loadDiscountTypes]);

  useEffect(() => {
    loadDiscounts();
  }, [loadDiscounts]);

  // ======================================================
  // FORM HANDLERS
  // ======================================================

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // ======================================================
  // OPEN ADD FORM
  // ======================================================

  function handleAddDiscount() {
    setEditingDiscount(null);

    setFormData({
      discount_name: "",
      discount_type_id: "",
      discount_value: "",
      min_bill_amount: "",
      max_discount_amount: "",
      discount_from: "",
      discount_to: "",
      description: "",
    });

    setShowForm(true);
  }

  // ======================================================
  // OPEN EDIT FORM
  // ======================================================

  function handleEditDiscount(discount) {
    setEditingDiscount(discount);

    setFormData({
      discount_name: discount.discount_name || "",
      discount_type_id: discount.discount_type_id || "",
      discount_value: discount.discount_value ?? "",
      min_bill_amount: discount.min_bill_amount ?? "",
      max_discount_amount: discount.max_discount_amount ?? "",
      discount_from: discount.discount_from
        ? discount.discount_from.slice(0, 16)
        : "",
      discount_to: discount.discount_to
        ? discount.discount_to.slice(0, 16)
        : "",
      description: discount.description || "",
    });

    setShowForm(true);
  }

  // ======================================================
  // CLOSE FORM
  // ======================================================

  function handleCloseForm() {
    setShowForm(false);
    setEditingDiscount(null);
  }

  // ======================================================
  // SUBMIT CREATE / UPDATE
  // ======================================================

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setErrorMessage("");

      if (!storeId) {
        throw new Error("Store ID is missing.");
      }

      if (!formData.discount_name.trim()) {
        throw new Error("Discount name is required.");
      }

      if (!formData.discount_type_id) {
        throw new Error("Discount type is required.");
      }

      if (formData.discount_value === "") {
        throw new Error("Discount value is required.");
      }

      const discountValue = Number(formData.discount_value);
      const minBillAmount =
        formData.min_bill_amount === ""
          ? 0
          : Number(formData.min_bill_amount);

      const maxDiscountAmount =
        formData.max_discount_amount === ""
          ? null
          : Number(formData.max_discount_amount);

      if (Number.isNaN(discountValue) || discountValue < 0) {
        throw new Error("Discount value must be a valid positive number.");
      }

      if (Number.isNaN(minBillAmount) || minBillAmount < 0) {
        throw new Error("Minimum bill amount must be valid.");
      }

      if (
        maxDiscountAmount !== null &&
        (Number.isNaN(maxDiscountAmount) || maxDiscountAmount < 0)
      ) {
        throw new Error("Maximum discount amount must be valid.");
      }

      let startDate = null;
      let endDate = null;

      if (formData.discount_from) {
        startDate = new Date(formData.discount_from);

        if (Number.isNaN(startDate.getTime())) {
          throw new Error("Invalid start date.");
        }
      }

      if (formData.discount_to) {
        endDate = new Date(formData.discount_to);

        if (Number.isNaN(endDate.getTime())) {
          throw new Error("Invalid end date.");
        }

        if (startDate && endDate < startDate) {
          throw new Error(
            "Discount end date cannot be before the start date."
          );
        }
      }

      const data = {
        discount_name: formData.discount_name.trim(),

        discount_value: discountValue,

        min_bill_amount: minBillAmount,

        max_discount_amount: maxDiscountAmount,

        discount_from: startDate
          ? startDate.toISOString()
          : null,

        discount_to: endDate
          ? endDate.toISOString()
          : null,

        description: formData.description.trim(),

        discount_type_id: Number(formData.discount_type_id),

        store_id: Number(storeId),
      };

      if (editingDiscount) {
        await discountServices.updateDiscount(
          editingDiscount.discount_id,
          data
        );
      } else {
        await discountServices.createDiscount(data);
      }

      handleCloseForm();

      await loadDiscounts();
    } catch (error) {
      console.error("Unable to save discount:", error);

      setErrorMessage(
        error?.message || "Unable to save discount."
      );
    }
  }

  // ======================================================
  // ACTIVATE / DEACTIVATE
  // ======================================================

  async function handleToggleActive(discount) {
    try {
      setErrorMessage("");

      await discountServices.setDiscountActive(
        discount.discount_id,
        !discount.is_active
      );

      await loadDiscounts();
    } catch (error) {
      console.error("Unable to update discount status:", error);

      setErrorMessage(
        error?.message || "Unable to update discount status."
      );
    }
  }

  // ======================================================
  // FORMAT DATE
  // ======================================================

  function formatDate(dateValue) {
    if (!dateValue) {
      return "No date";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ======================================================
  // GET DISCOUNT TYPE NAME
  // ======================================================

  function getDiscountTypeName(discount) {
    if (discount.discountType?.code) {
      return discount.discountType.code;
    }

    const type = discountTypes.find(
      (item) =>
        Number(item.discount_type_id) ===
        Number(discount.discount_type_id)
    );

    return type?.code || type?.description || "Discount";
  }

  // ======================================================
  // GET REAL-TIME STATUS
  // (is_active flag alone doesn't say whether the discount
  // is actually usable right now — it could be scheduled
  // for the future or already past its end date)
  // ======================================================

  function getDiscountStatus(discount) {
    if (!discount.is_active) {
      return { label: "Deactivated", className: "status-deactivated" };
    }

    const now = new Date();
    const from = discount.discount_from ? new Date(discount.discount_from) : null;
    const to = discount.discount_to ? new Date(discount.discount_to) : null;

    if (from && from > now) {
      return { label: "Scheduled", className: "status-scheduled" };
    }

    if (to && to < now) {
      return { label: "Expired", className: "status-expired" };
    }

    return { label: "Active", className: "status-active" };
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="discounts-page">

      {/* ==================================================
          HEADER
      ================================================== */}

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

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="discounts-filters">

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
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
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {errorMessage && (
        <div className="discount-error">
          {errorMessage}
        </div>
      )}

      {/* ==================================================
          LOADING
      ================================================== */}

      {isLoading ? (
        <div className="discount-loading">
          Loading discounts...
        </div>
      ) : discounts.length === 0 ? (
        <div className="discount-empty">
          No discounts found.
        </div>
      ) : (
        <div className="discounts-grid">

          {discounts.map((discount) => {
            const status = getDiscountStatus(discount);

            return (
            <div
              className={`discount-card ${
                discount.is_active
                  ? "active-discount"
                  : "inactive-discount"
              }`}
              key={discount.discount_id}
            >

              {/* CARD HEADER */}

              <div className="discount-card-header">

                <div>
                  <h3>
                    {discount.discount_name}
                  </h3>

                  <span className="discount-type">
                    {getDiscountTypeName(discount)}
                  </span>
                </div>

                <span className={status.className}>
                  {status.label}
                </span>

              </div>

              {/* DISCOUNT VALUE */}

              <div className="discount-value">

                {getDiscountTypeName(discount)
                  .toLowerCase()
                  .includes("percent")
                  ? `${discount.discount_value}%`
                  : `₹${Number(
                      discount.discount_value || 0
                    ).toFixed(2)}`}

              </div>

              {/* DETAILS */}

              <div className="discount-details">

                <div>
                  <span>Minimum bill</span>

                  <strong>
                    ₹
                    {Number(
                      discount.min_bill_amount || 0
                    ).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Maximum discount</span>

                  <strong>
                    {discount.max_discount_amount != null
                      ? `₹${Number(
                          discount.max_discount_amount
                        ).toFixed(2)}`
                      : "No limit"}
                  </strong>
                </div>

                <div>
                  <span>Valid from</span>

                  <strong>
                    {formatDate(
                      discount.discount_from
                    )}
                  </strong>
                </div>

                <div>
                  <span>Valid until</span>

                  <strong>
                    {discount.discount_to
                      ? formatDate(
                          discount.discount_to
                        )
                      : "No expiry"}
                  </strong>
                </div>

              </div>

              {/* DESCRIPTION */}

              {discount.description && (
                <p className="discount-description">
                  {discount.description}
                </p>
              )}

              {/* ACTIONS */}

              <div className="discount-actions">

                <button
                  className="edit-discount-button"
                  onClick={() =>
                    handleEditDiscount(discount)
                  }
                >
                  Edit
                </button>

                <button
                  className={
                    discount.is_active
                      ? "deactivate-discount-button"
                      : "activate-discount-button"
                  }
                  onClick={() =>
                    handleToggleActive(discount)
                  }
                >
                  {discount.is_active
                    ? "Deactivate"
                    : "Activate"}
                </button>

              </div>

            </div>
            );
          })}

        </div>
      )}

      {/* ==================================================
          ADD / EDIT POPUP
      ================================================== */}

      {showForm && (
        <div className="discount-modal-overlay">

          <div className="discount-modal">

            <div className="discount-modal-header">

              <h2>
                {editingDiscount
                  ? "Edit Discount"
                  : "Add Discount"}
              </h2>

              <button
                className="close-modal-button"
                onClick={handleCloseForm}
                type="button"
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* DISCOUNT NAME */}

              <div className="form-group">

                <label>
                  Discount name
                </label>

                <input
                  type="text"
                  name="discount_name"
                  value={formData.discount_name}
                  onChange={handleInputChange}
                  placeholder="Example: Summer Sale"
                  required
                />

              </div>

              {/* DISCOUNT TYPE */}

              <div className="form-group">

                <label>
                  Discount type
                </label>

                <select
                  name="discount_type_id"
                  value={formData.discount_type_id}
                  onChange={handleInputChange}
                  required
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
                      {type.description
                        ? ` - ${type.description}`
                        : ""}
                    </option>

                  ))}

                </select>

              </div>

              {/* DISCOUNT VALUE */}

              <div className="form-group">

                <label>
                  Discount value
                </label>

                <input
                  type="number"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Example: 10"
                  required
                />

              </div>

              {/* MINIMUM BILL */}

              <div className="form-group">

                <label>
                  Minimum bill amount
                </label>

                <input
                  type="number"
                  name="min_bill_amount"
                  value={formData.min_bill_amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Example: 500"
                />

              </div>

              {/* MAXIMUM DISCOUNT */}

              <div className="form-group">

                <label>
                  Maximum discount amount
                </label>

                <input
                  type="number"
                  name="max_discount_amount"
                  value={formData.max_discount_amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Leave empty for no limit"
                />

              </div>

              {/* VALID FROM */}

              <div className="form-group">

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

              {/* VALID TO */}

              <div className="form-group">

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

              {/* DESCRIPTION */}

              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description"
                  rows="3"
                />

              </div>

              {/* FORM ACTIONS */}

              <div className="discount-form-actions">

                <button
                  type="button"
                  className="cancel-discount-button"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-discount-button"
                >
                  {editingDiscount
                    ? "Update Discount"
                    : "Create Discount"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

