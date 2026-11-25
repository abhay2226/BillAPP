import { render, screen } from "@testing-library/react";
import BillHistory from "./BillHistory";
import { AuthProvider } from "../../components/layout/AuthContext";

jest.mock("../../services/billService", () => ({
  getBillHistory: jest.fn().mockResolvedValue([]),
}));

describe("bill history filters", () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(
      "user",
      JSON.stringify({ userId: 7 })
    );
    sessionStorage.setItem("token", "test-token");
    sessionStorage.setItem(
      "billapp.pageDraft.7.billHistory.searchTerm",
      JSON.stringify("INV-2026")
    );
    sessionStorage.setItem(
      "billapp.pageDraft.7.billHistory.dateFrom",
      JSON.stringify("2026-01-01")
    );
    sessionStorage.setItem(
      "billapp.pageDraft.7.billHistory.dateTo",
      JSON.stringify("2026-01-31")
    );
    sessionStorage.setItem(
      "billapp.pageDraft.7.billHistory.sortOption",
      JSON.stringify("date-asc")
    );
  });

  test("restores search and date filters after refresh", async () => {
    render(
      <AuthProvider>
        <BillHistory />
      </AuthProvider>
    );

    expect(
      screen.getByPlaceholderText(
        "Search by bill number or customer phone"
      )
    ).toHaveValue("INV-2026");

    const dateInputs = document.querySelectorAll(
      'input[type="date"]'
    );
    expect(dateInputs[0]).toHaveValue("2026-01-01");
    expect(dateInputs[1]).toHaveValue("2026-01-31");
    expect(screen.getByRole("combobox")).toHaveValue("date-asc");

    expect(
      await screen.findByText("No bills yet.")
    ).toBeInTheDocument();
  });
});
