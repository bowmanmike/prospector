import { NextRequest, NextResponse } from "next/server";
import { getVaultHandlers } from "../handlers-instance";
import { HTTP_STATUS } from "../types";

interface RouteParams {
  params: { id: string };
}

// GET /api/vaults/[id] - Get vault with statistics
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const vaultId = parseInt(params.id);
    
    if (isNaN(vaultId)) {
      return NextResponse.json({
        success: false,
        error: "Invalid vault ID",
        message: "Vault ID must be a valid number",
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const handlers = await getVaultHandlers();
    const vaultWithStats = await handlers.getWithStats(vaultId);
    
    return NextResponse.json({
      success: true,
      data: vaultWithStats,
    }, { status: HTTP_STATUS.OK });
  } catch (error) {
    if (error instanceof Error && error.message.includes("No vault found")) {
      return NextResponse.json({
        success: false,
        error: "Vault not found",
        message: error.message,
      }, { status: HTTP_STATUS.NOT_FOUND });
    }
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch vault",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

// DELETE /api/vaults/[id] - Delete vault
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const vaultId = parseInt(params.id);
    
    if (isNaN(vaultId)) {
      return NextResponse.json({
        success: false,
        error: "Invalid vault ID",
        message: "Vault ID must be a valid number",
      }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    const handlers = await getVaultHandlers();
    await handlers.delete(vaultId);
    
    return NextResponse.json({
      success: true,
      data: { deleted: true },
    }, { status: HTTP_STATUS.OK });
  } catch (error) {
    if (error instanceof Error && error.message.includes("No vault found")) {
      return NextResponse.json({
        success: false,
        error: "Vault not found",
        message: error.message,
      }, { status: HTTP_STATUS.NOT_FOUND });
    }
    
    return NextResponse.json({
      success: false,
      error: "Failed to delete vault",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}