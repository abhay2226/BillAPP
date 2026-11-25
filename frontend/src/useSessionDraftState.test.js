import { act, renderHook } from "@testing-library/react";
import useSessionDraftState from "./useSessionDraftState";

describe("useSessionDraftState", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("restores saved values for the same user and keeps users isolated", () => {
    const firstRender = renderHook(() =>
      useSessionDraftState("inventory", "search", "", 7)
    );

    act(() => {
      firstRender.result.current[1]("brake pads");
    });
    firstRender.unmount();

    const restoredRender = renderHook(() =>
      useSessionDraftState("inventory", "search", "", 7)
    );
    const otherUserRender = renderHook(() =>
      useSessionDraftState("inventory", "search", "", 8)
    );

    expect(restoredRender.result.current[0]).toBe("brake pads");
    expect(otherUserRender.result.current[0]).toBe("");
  });
});
