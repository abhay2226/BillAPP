import { render, screen, waitFor } from "@testing-library/react";
import Billing from "./Voicebilling";
import { AuthProvider } from "../../components/layout/AuthContext";

jest.mock("../../services/inventoryService", () => ({
  getInventory: jest.fn().mockResolvedValue([]),
}));

jest.mock("../../services/discountService", () => ({
  getAllDiscounts: jest.fn().mockResolvedValue([]),
}));

describe("billing draft persistence", () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(
      "user",
      JSON.stringify({ userId: 7 })
    );
    sessionStorage.setItem("token", "test-token");
    sessionStorage.setItem(
      "billapp.billingDraft.7",
      JSON.stringify({
        items: [
          {
            id: "saved-item",
            name: "Restored Product",
            quantity: 1,
            total: 12.5,
          },
        ],
        showSuccessScreen: true,
        billNumber: "BILL-TEST-1",
        billDate: "2025-01-01",
        successTotalAmount: 12.5,
        successBillSummary: {
          subtotal: 12.5,
          discount: 0,
          tax: 0,
        },
      })
    );
  });

  test("restores the saved receipt after the page is refreshed", async () => {
    render(
      <AuthProvider>
        <Billing />
      </AuthProvider>
    );

    expect(screen.getByText("BILL-TEST-1")).toBeInTheDocument();
    expect(screen.getByText("Restored Product")).toBeInTheDocument();

    await waitFor(() => {
      const savedDraft = JSON.parse(
        sessionStorage.getItem("billapp.billingDraft.7")
      );
      expect(savedDraft.billNumber).toBe("BILL-TEST-1");
    });
  });
});
