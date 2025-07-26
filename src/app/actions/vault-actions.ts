"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CreateVaultInput } from "@/lib/database/types";
import { getVaultHandlers } from "@/lib/handlers/vault-handlers";

// Server Action to create a vault
export async function createVault(input: CreateVaultInput) {
  try {
    const handlers = await getVaultHandlers();
    const vault = await handlers.create(input);

    revalidatePath("/");
    return { success: true, data: vault };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        throw new Error(`A vault with path '${input.path}' already exists`);
      }
    }
    throw new Error("Failed to create vault");
  }
}

// Server Action to get all vaults
export async function getVaults() {
  try {
    const handlers = await getVaultHandlers();
    const vaults = await handlers.getAll();
    return { success: true, data: vaults };
  } catch (_error) {
    throw new Error("Failed to fetch vaults");
  }
}

// Server Action to get vault with statistics
export async function getVaultWithStats(id: number) {
  try {
    const handlers = await getVaultHandlers();
    const vault = await handlers.getWithStats(id);
    return { success: true, data: vault };
  } catch (error) {
    if (error instanceof Error && error.message.includes("No vault found")) {
      throw new Error(`No vault found with ID ${id}`);
    }
    throw new Error("Failed to fetch vault");
  }
}

// Server Action to delete a vault
export async function deleteVault(id: number) {
  try {
    const handlers = await getVaultHandlers();
    await handlers.delete(id);

    revalidatePath("/");
    return { success: true, data: { deleted: true } };
  } catch (error) {
    if (error instanceof Error && error.message.includes("No vault found")) {
      throw new Error(`No vault found with ID ${id}`);
    }
    throw new Error("Failed to delete vault");
  }
}

// Server Action that deletes and redirects (useful for delete buttons)
export async function deleteVaultAndRedirect(id: number) {
  await deleteVault(id);
  redirect("/"); // Redirect after deletion
}
