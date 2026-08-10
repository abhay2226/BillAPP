import leftIcon from "../assets/icons/left.png";
import addIcon from "../assets/icons/add (2).png";

function Header({ onBack, onAddProduct }) {
  return (
    <header className="inventory_section">

      <div className="left_inventory_section">
        <button
          type="button"
          className="header-icon-button"
          onClick={onBack}
        >
          <img src={leftIcon} alt="Back" />
        </button>

        <h4>Inventory</h4>
      </div>

      <div className="right_inventory_section">
        <button
          type="button"
          className="header-icon-button"
          onClick={onAddProduct}
        >
          <img src={addIcon} alt="Add Product" />
        </button>
      </div>

    </header>
  );
}

export default Header;