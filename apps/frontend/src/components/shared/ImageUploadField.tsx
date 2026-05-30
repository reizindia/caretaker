'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/lib/api/client';

type ImageUploadFieldProps = {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  helperText?: string;
};

export default function ImageUploadField({
  label,
  value,
  onChange,
  folder = 'uploads',
  helperText,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await apiClient.post('/upload', formData, {
        params: { folder },
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(response.data.url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {value ? (
          <div className="relative aspect-[16/9] bg-slate-100">
            <img src={value} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-600 shadow-sm transition hover:bg-white hover:text-rose-500"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 text-slate-400">
            <ImageIcon size={28} />
            <p className="text-xs font-medium">No image uploaded</p>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 py-2">
          <p className="min-w-0 truncate text-xs text-slate-400">{helperText || 'Upload JPG, PNG, or WebP'}</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={14} />
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}
