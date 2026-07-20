import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { extname } from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/AppError.js";

export interface UploadableFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

let cachedClient: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!env.isStorageConfigured) {
    throw new AppError(
      503,
      "STORAGE_NOT_CONFIGURED",
      "File storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (!cachedClient) {
    cachedClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }

  return cachedClient;
}

export const storageService = {
  async upload(facultyId: string, file: UploadableFile): Promise<string> {
    const client = getClient();
    const storagePath = `${facultyId}/${randomUUID()}${extname(file.originalname)}`;

    const { error } = await client.storage
      .from(env.supabaseBucket)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new AppError(502, "STORAGE_UPLOAD_FAILED", "Failed to upload file to storage");
    }

    return storagePath;
  },

  async remove(storagePath: string): Promise<void> {
    const client = getClient();
    const { error } = await client.storage.from(env.supabaseBucket).remove([storagePath]);

    if (error) {
      throw new AppError(502, "STORAGE_DELETE_FAILED", "Failed to delete file from storage");
    }
  },

  async createSignedUrl(storagePath: string): Promise<string> {
    const client = getClient();
    const { data, error } = await client.storage
      .from(env.supabaseBucket)
      .createSignedUrl(storagePath, env.signedUrlExpiresSec);

    if (error || !data?.signedUrl) {
      throw new AppError(502, "STORAGE_URL_FAILED", "Failed to create a download URL");
    }

    return data.signedUrl;
  },
};
