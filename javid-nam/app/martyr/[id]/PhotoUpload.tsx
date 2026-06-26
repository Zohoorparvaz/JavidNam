'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useRef } from 'react';
import Image from 'next/image';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function PhotoUpload({ martyrId, currentPhotoUrl }: {
  martyrId: string;
  currentPhotoUrl: string | null;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      setErrorMsg(`حجم فایل نباید بیشتر از ${MAX_SIZE_MB} مگابایت باشد`);
      setStatus('error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMsg('فقط فایل تصویری مجاز است');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const ext = file.name.split('.').pop();
    const path = `${martyrId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('martyr-photos')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setErrorMsg(uploadError.message);
      setStatus('error');
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('martyr-photos')
      .getPublicUrl(path);

    const { error: updateError } = await supabase
      .from('martyrs')
      .update({ photo_url: publicUrl })
      .eq('id', martyrId);

    if (updateError) {
      setErrorMsg(updateError.message);
      setStatus('error');
      return;
    }

    setPreview(publicUrl);
    setStatus('success');
  };

  return (
    <div className="flex flex-col items-center gap-2" dir="rtl">
      {/* Clickable photo area */}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-40 h-40 rounded-2xl overflow-hidden border border-gray-700 cursor-pointer group"
      >
        {preview ? (
          <Image
            src={preview}
            alt="تصویر شهید"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-500 text-sm">بدون تصویر</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
          <span className="text-white text-2xl">📷</span>
          <span className="text-white text-xs">
            {status === 'loading' ? 'در حال آپلود...' : 'تغییر تصویر'}
          </span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {status === 'success' && (
        <p className="text-green-400 text-xs">✓ آپلود شد</p>
      )}
      {status === 'error' && (
        <p className="text-red-400 text-xs text-center">{errorMsg}</p>
      )}
      {!preview && status === 'idle' && (
        <p className="text-gray-600 text-xs">کلیک کنید برای آپلود</p>
      )}
    </div>
  );
}