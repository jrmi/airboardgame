import React from "react";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  load: null,
  calls: [],
  saveSession: vi.fn(async () => {
    mocks.calls.push("save");
  }),
  setSession: vi.fn(),
  uploadMedia: vi.fn(async () => {
    mocks.calls.push("upload");
    return "/uploaded/image.jpg";
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (text) => text }),
}));
vi.mock("../../hooks/useSession", () => ({
  default: () => ({
    saveSession: mocks.saveSession,
    setSession: mocks.setSession,
    sessionId: "new-session",
  }),
}));
vi.mock("../../utils/api", () => ({
  uploadResourceImage: mocks.uploadMedia,
}));
vi.mock("../../utils/image", () => ({
  ItemMediaUploader: class {
    constructor(onFile) {
      this.onFile = onFile;
    }

    async upload(item) {
      return item;
    }

    async uploadMedia(media) {
      if (media?.file) {
        return this.onFile(media.file);
      }
      return media;
    }
  },
}));
vi.mock("../../ui/Modal", () => ({
  default: ({ children }) => children,
}));
vi.mock("./LoadData", () => ({
  default: ({ onLoad }) => {
    mocks.load = onLoad;
    return null;
  },
}));

import LoadSessionModal from "./LoadSessionModal";

describe("session import", () => {
  beforeEach(() => {
    mocks.load = null;
    mocks.calls = [];
    mocks.saveSession.mockClear();
    mocks.setSession.mockClear();
    mocks.uploadMedia.mockClear();
  });

  it("creates the session before uploading embedded files", async () => {
    render(<LoadSessionModal show setShow={() => {}} />);

    await act(async () => {
      await mocks.load({
        game: {
          items: [],
          availableItems: [],
          board: { imageUrl: { file: "board.bin" } },
        },
        files: { "board.bin": new Blob(["image"]) },
      });
    });

    expect(mocks.saveSession).toHaveBeenCalledWith(true);
    expect(mocks.calls).toEqual(["save", "upload"]);
    expect(mocks.setSession).toHaveBeenCalledOnce();
  });
});
