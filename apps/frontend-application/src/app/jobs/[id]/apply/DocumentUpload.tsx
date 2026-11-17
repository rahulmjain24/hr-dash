'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { uploadDocument, type DocumentType, type UploadedDocument } from './actions';
import { FileIcon, XIcon } from '@/components/icons';
import { Required, fieldClass, labelClass } from '@/components/ui';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

function clientError(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return `${file.name}: only PDF, DOC and DOCX files are accepted.`;
  }
  if (file.size === 0) return `${file.name} is empty.`;
  if (file.size > MAX_FILE_SIZE_BYTES) return `${file.name} is larger than 5 MB.`;
  return null;
}

interface Props {
  id: string;
  label: string;
  /** Name of the hidden inputs that carry the uploaded ids into the form submission. */
  name: string;
  documentType: DocumentType;
  maxFiles: number;
  required?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onCountChange?: (count: number) => void;
}

/**
 * Uploads files as soon as they are picked and keeps their ids in hidden inputs, so the files
 * survive a failed submit and the application itself is submitted as plain fields.
 */
export default function DocumentUpload({
  id,
  label,
  name,
  documentType,
  maxFiles,
  required = false,
  onBusyChange,
  onCountChange,
}: Props) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = pending.length > 0;
  const count = documents.length;
  useEffect(() => onBusyChange?.(busy), [busy, onBusyChange]);
  useEffect(() => onCountChange?.(count), [count, onCountChange]);

  const remaining = maxFiles - count - pending.length;
  const multiple = maxFiles > 1;

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (picked.length === 0) return;

    const errors: string[] = [];
    if (picked.length > remaining) {
      errors.push(`You can attach at most ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'} here.`);
    }
    const files = picked.slice(0, remaining).filter((file) => {
      const problem = clientError(file);
      if (problem) errors.push(problem);
      return !problem;
    });
    setError(errors[0] ?? null);
    if (files.length === 0) return;

    setPending((names) => [...names, ...files.map((file) => file.name)]);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadDocument(documentType, formData).catch(() => null);
      if (result?.ok) {
        setDocuments((docs) => [...docs, result.document]);
      } else {
        setError(
          `${file.name}: ${result?.message ?? "we couldn't upload that file. Please try again."}`,
        );
      }
      setPending((names) => {
        const index = names.indexOf(file.name);
        return index === -1 ? names : names.filter((_, i) => i !== index);
      });
    }
  }

  const rowClass =
    'flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm';

  return (
    <div className={fieldClass}>
      <label htmlFor={id} className={labelClass}>
        {label} {required && <Required />}
      </label>

      {(count > 0 || busy) && (
        <ul className="flex flex-col gap-2">
          {documents.map((doc) => (
            <li key={doc.uploadId} className={rowClass}>
              <input type="hidden" name={name} value={doc.uploadId} />
              <FileIcon size={16} className="flex-none text-gray-500" />
              <span className="min-w-0 flex-1 truncate text-gray-900">{doc.originalFilename}</span>
              <span className="flex-none text-xs text-gray-500">{formatSize(doc.sizeBytes)}</span>
              <button
                type="button"
                aria-label={`Remove ${doc.originalFilename}`}
                onClick={() => {
                  setDocuments((docs) => docs.filter((d) => d.uploadId !== doc.uploadId));
                  setError(null);
                  inputRef.current?.focus();
                }}
                className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-900"
              >
                <XIcon size={14} />
              </button>
            </li>
          ))}
          {pending.map((filename, index) => (
            <li key={`${filename}-${index}`} className={rowClass} role="status">
              <FileIcon size={16} className="flex-none text-gray-400" />
              <span className="min-w-0 flex-1 truncate text-gray-500">{filename}</span>
              <span className="flex-none text-xs text-gray-500">Uploading...</span>
            </li>
          ))}
        </ul>
      )}

      {/* Kept mounted (hidden when full) so focus and the label target stay valid. */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        multiple={multiple}
        disabled={remaining <= 0}
        hidden={remaining <= 0}
        onChange={handleChange}
        aria-describedby={`${id}-hint`}
        className="w-full cursor-pointer rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-600 file:mr-3 file:h-11 file:cursor-pointer file:border-0 file:border-r file:border-gray-200 file:bg-gray-50 file:px-4 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-600"
      />

      <p id={`${id}-hint`} className="text-xs text-gray-500">
        PDF, DOC or DOCX, up to 5 MB{multiple ? ` each. Up to ${maxFiles} files.` : '.'}
      </p>
      {error && (
        <p role="alert" className="text-[13px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
