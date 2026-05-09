/**
 * Direct browser → Cloudinary uploads using an unsigned preset.
 * The preset is configured in the Cloudinary dashboard (folder
 * `aspira/feedback`, max 5 MB, jpg/png/webp).
 */

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  bytes: number;
  format: string;
}

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export class CloudinaryNotConfigured extends Error {
  constructor() {
    super("Cloudinary upload is not configured for this deployment.");
  }
}

export class FileTooLarge extends Error {
  constructor() {
    super("Each file must be 5 MB or smaller.");
  }
}

export class FileTypeNotAllowed extends Error {
  constructor() {
    super("Only JPEG, PNG, and WebP images are accepted.");
  }
}

export async function uploadToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !preset) {
    throw new CloudinaryNotConfigured();
  }
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new FileTypeNotAllowed();
  }
  if (file.size > MAX_BYTES) {
    throw new FileTooLarge();
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);
  form.append("folder", "aspira/feedback");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${response.status} ${text}`);
  }
  return (await response.json()) as CloudinaryUploadResult;
}
