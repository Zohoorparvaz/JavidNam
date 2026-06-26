// 'use client';

// import { createClient } from '@supabase/supabase-js';
// import { useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// const MAX_SIZE_MB = 2;
// const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// export default function PhotoUpload({
//   martyrId,
//   currentPhotoUrl,
// }: {
//   martyrId: string;
//   currentPhotoUrl: string | null;
// }) {
//   const router = useRouter();

//   const [status, setStatus] = useState<
//     'idle' | 'loading' | 'success' | 'error'
//   >('idle');
//   const [errorMsg, setErrorMsg] = useState('');
//   const [preview, setPreview] = useState<string | null>(currentPhotoUrl);

//   const inputRef = useRef<HTMLInputElement>(null);

//   const handleUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > MAX_SIZE_BYTES) {
//       setErrorMsg(`حجم فایل نباید بیشتر از ${MAX_SIZE_MB} مگابایت باشد`);
//       setStatus('error');
//       return;
//     }

//     if (!file.type.startsWith('image/')) {
//       setErrorMsg('فقط فایل تصویری مجاز است');
//       setStatus('error');
//       return;
//     }

//     setStatus('loading');
//     setErrorMsg('');

//     try {
//       const ext = file.name.split('.').pop();
//       const path = `${martyrId}.${ext}`;
//       console.log('Uploading file to path:', path);

//       // Upload image
//       const { error: uploadError } = await supabase.storage
//         .from('martyr-photos')
//         .upload(path, file, {
//           upsert: true,
//         });

//       if (uploadError) throw uploadError;

//       // Get public URL
//       console.log('Getting public URL for path:', path);
//       const {
//         data: { publicUrl },
//       } = supabase.storage
//         .from('martyr-photos')
//         .getPublicUrl(path);
//       console.log('Public URL:', publicUrl);
//       // Save URL to martyrs table
//       const { error: updateError } = await supabase
//         .from('martyrs')
//         .update({
//           photo_url: publicUrl,
//         })
//         .eq('id', martyrId);
//       console.log('Update error:', updateError);
//       if (updateError) throw updateError;

//       // Update preview immediately
//       setPreview(publicUrl);
//       setStatus('success');

//       // Allow selecting the same file again later
//       if (inputRef.current) {
//         inputRef.current.value = '';
//       }

//       // Refresh the page so the server component reloads
//       router.refresh();
//     } catch (err: unknown) {
//       const message = err instanceof Error ? err.message : 'خطا در آپلود تصویر';
//       setErrorMsg(message);
//       setStatus('error');
//     }
//   };

//   return (
//     <div className="flex flex-col items-center gap-2" dir="rtl">
//       <div
//         onClick={() => inputRef.current?.click()}
//         className="relative w-40 h-40 rounded-2xl overflow-hidden border border-gray-700 cursor-pointer group"
//       >
//         {preview ? (
//           <img
//             src={preview}
//             alt="تصویر شهید"
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="w-full h-full bg-gray-800 flex items-center justify-center">
//             <span className="text-gray-500 text-sm">
//               بدون تصویر
//             </span>
//           </div>
//         )}

//         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
//           <span className="text-white text-2xl">📷</span>
//           <span className="text-white text-xs">
//             {status === 'loading'
//               ? 'در حال آپلود...'
//               : 'تغییر تصویر'}
//           </span>
//         </div>
//       </div>

//       <input
//         ref={inputRef}
//         type="file"
//         accept="image/*"
//         onChange={handleUpload}
//         className="hidden"
//       />

//       {status === 'success' && (
//         <p className="text-green-400 text-xs">
//           ✓ تصویر با موفقیت آپلود شد
//         </p>
//       )}

//       {status === 'error' && (
//         <p className="text-red-400 text-xs text-center">
//           {errorMsg}
//         </p>
//       )}

//       {!preview && status === 'idle' && (
//         <p className="text-gray-600 text-xs">
//           کلیک کنید برای آپلود
//         </p>
//       )}
//     </div>
//   );
// }

'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function PhotoUpload({
  martyrId,
  currentPhotoUrl,
}: {
  martyrId: string;
  currentPhotoUrl: string | null;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const [errorMsg, setErrorMsg] = useState('');
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validations
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

    try {
      const ext = file.name.split('.').pop();
      const path = `${martyrId}.${ext}`;

      console.log('Uploading to:', path);

      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('martyr-photos')
        .upload(path, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // 2. Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from('martyr-photos')
        .getPublicUrl(path);

      console.log('Public URL:', publicUrl);

      // 3. Update database
      const { data, error: updateError } = await supabase
        .from('martyrs')
        .update({
          photo_url: publicUrl,
        })
        .eq('id', martyrId)
        .select();

      console.log('Update response:', data);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // 4. Update UI immediately
      setPreview(publicUrl);
      setStatus('success');

      // reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = '';
      }

      // 5. Refresh server data
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'خطا در آپلود تصویر';
      setErrorMsg(message);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-2" dir="rtl">
      {/* Image box */}
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-40 h-40 rounded-2xl overflow-hidden border border-gray-700 cursor-pointer group"
      >
        {preview ? (
          <img
            src={preview}
            alt="تصویر شهید"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-500 text-sm">بدون تصویر</span>
          </div>
        )}

        {/* hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
          <span className="text-white text-2xl">📷</span>
          <span className="text-white text-xs">
            {status === 'loading' ? 'در حال آپلود...' : 'تغییر تصویر'}
          </span>
        </div>
      </div>

      {/* file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {/* messages */}
      {status === 'success' && (
        <p className="text-green-400 text-xs">✓ آپلود شد</p>
      )}

      {status === 'error' && (
        <p className="text-red-400 text-xs text-center">
          {errorMsg}
        </p>
      )}

      {!preview && status === 'idle' && (
        <p className="text-gray-600 text-xs">
          کلیک کنید برای آپلود
        </p>
      )}
    </div>
  );
}