"use client";

import { useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/Spinner";
import {
  CloudinaryNotConfigured,
  FileTooLarge,
  FileTypeNotAllowed,
  uploadToCloudinary,
} from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

const MAX_FILES = 3;

export interface UploadedAttachment {
  url: string;
  public_id: string;
}

export function AttachmentUpload({
  value,
  onChange,
}: {
  value: UploadedAttachment[];
  onChange: (next: UploadedAttachment[]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (value.length + files.length > MAX_FILES) {
      toast.error(`At most ${MAX_FILES} files per submission.`);
      return;
    }
    setBusy(true);
    const next = [...value];
    for (const file of Array.from(files)) {
      try {
        const result = await uploadToCloudinary(file);
        next.push({ url: result.secure_url, public_id: result.public_id });
      } catch (error) {
        if (error instanceof CloudinaryNotConfigured) {
          toast.error(
            "File upload isn't configured yet — submit without attachments for now.",
          );
        } else if (
          error instanceof FileTooLarge ||
          error instanceof FileTypeNotAllowed
        ) {
          toast.error(error.message);
        } else {
          toast.error("Upload failed. Please try again.");
        }
        break;
      }
    }
    onChange(next);
    setBusy(false);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    void handleFiles(e.target.files);
    e.target.value = ""; // allow re-selecting the same file
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    void handleFiles(e.dataTransfer.files);
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 px-4 cursor-pointer transition-colors duration-fast",
          dragOver
            ? "border-primary-500 bg-primary-50"
            : "border-border bg-bg-subtle hover:border-border-strong",
        )}
      >
        {busy ? (
          <Spinner />
        ) : (
          <>
            <ImageIcon size={24} className="text-text-tertiary" />
            <p className="text-sm text-text-primary">
              Drop photos here, or click to browse
            </p>
            <p className="text-xs text-text-tertiary">
              Max {MAX_FILES} files · JPG, PNG, WEBP · 5 MB each
            </p>
          </>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={onInputChange}
          disabled={busy || value.length >= MAX_FILES}
        />
      </label>

      {value.length > 0 ? (
        <ul className="grid grid-cols-3 gap-3">
          {value.map((att, i) => (
            <li
              key={att.public_id}
              className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border-subtle bg-bg-subtle"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={att.url}
                alt={`Attachment ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove attachment"
                className="absolute top-1.5 right-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-bg-elevated text-text-primary shadow-sm hover:bg-bg-base"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
