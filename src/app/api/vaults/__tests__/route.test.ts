import { NextRequest } from "next/server";
import { GET, POST } from "../route";
import { initializeVaultHandlers, resetVaultHandlers } from "../handlers-instance";
import { setupTestDatabase, mockVault } from "@/lib/database/__tests__/test-utils";
import { HTTP_STATUS } from "../types";

describe("/api/vaults HTTP routes", () => {
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    const setup = await setupTestDatabase();
    cleanup = setup.cleanup;
    
    // Initialize handlers with test database
    initializeVaultHandlers(setup.db);
  });

  afterEach(async () => {
    resetVaultHandlers();
    if (cleanup) {
      await cleanup();
    }
  });

  describe("GET /api/vaults", () => {
    it("should return 200 with empty array when no vaults exist", async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(data).toEqual({
        success: true,
        data: [],
      });
    });

    it("should return 200 with vaults array when vaults exist", async () => {
      // Create a vault first
      const createRequest = new NextRequest("http://localhost:3000/api/vaults", {
        method: "POST",
        body: JSON.stringify(mockVault),
        headers: { "Content-Type": "application/json" },
      });
      await POST(createRequest);

      // Then get all vaults
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toMatchObject({
        path: mockVault.path,
        name: mockVault.name,
      });
    });
  });

  describe("POST /api/vaults", () => {
    it("should return 201 when creating vault successfully", async () => {
      const request = new NextRequest("http://localhost:3000/api/vaults", {
        method: "POST",
        body: JSON.stringify(mockVault),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        path: mockVault.path,
        name: mockVault.name,
      });
      expect(data.data).toHaveProperty("id");
      expect(data.data).toHaveProperty("created_at");
    });

    it("should return 400 when path is missing", async () => {
      const invalidVault = { name: "Test Vault" };
      const request = new NextRequest("http://localhost:3000/api/vaults", {
        method: "POST",
        body: JSON.stringify(invalidVault),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data).toEqual({
        success: false,
        error: "Missing required fields",
        message: "Both 'path' and 'name' are required",
      });
    });

    it("should return 400 when name is missing", async () => {
      const invalidVault = { path: "/test/vault" };
      const request = new NextRequest("http://localhost:3000/api/vaults", {
        method: "POST",
        body: JSON.stringify(invalidVault),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data).toEqual({
        success: false,
        error: "Missing required fields",
        message: "Both 'path' and 'name' are required",
      });
    });

    it("should return 409 when vault path already exists", async () => {
      // Create first vault
      const request1 = new NextRequest("http://localhost:3000/api/vaults", {
        method: "POST",
        body: JSON.stringify(mockVault),
        headers: { "Content-Type": "application/json" },
      });
      await POST(request1);

      // Try to create duplicate
      const duplicateVault = { ...mockVault, name: "Different Name" };
      const request2 = new NextRequest("http://localhost:3000/api/vaults", {
        method: "POST",
        body: JSON.stringify(duplicateVault),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request2);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.CONFLICT);
      expect(data).toEqual({
        success: false,
        error: "Vault already exists",
        message: `A vault with path '${mockVault.path}' already exists`,
      });
    });

    it("should return 500 when JSON parsing fails", async () => {
      const request = new NextRequest("http://localhost:3000/api/vaults", {
        method: "POST",
        body: "invalid json",
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Failed to create vault");
    });
  });
});