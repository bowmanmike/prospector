import { NextRequest } from "next/server";
import { GET, DELETE } from "../route";
import { POST } from "../../route";
import { initializeVaultHandlers, resetVaultHandlers } from "../../handlers-instance";
import { setupTestDatabase, mockVault } from "@/lib/database/__tests__/test-utils";
import { HTTP_STATUS } from "../../types";

describe("/api/vaults/[id] HTTP routes", () => {
  let cleanup: () => Promise<void>;
  let vaultId: number;

  beforeEach(async () => {
    const setup = await setupTestDatabase();
    cleanup = setup.cleanup;
    
    // Initialize handlers with test database
    initializeVaultHandlers(setup.db);

    // Create a test vault for each test
    const createRequest = new NextRequest("http://localhost:3000/api/vaults", {
      method: "POST",
      body: JSON.stringify(mockVault),
      headers: { "Content-Type": "application/json" },
    });
    const createResponse = await POST(createRequest);
    const createData = await createResponse.json();
    vaultId = createData.data.id;
  });

  afterEach(async () => {
    resetVaultHandlers();
    if (cleanup) {
      await cleanup();
    }
  });

  describe("GET /api/vaults/[id]", () => {
    it("should return 200 with vault and statistics", async () => {
      const request = new NextRequest(`http://localhost:3000/api/vaults/${vaultId}`);
      const response = await GET(request, { params: { id: vaultId.toString() } });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        id: vaultId,
        path: mockVault.path,
        name: mockVault.name,
      });
      expect(data.data.statistics).toEqual({
        note_count: 0,
        tag_count: 0,
        total_words: 0,
        total_characters: 0,
        last_modified: null,
      });
    });

    it("should return 404 for non-existent vault", async () => {
      const request = new NextRequest("http://localhost:3000/api/vaults/999");
      const response = await GET(request, { params: { id: "999" } });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(data).toEqual({
        success: false,
        error: "Vault not found",
        message: "No vault found with ID 999",
      });
    });

    it("should return 400 for invalid vault ID", async () => {
      const request = new NextRequest("http://localhost:3000/api/vaults/invalid");
      const response = await GET(request, { params: { id: "invalid" } });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data).toEqual({
        success: false,
        error: "Invalid vault ID",
        message: "Vault ID must be a valid number",
      });
    });
  });

  describe("DELETE /api/vaults/[id]", () => {
    it("should return 200 when deleting vault successfully", async () => {
      const request = new NextRequest(`http://localhost:3000/api/vaults/${vaultId}`, {
        method: "DELETE",
      });
      const response = await DELETE(request, { params: { id: vaultId.toString() } });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(data).toEqual({
        success: true,
        data: { deleted: true },
      });

      // Verify vault is actually deleted
      const getRequest = new NextRequest(`http://localhost:3000/api/vaults/${vaultId}`);
      const getResponse = await GET(getRequest, { params: { id: vaultId.toString() } });
      expect(getResponse.status).toBe(HTTP_STATUS.NOT_FOUND);
    });

    it("should return 404 for non-existent vault", async () => {
      const request = new NextRequest("http://localhost:3000/api/vaults/999", {
        method: "DELETE",
      });
      const response = await DELETE(request, { params: { id: "999" } });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(data).toEqual({
        success: false,
        error: "Vault not found",
        message: "No vault found with ID 999",
      });
    });

    it("should return 400 for invalid vault ID", async () => {
      const request = new NextRequest("http://localhost:3000/api/vaults/invalid", {
        method: "DELETE",
      });
      const response = await DELETE(request, { params: { id: "invalid" } });
      const data = await response.json();

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(data).toEqual({
        success: false,
        error: "Invalid vault ID",
        message: "Vault ID must be a valid number",
      });
    });
  });
});