import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "../page";

// Mock the storage module
jest.mock("@/lib/storage", () => ({
  vaultStorage: {
    getVaultSettings: jest.fn(),
    saveVaultFiles: jest.fn(),
    clearVaultSettings: jest.fn(),
    isValidObsidianVault: jest.fn(),
    getVaultFiles: jest.fn(),
    init: jest.fn(),
  },
}));

import { vaultStorage } from "@/lib/storage";

const mockVaultStorage = vaultStorage as jest.Mocked<typeof vaultStorage>;

describe("Home Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Load", () => {
    it("should render the main heading", () => {
      mockVaultStorage.getVaultSettings.mockResolvedValue(null);

      render(<Home />);

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
      mockVaultStorage.getVaultSettings.mockImplementation(
        () => new Promise(() => {}),
      ); // Never resolves

      render(<Home />);

      expect(screen.getByText("Loading existing vault...")).toBeInTheDocument();
      expect(
        screen.getByRole("progressbar", { hidden: true }),
      ).toBeInTheDocument(); // spinner
    });

    it("should show vault selection UI when no vault exists", async () => {
      mockVaultStorage.getVaultSettings.mockResolvedValue(null);

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Select your Obsidian vault directory to get started",
          ),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole("button", { name: "Select Vault Directory" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Your browser will request permission to access files. This is required to read your vault.",
        ),
      ).toBeInTheDocument();
    });

    it("should load existing vault settings on mount", async () => {
      const mockSettings = {
        id: "current-vault",
        directoryPath: "test-vault",
        name: "test-vault",
        files: [
          {
            path: "test-vault/.obsidian/config.json",
            lastModified: 123,
            size: 50,
            type: "application/json",
          },
        ],
        lastAccessed: 1234567890000,
      };

      mockVaultStorage.getVaultSettings.mockResolvedValue(mockSettings);
      mockVaultStorage.isValidObsidianVault.mockResolvedValue(true);

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText("Your vault is connected and ready to use"),
        ).toBeInTheDocument();
      });

      expect(screen.getByText("test-vault")).toBeInTheDocument();
      expect(
        screen.getByText("✓ Valid Obsidian vault detected"),
      ).toBeInTheDocument();
    });

    it("should show invalid vault warning for non-Obsidian directories", async () => {
      const mockSettings = {
        id: "current-vault",
        directoryPath: "invalid-vault",
        name: "invalid-vault",
        files: [
          {
            path: "invalid-vault/file.txt",
            lastModified: 123,
            size: 50,
            type: "text/plain",
          },
        ],
        lastAccessed: 1234567890000,
      };

      mockVaultStorage.getVaultSettings.mockResolvedValue(mockSettings);
      mockVaultStorage.isValidObsidianVault.mockResolvedValue(false);

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "⚠ No .obsidian folder found - this may not be a valid Obsidian vault",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Vault Selection", () => {
    it("should handle directory selection", async () => {
      const user = userEvent.setup();
      mockVaultStorage.getVaultSettings.mockResolvedValue(null);
      mockVaultStorage.saveVaultFiles.mockResolvedValue();

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Select Vault Directory" }),
        ).toBeInTheDocument();
      });

      // Mock file selection
      const fileInput = screen
        .getByRole("button", { name: "Select Vault Directory" })
        .parentElement?.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();

      const mockFiles = [
        new File(["content"], "file1.md", {
          webkitRelativePath: "test-vault/file1.md",
          type: "text/markdown",
        }),
        new File(["{}"], ".obsidian/config.json", {
          webkitRelativePath: "test-vault/.obsidian/config.json",
          type: "application/json",
        }),
      ];

      Object.defineProperty(fileInput, "files", {
        value: mockFiles,
        writable: false,
      });

      fireEvent.change(fileInput, { target: { files: mockFiles } });

      await waitFor(() => {
        expect(mockVaultStorage.saveVaultFiles).toHaveBeenCalledWith(
          mockFiles,
          "test-vault",
        );
      });

      expect(screen.getByText("test-vault")).toBeInTheDocument();
      expect(
        screen.getByText("✓ Valid Obsidian vault detected"),
      ).toBeInTheDocument();
    });

    it("should detect invalid vault during selection", async () => {
      mockVaultStorage.getVaultSettings.mockResolvedValue(null);
      mockVaultStorage.saveVaultFiles.mockResolvedValue();

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Select Vault Directory" }),
        ).toBeInTheDocument();
      });

      const fileInput = screen
        .getByRole("button", { name: "Select Vault Directory" })
        .parentElement?.querySelector('input[type="file"]');

      const mockFiles = [
        new File(["content"], "file1.txt", {
          webkitRelativePath: "invalid-vault/file1.txt",
          type: "text/plain",
        }),
      ];

      Object.defineProperty(fileInput, "files", {
        value: mockFiles,
        writable: false,
      });

      fireEvent.change(fileInput, { target: { files: mockFiles } });

      await waitFor(() => {
        expect(
          screen.getByText(
            "⚠ No .obsidian folder found - this may not be a valid Obsidian vault",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should handle empty file selection", async () => {
      mockVaultStorage.getVaultSettings.mockResolvedValue(null);

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Select Vault Directory" }),
        ).toBeInTheDocument();
      });

      const fileInput = screen
        .getByRole("button", { name: "Select Vault Directory" })
        .parentElement?.querySelector('input[type="file"]');

      fireEvent.change(fileInput, { target: { files: [] } });

      // Should not crash and should not save anything
      expect(mockVaultStorage.saveVaultFiles).not.toHaveBeenCalled();
    });
  });

  describe("Connected Vault Actions", () => {
    beforeEach(async () => {
      const mockSettings = {
        id: "current-vault",
        directoryPath: "test-vault",
        name: "test-vault",
        files: [
          {
            path: "test-vault/.obsidian/config.json",
            lastModified: 123,
            size: 50,
            type: "application/json",
          },
        ],
        lastAccessed: 1234567890000,
      };

      mockVaultStorage.getVaultSettings.mockResolvedValue(mockSettings);
      mockVaultStorage.isValidObsidianVault.mockResolvedValue(true);
    });

    it("should show change vault and clear vault buttons when connected", async () => {
      render(<Home />);

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
      const user = userEvent.setup();
      mockVaultStorage.clearVaultSettings.mockResolvedValue();

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Clear Vault" }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Clear Vault" }));

      expect(mockVaultStorage.clearVaultSettings).toHaveBeenCalled();

      await waitFor(() => {
        expect(
          screen.getByText(
            "Select your Obsidian vault directory to get started",
          ),
        ).toBeInTheDocument();
      });
    });

    it("should handle change vault action", async () => {
      const user = userEvent.setup();

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Change Vault" }),
        ).toBeInTheDocument();
      });

      const changeButton = screen.getByRole("button", { name: "Change Vault" });

      // Should trigger file input click
      await user.click(changeButton);

      // The file input should be accessible for new selection
      const fileInput =
        changeButton.parentElement?.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle storage errors gracefully", async () => {
      mockVaultStorage.getVaultSettings.mockRejectedValue(
        new Error("Storage error"),
      );

      // Mock console.error to avoid test output noise
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Select your Obsidian vault directory to get started",
          ),
        ).toBeInTheDocument();
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading existing vault:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle clear vault errors", async () => {
      const user = userEvent.setup();

      // Set up connected state
      const mockSettings = {
        id: "current-vault",
        directoryPath: "test-vault",
        name: "test-vault",
        files: [],
        lastAccessed: 1234567890000,
      };

      mockVaultStorage.getVaultSettings.mockResolvedValue(mockSettings);
      mockVaultStorage.isValidObsidianVault.mockResolvedValue(true);
      mockVaultStorage.clearVaultSettings.mockRejectedValue(
        new Error("Clear error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "Clear Vault" }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "Clear Vault" }));

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error clearing directory:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle vault validation errors", async () => {
      const mockSettings = {
        id: "current-vault",
        directoryPath: "test-vault",
        name: "test-vault",
        files: [],
        lastAccessed: 1234567890000,
      };

      mockVaultStorage.getVaultSettings.mockResolvedValue(mockSettings);
      mockVaultStorage.isValidObsidianVault.mockRejectedValue(
        new Error("Validation error"),
      );

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("test-vault")).toBeInTheDocument();
      });

      // Should eventually show invalid state after validation error
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error validating vault:",
          expect.any(Error),
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
