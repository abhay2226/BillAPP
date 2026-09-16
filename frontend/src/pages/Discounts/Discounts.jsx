import React from "react";
import "./Discounts.css";

const discounts = [
  {
    name: "Festival Offer",
    active: true,
    value: "10% OFF",
    type: "percentage",
    minBill: "Rs 500",
    maxDiscount: "Rs 200",
    valid: "08 Sep – 30 Sep",
    store: "Store 1",
  },
  {
    name: "New Year Offer",
    active: true,
    value: "Rs 100 OFF",
    type: "flat",
    minBill: "Rs 1,000",
    maxDiscount: "Rs 100",
    valid: "No expiry",
    store: "Store 1",
  },
];

export default function Discounts() {
  const handleAddDiscount = () => {
    console.log("Add discount clicked");
  };

  const handleEdit = (discount) => {
    console.log("Edit:", discount.name);
  };

  const handleDeactivate = (discount) => {
    console.log("Deactivate:", discount.name);
  };

  return (
    <div className="discounts-page">
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

      <div className="discounts-grid">
        {discounts.map((discount, index) => (
          <div className="discount-card" key={index}>
            {/* Card Top */}
            <div className="discount-card-top">
              <div className="discount-name">
                <span className="discount-ticket">♧</span>
                <span>{discount.name}</span>
              </div>

              {discount.active && (
                <div className="active-status">
                  <span className="active-dot"></span>
                  Active
                </div>
              )}
            </div>

            {/* Discount Value */}
            <div className="discount-value-row">
              <span className="discount-value">
                {discount.value}
              </span>

              {discount.type === "percentage" ? (
                <span className="discount-type-pill percentage-pill">
                  %
                </span>
              ) : (
                <span className="discount-type-pill flat-pill">
                  FLAT
                </span>
              )}
            </div>

            {/* Discount Details */}
            <div className="discount-details">
              <div className="detail-row">
                <span className="detail-label">Min bill</span>
                <span className="detail-value">
                  {discount.minBill}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Max discount</span>
                <span className="detail-value">
                  {discount.maxDiscount}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Valid</span>
                <span className="detail-value">
                  {discount.valid}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Store</span>
                <span className="detail-value">
                  {discount.store}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="discount-actions">
              <button
                className="edit-button"
                onClick={() => handleEdit(discount)}
              >
                Edit
              </button>

              <button
                className="deactivate-button"
                onClick={() => handleDeactivate(discount)}
              >
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}