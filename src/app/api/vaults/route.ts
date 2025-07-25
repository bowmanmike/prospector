import { NextRequest, NextResponse } from "next/server";
import { getVaultHandlers } from "./handlers-instance";
import { CreateVaultInput } from "@/lib/database/types";
import { HTTP_STATUS } from "./types";

// GET /api/vaults - List all vaults
export async function GET() {
  try {
    const handlers = await getVaultHandlers();
    const vaults = await handlers.getAll();
    
    return NextResponse.json({
      success: true,
      data: vaults,
    }, { status: HTTP_STATUS.OK });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to fetch vaults",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

// POST /api/vaults - Create new vault
export async function POST(request: NextRequest) {
  try {
    const body: CreateVaultInput = await request.json();
    const handlers = await getVaultHandlers();
    const vault = await handlers.create(body);
    
    return NextResponse.json({
      success: true,
      data: vault,
    }, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("required")) {
        return NextResponse.json({
          success: false,
          error: "Missing required fields",
          message: error.message,
        }, { status: HTTP_STATUS.BAD_REQUEST });
      }
      
      if (error.message.includes("already exists")) {
        return NextResponse.json({
          success: false,
          error: "Vault already exists",
          message: error.message,
        }, { status: HTTP_STATUS.CONFLICT });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: "Failed to create vault",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}