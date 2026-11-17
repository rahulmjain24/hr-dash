import { extname } from 'path';

export function getFileExtension(filename: string): string {
  return extname(filename).toLowerCase();
}

/** Multer hands over multipart filenames as latin1; this restores the UTF-8 name. */
export function decodeUploadFilename(
  filename: string,
  maxLength = 255,
): string {
  return Buffer.from(filename, 'latin1').toString('utf8').slice(0, maxLength);
}

/** True when the buffer starts with the given magic bytes. */
export function hasMagicBytes(buffer: Buffer, magic: Buffer): boolean {
  return buffer.subarray(0, magic.length).equals(magic);
}

/** Content-Disposition value that downloads the file under a (possibly non-ASCII) name. */
export function attachmentDisposition(filename: string): string {
  return `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
