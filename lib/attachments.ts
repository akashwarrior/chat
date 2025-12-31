export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_ATTACHMENT_MEDIA_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
] as const;

export const ACCEPTED_ATTACHMENT_INPUT_TYPES =
  ACCEPTED_ATTACHMENT_MEDIA_TYPES.join(",");

export function isSupportedAttachmentType(mediaType: string) {
  return ACCEPTED_ATTACHMENT_MEDIA_TYPES.includes(
    mediaType as (typeof ACCEPTED_ATTACHMENT_MEDIA_TYPES)[number],
  );
}

export function sanitizeUploadFilename(filename: string) {
  const sanitized = filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);

  return sanitized || `upload-${Date.now()}`;
}
