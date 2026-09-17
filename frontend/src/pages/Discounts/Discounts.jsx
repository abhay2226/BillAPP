
import React, { useEffect, useState } from "react";
import "./Discounts.css";

import * as discountService from "../../services/discountService";

const emptyForm = {
  discountName: "",
  value: "",
  discountType: "percentage",
  minBill: "",
  maxDiscount: "",
  validFrom: "",
  validTo: "",
  description: "",
};

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /*
  ============================================================
  LOAD DISCOUNTS
  ============================================================
  */

  const loadDiscounts = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await discountService.getActiveDiscounts();

      setDiscounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load discounts error:", error);

      setErrorMessage(
        error.message || "Failed to load discounts."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  /*
  ============================================================
  RESET FORM
  ============================================================
  */

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setEditingDiscountId(null);
  };

  /*
  ============================================================
  OPEN ADD POPUP
  ============================================================
  */

  const handleAddDiscount = () => {
    resetForm();
    setShowPopup(true);
  };

  /*
  ============================================================
  CLOSE POPUP
  ============================================================
  */

  const closePopup = () => {
    if (isSubmitting) {
      return;
    }

    setShowPopup(false);
    resetForm();
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
  HELPER: GET DISCOUNT ID
  ============================================================
  */

  const getDiscountId = (discount) => {
    return discount.discount_id || discount.id;
  };

  /*
  ============================================================
  HELPER: GET DISCOUNT TYPE
  ============================================================
  */

  const getDiscountType = (discount) => {
    const type =
      discount.discount_type?.type_code ||
      discount.discount_type?.type_name ||
      discount.discount_type_name ||
      discount.type ||
      "";

    return String(type).toLowerCase();
  };

  /*
  ============================================================
  HELPER: GET DISCOUNT VALUE
  ============================================================
  */

  const getDiscountNumericValue = (discount) => {
    return Number(
      discount.discount_value ??
      discount.value ??
      0
    );
  };

  /*
  ============================================================
  EDIT DISCOUNT
  ============================================================
  */

  const handleEdit = (discount) => {
    const discountId = getDiscountId(discount);

    setEditingDiscountId(discountId);

    const type = getDiscountType(discount);

    const isPercentage =
      type.includes("percentage") ||
      type.includes("percent");

    setFormData({
      discountName:
        discount.discount_name ||
        discount.name ||
        "",

      value:
        discount.discount_value ??
        discount.value ??
        "",

      discountType: isPercentage
        ? "percentage"
        : "flat",

      minBill:
        discount.min_bill_amount ??
        discount.min_bill ??
        discount.minBill ??
        "",

      maxDiscount:
        discount.max_discount_amount ??
        discount.max_discount ??
        discount.maxDiscount ??
        "",

      validFrom:
        discount.discount_from
          ? String(discount.discount_from).slice(0, 10)
          : discount.valid_from
            ? String(discount.valid_from).slice(0, 10)
            : discount.from
              ? String(discount.from).slice(0, 10)
              : "",

      validTo:
        discount.discount_to
          ? String(discount.discount_to).slice(0, 10)
          : discount.valid_to
            ? String(discount.valid_to).slice(0, 10)
            : discount.to
              ? String(discount.to).slice(0, 10)
              : "",

      description:
        discount.description || "",
    });

    setShowPopup(true);
  };

  /*
  ============================================================
  VALIDATION
  ============================================================
  */

  const validateForm = () => {
    const name = formData.discountName.trim();

    const value = Number(formData.value);
    const minBill = Number(formData.minBill);
    const maxDiscount = Number(formData.maxDiscount);

    if (!name) {
      alert("Please enter discount name.");
      return false;
    }

    if (
      formData.value === "" ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      alert("Discount value must be greater than 0.");
      return false;
    }

    if (
      formData.discountType === "percentage" &&
      value > 100
    ) {
      alert("Percentage discount cannot be greater than 100.");
      return false;
    }

    if (
      formData.minBill === "" ||
      !Number.isFinite(minBill) ||
      minBill < 0
    ) {
      alert("Please enter a valid minimum bill.");
      return false;
    }

    if (
      formData.maxDiscount === "" ||
      !Number.isFinite(maxDiscount) ||
      maxDiscount < 0
    ) {
      alert("Please enter a valid maximum discount.");
      return false;
    }

    if (!formData.validFrom) {
      alert("Please select valid from date.");
      return false;
    }

    if (!formData.validTo) {
      alert("Please select valid to date.");
      return false;
    }

    if (formData.validFrom > formData.validTo) {
      alert("Valid To date cannot be before Valid From date.");
      return false;
    }

    return true;
  };

  /*
  ============================================================
  ADD / UPDATE DISCOUNT
  ============================================================
  */

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const payload = {
      discount_name: formData.discountName.trim(),

      discount_type_id:
        formData.discountType === "percentage"
          ? 1
          : 2,

      discount_value: Number(formData.value),

      min_bill_amount: Number(formData.minBill),

      max_discount_amount: Number(formData.maxDiscount),

      discount_from: formData.validFrom,

      discount_to: formData.validTo || null,

      description: formData.description.trim(),
    };

    setIsSubmitting(true);

    try {
      if (editingDiscountId !== null) {
        await discountService.updateDiscount(
          editingDiscountId,
          payload
        );
      } else {
        await discountService.createDiscount(payload);
      }

      await loadDiscounts();

      setShowPopup(false);
      resetForm();
    } catch (error) {
      console.error("Save discount error:", error);

      alert(
        error.message || "Failed to save discount."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
  ============================================================
  DEACTIVATE DISCOUNT
  ============================================================
  */

  const handleDeactivate = async (discount) => {
    const discountId = getDiscountId(discount);

    const discountName =
      discount.discount_name ||
      discount.name ||
      "this discount";

    if (
      !window.confirm(
        `Deactivate "${discountName}"?`
      )
    ) {
      return;
    }

    try {
      await discountService.deactivateDiscount(
        discountId
      );

      await loadDiscounts();
    } catch (error) {
      console.error("Deactivate discount error:", error);

      alert(
        error.message ||
        "Failed to deactivate discount."
      );
    }
  };

  /*
  ============================================================
  FORMAT HELPERS
  ============================================================
  */

  const getDiscountValue = (discount) => {
    const value = getDiscountNumericValue(discount);

    const type = getDiscountType(discount);

    if (
      type.includes("percentage") ||
      type.includes("percent")
    ) {
      return `${value}% OFF`;
    }

    return `Rs ${value} OFF`;
  };

  const getMinBill = (discount) => {
    const value =
      discount.min_bill_amount ??
      discount.min_bill ??
      discount.minBill ??
      0;

    return `Rs ${Number(value).toLocaleString("en-IN")}`;
  };

  const getMaxDiscount = (discount) => {
    const value =
      discount.max_discount_amount ??
      discount.max_discount ??
      discount.maxDiscount ??
      0;

    return `Rs ${Number(value).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date).slice(0, 10);
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const getValidDate = (discount) => {
    const from =
      discount.discount_from ||
      discount.valid_from ||
      discount.from;

    const to =
      discount.discount_to ||
      discount.valid_to ||
      discount.to;

    if (!from && !to) {
      return "No expiry";
    }

    if (from && to) {
      return `${formatDate(from)} – ${formatDate(to)}`;
    }

    if (from) {
      return `From ${formatDate(from)}`;
    }

    return `Until ${formatDate(to)}`;
  };

  const getStoreName = (discount) => {
    return (
      discount.store?.store_name ||
      discount.store_name ||
      discount.store?.name ||
      "Current Store"
    );
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (isLoading) {
    return (
      <div className="discounts-page">
        <div className="discounts-loading">
          Loading discounts...
        </div>
      </div>
    );
  }

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div className="discounts-page">

      {/* HEADER */}

      <div className="discounts-header">
        <h2>DISCOUNTS</h2>

        <button
          className="add-discount-button"
          type="button"
          onClick={handleAddDiscount}
        >
          <span className="plus-icon">+</span>
          Add discount
        </button>
      </div>

      {/* ERROR */}

      {errorMessage && (
        <div className="discount-error">
          {errorMessage}
        </div>
      )}

      {/* DISCOUNT CARDS */}

      <div className="discounts-grid">

        {discounts.length === 0 ? (
          <div className="no-discounts">
            <p>No discounts added yet.</p>

            <button
              type="button"
              onClick={handleAddDiscount}
            >
              Add Discount
            </button>
          </div>
        ) : (
          discounts.map((discount) => {
            const type = getDiscountType(discount);

            const isPercentage =
              type.includes("percentage") ||
              type.includes("percent");

            return (
              <div
                className="discount-card"
                key={getDiscountId(discount)}
              >

                {/* CARD TOP */}

                <div className="discount-card-top">

                  <div className="discount-name">
                    <span className="discount-ticket">
                      ♧
                    </span>

                    <span>
                      {discount.discount_name ||
                        discount.name}
                    </span>
                  </div>

                  <div className="active-status">
                    <span className="active-dot"></span>
                    Active
                  </div>

                </div>

                {/* DISCOUNT VALUE */}

                <div className="discount-value-row">

                  <span className="discount-value">
                    {getDiscountValue(discount)}
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

                {/* DETAILS */}

                <div className="discount-details">

                  <div className="detail-row">
                    <span className="detail-label">
                      Min bill
                    </span>

                    <span className="detail-value">
                      {getMinBill(discount)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      Max discount
                    </span>

                    <span className="detail-value">
                      {getMaxDiscount(discount)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      Valid
                    </span>

                    <span className="detail-value">
                      {getValidDate(discount)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="detail-label">
                      Store
                    </span>

                    <span className="detail-value">
                      {getStoreName(discount)}
                    </span>
                  </div>

                </div>

                {/* ACTIONS */}

                <div className="discount-actions">

                  <button
                    className="edit-button"
                    type="button"
                    onClick={() =>
                      handleEdit(discount)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="deactivate-button"
                    type="button"
                    onClick={() =>
                      handleDeactivate(discount)
                    }
                  >
                    Deactivate
                  </button>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* ADD / EDIT POPUP */}

      {showPopup && (
        <div
          className="discount-popup"
          onClick={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closePopup();
            }
          }}
        >

          <div className="discount-popup-content">

            <div className="discount-popup-header">

              <h2>
                {editingDiscountId !== null
                  ? "Edit Discount"
                  : "Add Discount"}
              </h2>

              <button
                type="button"
                className="discount-popup-close"
                onClick={closePopup}
              >
                ×
              </button>

            </div>

            {/* DISCOUNT NAME */}

            <label>
              Discount Name
            </label>

            <input
              type="text"
              name="discountName"
              placeholder="e.g. Festival Offer"
              value={formData.discountName}
              onChange={handleInputChange}
            />

            {/* TYPE */}

            <label>
              Discount Type
            </label>

            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleInputChange}
            >
              <option value="percentage">
                Percentage
              </option>

              <option value="flat">
                Flat
              </option>
            </select>

            {/* VALUE */}

            <label>
              Discount Value
            </label>

            <div className="discount-value-input">

              <input
                type="number"
                name="value"
                placeholder={
                  formData.discountType === "percentage"
                    ? "e.g. 10"
                    : "e.g. 100"
                }
                min="0"
                value={formData.value}
                onChange={handleInputChange}
              />

              <span>
                {formData.discountType === "percentage"
                  ? "%"
                  : "Rs"}
              </span>

            </div>

            {/* MIN BILL */}

            <label>
              Minimum Bill
            </label>

            <input
              type="number"
              name="minBill"
              placeholder="e.g. 500"
              min="0"
              value={formData.minBill}
              onChange={handleInputChange}
            />

            {/* MAX DISCOUNT */}

            <label>
              Maximum Discount
            </label>

            <input
              type="number"
              name="maxDiscount"
              placeholder="e.g. 200"
              min="0"
              value={formData.maxDiscount}
              onChange={handleInputChange}
            />

            {/* DATES */}

            <div className="discount-date-row">

              <div>
                <label>
                  Valid From
                </label>

                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label>
                  Valid To
                </label>

                <input
                  type="date"
                  name="validTo"
                  value={formData.validTo}
                  onChange={handleInputChange}
                />
              </div>

            </div>

            {/* DESCRIPTION */}

            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Enter discount description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />

            {/* STORE */}

            <label>
              Store
            </label>

            <input
              type="text"
              value="Current Store"
              disabled
              readOnly
            />

            {/* BUTTONS */}

            <div className="discount-popup-buttons">

              <button
                type="button"
                className="discount-cancel-button"
                onClick={closePopup}
                disabled={isSubmitting}
              >
                Close
              </button>

              <button
                type="button"
                className="discount-submit-button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : editingDiscountId !== null
                    ? "Update Discount"
                    : "Add Discount"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}