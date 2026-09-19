import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../utils/api", () => ({
  updateGame: vi.fn(async (_id, data) => data),
  updateSession: vi.fn(async (_id, data) => data),
  getGame: vi.fn(),
  getSession: vi.fn(),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ i18n: { languages: ["en"] } }),
}));
vi.mock("react-sync-board", async () => {
  const React = await import("react");
  return {
    useBoardConfig: () => React.useState({}),
    useMessage: () => {
      const [messages, setMessages] = React.useState([]);
      return { messages, setMessages };
    },
    useSessionInfo: () => {
      const [sessionInfo, setSessionInfo] = React.useState({});
      const updateSessionInfo = React.useCallback(
        (patch) => setSessionInfo((prev) => ({ ...prev, ...patch })),
        []
      );
      return { sessionInfo, updateSessionInfo };
    },
    useItemActions: () => {
      const items = React.useRef([]);
      return React.useMemo(
        () => ({
          getItemList: () => items.current,
          setItemList: (value) => {
            items.current = value;
          },
        }),
        []
      );
    },
  };
});

import { GameProvider, useGame } from "./useGame";
import { SessionProvider, useSession } from "./useSession";
import { updateGame, updateSession } from "../utils/api";

const legacyItem = {
  id: "token",
  type: "rect",
  grid: { type: "none", size: 5, show: false },
};
const data = {
  board: { grid: { type: "none" }, gridType: "grid", gridSize: 20 },
  items: [legacyItem],
  availableItems: [
    { name: "folder", items: [{ type: "generator", item: legacyItem }] },
  ],
};
const assertConverted = (saved) => {
  expect(saved.board).toEqual({ grid: { type: "none" } });
  expect(saved.items[0].grid).toEqual({ show: false });
  expect(saved.availableItems[0].items[0].item.grid).toEqual({ show: false });
};

describe("grid loading and saving", () => {
  it("loads, saves, and reloads converted game data", async () => {
    const wrapper = ({ children }) => (
      <GameProvider gameId="test-grid" game={data}>
        {children}
      </GameProvider>
    );
    const { result } = renderHook(() => useGame(), { wrapper });
    await waitFor(() => expect(result.current.gameLoaded).toBe(true));
    let saved;
    await act(async () => {
      saved = await result.current.saveGame();
    });
    assertConverted(saved);
    expect(updateGame).toHaveBeenCalledWith("test-grid", saved);
    await act(async () => {
      await result.current.setGame(JSON.parse(JSON.stringify(saved)));
    });
    assertConverted(await result.current.getGame());
  });
  it("loads, saves, and reloads converted session data", async () => {
    const wrapper = ({ children }) => (
      <SessionProvider sessionId="test-grid">{children}</SessionProvider>
    );
    const { result } = renderHook(() => useSession(), { wrapper });
    await act(async () => {
      await result.current.setSession(data);
    });
    let saved;
    await act(async () => {
      saved = await result.current.saveSession();
    });
    assertConverted(saved);
    expect(updateSession).toHaveBeenCalledWith("test-grid", saved);
    await act(async () => {
      await result.current.setSession(JSON.parse(JSON.stringify(saved)));
    });
    assertConverted(await result.current.getSession());
  });
});
