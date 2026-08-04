import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validatePhoto(file: File) {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("FORMATO_IMAGEN");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("IMAGEN_GRANDE");
  }
}

async function saveLocally(file: File) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

async function saveToBlob(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `products/${randomUUID()}.${ext}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type || undefined,
  });
  return blob.url;
}

/**
 * Guarda la foto del producto.
 * - Con BLOB_READ_WRITE_TOKEN (Vercel): Vercel Blob
 * - Sin token (local): public/uploads
 */
export async function saveProductPhoto(file: File | null) {
  if (!file || file.size === 0) return null;

  validatePhoto(file);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      return await saveToBlob(file);
    } catch (error) {
      console.error("Blob upload failed", error);
      throw new Error("FALLO_SUBIDA");
    }
  }

  // En Vercel sin Blob el disco no persiste
  if (process.env.VERCEL) {
    throw new Error("BLOB_NO_CONFIGURADO");
  }

  try {
    return await saveLocally(file);
  } catch (error) {
    console.error("Local upload failed", error);
    throw new Error("FALLO_SUBIDA");
  }
}
