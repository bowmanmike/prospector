import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Home from "../page";

// Mock the Server Actions
jest.mock("@/app/actions/vault-actions", () => ({
  createVault: jest.fn(),
  getVaults: jest.fn(),
  deleteVault: jest.fn(),
}));

import {
  createVault,
  deleteVault,
  getVaults,
} from "@/app/actions/vault-actions";

const mockCreateVault = createVault as jest.MockedFunction<typeof createVault>;
const mockGetVaults = getVaults as jest.MockedFunction<typeof getVaults>;
const mockDeleteVault = deleteVault as jest.MockedFunction<typeof deleteVault>;

const mockVault = {
  id: 1,
  name: "test-vault",
  path: "test-vault",
  created_at: "2023-01-01T00:00:00.000Z",
};

describe("Home Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Load", () => {
    it("should render the main heading", async () => {
      mockGetVaults.mockResolvedValue({ success: true, data: [] });

      await act(async () => {
        render(<Home />);
      });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Prospector",
      );
      expect(
        screen.getByText(
          "AI-powered knowledge discovery for your Obsidian vault",
        ),
      ).toBeInTheDocument();
    });

    it("should show loading state initially", async () => {
      mockGetVaults.mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      await act(async () => {
        render(<Home />);
      });

      expect(
        screen.getByText("Loading existing vaults..."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Loading existing vaults...").previousElementSibling,
      ).toHaveClass("animate-spin"); // spinner
    });

    it("should show vault selection UI when no vault exists", async () => {
      mockGetVaults.mockResolvedValue({ success: true, data: [] });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Select Vault Directory" }),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText("Select your Obsidian vault directory to get started"),
      ).toBeInTheDocument();
    });

    it("should load existing vault on mount", async () => {
      mockGetVaults.mockResolvedValue({ success: true, data: [mockVault] });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(screen.getByText("test-vault")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Your vault is connected and ready to use"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("✓ Valid Obsidian vault detected"),
      ).toBeInTheDocument();
    });

    it("should handle loading error gracefully", async () => {
      mockGetVaults.mockRejectedValue(new Error("Database error"));

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(
          screen.getByText("Failed to load existing vaults"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Vault Selection", () => {
    beforeEach(() => {
      mockGetVaults.mockResolvedValue({ success: true, data: [] });
    });

    it("should handle directory selection with valid Obsidian vault", async () => {
      mockCreateVault.mockResolvedValue({ success: true, data: mockVault });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Select Vault Directory" }),
        ).toBeInTheDocument();
      });

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      // Mock file selection with Obsidian vault
      const mockFiles = [
        new File([""], "config.json", { type: "application/json" }),
        new File([""], "note.md", { type: "text/markdown" }),
      ];

      // Add webkitRelativePath property to mock files
      Object.defineProperty(mockFiles[0], "webkitRelativePath", {
        value: "test-vault/.obsidian/config.json",
        writable: false,
      });
      Object.defineProperty(mockFiles[1], "webkitRelativePath", {
        value: "test-vault/note.md",
        writable: false,
      });

      // Create a mock FileList
      const mockFileList = {
        0: mockFiles[0],
        1: mockFiles[1],
        length: 2,
        item: (index: number) => mockFiles[index],
        [Symbol.iterator]: function* () {
          for (let i = 0; i < this.length; i++) {
            yield this[i];
          }
        },
      } as unknown as FileList;

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: mockFileList } });
      });

      await waitFor(() => {
        expect(mockCreateVault).toHaveBeenCalledWith({
          name: "test-vault",
          path: "test-vault",
        });
      });

      await waitFor(() => {
        expect(screen.getByText("test-vault")).toBeInTheDocument();
      });
    });

    it("should detect invalid vault during selection", async () => {
      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Select Vault Directory" }),
        ).toBeInTheDocument();
      });

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      // Mock file selection without .obsidian folder
      const mockFiles = [new File([""], "note.md", { type: "text/markdown" })];

      Object.defineProperty(mockFiles[0], "webkitRelativePath", {
        value: "test-vault/note.md",
        writable: false,
      });

      const mockFileList = {
        0: mockFiles[0],
        length: 1,
        item: (index: number) => mockFiles[index],
        [Symbol.iterator]: function* () {
          for (let i = 0; i < this.length; i++) {
            yield this[i];
          }
        },
      } as unknown as FileList;

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: mockFileList } });
      });

      // Should not call createVault for invalid vault
      expect(mockCreateVault).not.toHaveBeenCalled();
    });

    it("should handle empty file selection", async () => {
      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Select Vault Directory" }),
        ).toBeInTheDocument();
      });

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [] } });
      });

      expect(mockCreateVault).not.toHaveBeenCalled();
    });

    it("should handle create vault error", async () => {
      mockCreateVault.mockRejectedValue(new Error("Vault already exists"));

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Select Vault Directory" }),
        ).toBeInTheDocument();
      });

      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const mockFiles = [
        new File([""], "config.json", { type: "application/json" }),
      ];

      Object.defineProperty(mockFiles[0], "webkitRelativePath", {
        value: "test-vault/.obsidian/config.json",
        writable: false,
      });

      const mockFileList = {
        0: mockFiles[0],
        length: 1,
        item: (index: number) => mockFiles[index],
        [Symbol.iterator]: function* () {
          for (let i = 0; i < this.length; i++) {
            yield this[i];
          }
        },
      } as unknown as FileList;

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: mockFileList } });
      });

      await waitFor(() => {
        expect(screen.getByText("Vault already exists")).toBeInTheDocument();
      });
    });
  });

  describe("Connected Vault Actions", () => {
    beforeEach(() => {
      mockGetVaults.mockResolvedValue({ success: true, data: [mockVault] });
    });

    it("should show change vault and clear vault buttons when connected", async () => {
      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Change Vault" }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Clear Vault" }),
        ).toBeInTheDocument();
      });
    });

    it("should handle vault clearing", async () => {
      mockDeleteVault.mockResolvedValue({
        success: true,
        data: { deleted: true },
      });

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Clear Vault" }),
        ).toBeInTheDocument();
      });

      const clearButton = screen.getByRole("button", { name: "Clear Vault" });

      await act(async () => {
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(mockDeleteVault).toHaveBeenCalledWith(1);
      });

      // Should show vault selection again after clearing
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Select Vault Directory" }),
        ).toBeInTheDocument();
      });
    });

    it("should handle change vault action", async () => {
      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Change Vault" }),
        ).toBeInTheDocument();
      });

      const changeButton = screen.getByRole("button", { name: "Change Vault" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      // Mock the file input click
      const clickSpy = jest
        .spyOn(fileInput, "click")
        .mockImplementation(() => {});

      await act(async () => {
        fireEvent.click(changeButton);
      });

      expect(clickSpy).toHaveBeenCalled();

      clickSpy.mockRestore();
    });

    it("should handle clear vault errors", async () => {
      mockDeleteVault.mockRejectedValue(new Error("Delete failed"));

      await act(async () => {
        render(<Home />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Clear Vault" }),
        ).toBeInTheDocument();
      });

      const clearButton = screen.getByRole("button", { name: "Clear Vault" });

      await act(async () => {
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Delete failed")).toBeInTheDocument();
      });
    });
  });
});
