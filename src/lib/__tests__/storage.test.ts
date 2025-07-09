import { vaultStorage } from "../storage";

// Mock IndexedDB
const mockDB = {
  transaction: jest.fn(),
  objectStoreNames: {
    contains: jest.fn(),
  },
  createObjectStore: jest.fn(),
};

const mockObjectStore = {
  put: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
};

const mockTransaction = {
  objectStore: jest.fn(() => mockObjectStore),
};

const mockRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null,
};

const createMockRequest = () => ({
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
});

// Mock IndexedDB.open
global.indexedDB = {
  open: jest.fn(() => mockRequest),
  deleteDatabase: jest.fn(),
};

describe("VaultStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDB.transaction.mockReturnValue(mockTransaction);
    mockDB.objectStoreNames.contains.mockReturnValue(false);
  });

  describe("init", () => {
    it("should initialize the database successfully", async () => {
      const initPromise = vaultStorage.init();

      // Simulate successful database opening
      mockRequest.result = mockDB;
      mockRequest.onsuccess?.();

      await expect(initPromise).resolves.toBeUndefined();
      expect(global.indexedDB.open).toHaveBeenCalledWith("prospector-db", 1);
    });

    it("should handle database initialization errors", async () => {
      const initPromise = vaultStorage.init();

      // Simulate error
      mockRequest.error = new Error("Database error");
      mockRequest.onerror?.();

      await expect(initPromise).rejects.toThrow("Database error");
    });

    it("should create object store on upgrade", async () => {
      const initPromise = vaultStorage.init();

      // Simulate upgrade needed
      const upgradeEvent = { target: { result: mockDB } };
      mockRequest.onupgradeneeded?.(upgradeEvent);

      expect(mockDB.createObjectStore).toHaveBeenCalledWith("vault-settings", {
        keyPath: "id",
      });

      // Complete initialization
      mockRequest.result = mockDB;
      mockRequest.onsuccess?.();

      await expect(initPromise).resolves.toBeUndefined();
    });
  });

  describe("saveVaultFiles", () => {
    it("should save vault files successfully", async () => {
      // Mock successful init
      const initPromise = vaultStorage.init();
      mockRequest.result = mockDB;
      mockRequest.onsuccess?.();
      await initPromise;

      // Create mock files
      const mockFiles = [
        new File(["content1"], "file1.md", {
          type: "text/markdown",
          lastModified: 1234567890000,
          webkitRelativePath: "vault/file1.md",
        }),
        new File(["content2"], ".obsidian/config.json", {
          type: "application/json",
          lastModified: 1234567890000,
          webkitRelativePath: "vault/.obsidian/config.json",
        }),
      ];

      const mockFileList = new FileList(mockFiles);

      // Mock successful transaction
      const putRequest = createMockRequest();
      mockObjectStore.put.mockReturnValue(putRequest);

      const savePromise = vaultStorage.saveVaultFiles(mockFileList, "vault");

      // Simulate successful put operation
      putRequest.onsuccess?.();

      await expect(savePromise).resolves.toBeUndefined();

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ["vault-settings"],
        "readwrite",
      );
      expect(mockObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "current-vault",
          directoryPath: "vault",
          name: "vault",
          files: expect.arrayContaining([
            expect.objectContaining({
              path: "vault/file1.md",
              type: "text/markdown",
              size: 8,
            }),
            expect.objectContaining({
              path: "vault/.obsidian/config.json",
              type: "application/json",
              size: 8,
            }),
          ]),
          lastAccessed: expect.any(Number),
        }),
      );
    });

    it("should handle save errors", async () => {
      // Mock successful init
      const initPromise = vaultStorage.init();
      mockRequest.result = mockDB;
      mockRequest.onsuccess?.();
      await initPromise;

      const mockFiles = [
        new File(["content"], "file.md", {
          webkitRelativePath: "vault/file.md",
        }),
      ];
      const mockFileList = new FileList(mockFiles);

      const putRequest = createMockRequest();
      putRequest.error = new Error("Save failed");
      mockObjectStore.put.mockReturnValue(putRequest);

      const savePromise = vaultStorage.saveVaultFiles(mockFileList, "vault");

      // Simulate error
      putRequest.onerror?.();

      await expect(savePromise).rejects.toThrow("Save failed");
    });
  });

  describe("getVaultSettings", () => {
    it("should retrieve vault settings successfully", async () => {
      // Mock successful init
      const initPromise = vaultStorage.init();
      mockRequest.result = mockDB;
      mockRequest.onsuccess?.();
      await initPromise;

      const mockSettings = {
        id: "current-vault",
        directoryPath: "vault",
        name: "vault",
        files: [],
        lastAccessed: 1234567890000,
      };

      const getRequest = createMockRequest();
      getRequest.result = mockSettings;
      mockObjectStore.get.mockReturnValue(getRequest);

      const getPromise = vaultStorage.getVaultSettings();

      // Simulate successful get operation
      getRequest.onsuccess?.();

      const result = await getPromise;

      expect(result).toEqual(mockSettings);
      expect(mockDB.transaction).toHaveBeenCalledWith(
        ["vault-settings"],
        "readonly",
      );
      expect(mockObjectStore.get).toHaveBeenCalledWith("current-vault");
    });

    it("should return null when no settings exist", async () => {
      // Mock successful init
      const initPromise = vaultStorage.init();
      mockRequest.result = mockDB;
      mockRequest.onsuccess?.();
      await initPromise;

      const getRequest = createMockRequest();
      getRequest.result = undefined;
      mockObjectStore.get.mockReturnValue(getRequest);

      const getPromise = vaultStorage.getVaultSettings();

      // Simulate no result
      getRequest.onsuccess?.();

      const result = await getPromise;

      expect(result).toBeNull();
    });
  });

  describe("clearVaultSettings", () => {
    it("should clear vault settings successfully", async () => {
      // Mock successful init
      const initPromise = vaultStorage.init();
      mockRequest.result = mockDB;
      mockRequest.onsuccess?.();
      await initPromise;

      const deleteRequest = createMockRequest();
      mockObjectStore.delete.mockReturnValue(deleteRequest);

      const clearPromise = vaultStorage.clearVaultSettings();

      // Simulate successful delete operation
      deleteRequest.onsuccess?.();

      await expect(clearPromise).resolves.toBeUndefined();

      expect(mockDB.transaction).toHaveBeenCalledWith(
        ["vault-settings"],
        "readwrite",
      );
      expect(mockObjectStore.delete).toHaveBeenCalledWith("current-vault");
    });
  });

  describe("isValidObsidianVault", () => {
    it("should return true for valid Obsidian vault", async () => {
      const files = [
        {
          path: "vault/file1.md",
          lastModified: 123,
          size: 100,
          type: "text/markdown",
        },
        {
          path: "vault/.obsidian/config.json",
          lastModified: 123,
          size: 50,
          type: "application/json",
        },
        {
          path: "vault/notes/note.md",
          lastModified: 123,
          size: 200,
          type: "text/markdown",
        },
      ];

      const result = await vaultStorage.isValidObsidianVault(files);

      expect(result).toBe(true);
    });

    it("should return true for vault with .obsidian directory", async () => {
      const files = [
        {
          path: "vault/file1.md",
          lastModified: 123,
          size: 100,
          type: "text/markdown",
        },
        { path: "vault/.obsidian", lastModified: 123, size: 0, type: "" },
      ];

      const result = await vaultStorage.isValidObsidianVault(files);

      expect(result).toBe(true);
    });

    it("should return false for invalid vault", async () => {
      const files = [
        {
          path: "vault/file1.md",
          lastModified: 123,
          size: 100,
          type: "text/markdown",
        },
        {
          path: "vault/file2.txt",
          lastModified: 123,
          size: 50,
          type: "text/plain",
        },
      ];

      const result = await vaultStorage.isValidObsidianVault(files);

      expect(result).toBe(false);
    });

    it("should return false for empty file list", async () => {
      const files = [];

      const result = await vaultStorage.isValidObsidianVault(files);

      expect(result).toBe(false);
    });
  });

  describe("getVaultFiles", () => {
    it("should return files from vault settings", async () => {
      // Mock successful init
      const initPromise = vaultStorage.init();
      mockRequest.result = mockDB;
      mockRequest.onsuccess?.();
      await initPromise;

      const mockFiles = [
        {
          path: "vault/file1.md",
          lastModified: 123,
          size: 100,
          type: "text/markdown",
        },
      ];

      const mockSettings = {
        id: "current-vault",
        directoryPath: "vault",
        name: "vault",
        files: mockFiles,
        lastAccessed: 1234567890000,
      };

      const getRequest = createMockRequest();
      getRequest.result = mockSettings;
      mockObjectStore.get.mockReturnValue(getRequest);

      const getPromise = vaultStorage.getVaultFiles();

      // Simulate successful get operation
      getRequest.onsuccess?.();

      const result = await getPromise;

      expect(result).toEqual(mockFiles);
    });

    it("should return empty array when no settings exist", async () => {
      // Mock successful init
      const initPromise = vaultStorage.init();
      mockRequest.result = mockDB;
      mockRequest.onsuccess?.();
      await initPromise;

      const getRequest = createMockRequest();
      getRequest.result = undefined;
      mockObjectStore.get.mockReturnValue(getRequest);

      const getPromise = vaultStorage.getVaultFiles();

      // Simulate no result
      getRequest.onsuccess?.();

      const result = await getPromise;

      expect(result).toEqual([]);
    });
  });
});
