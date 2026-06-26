'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ResourceType = 'photo' | 'video' | 'article' | 'social' | 'document' | 'other';

const typeLabel: Record<ResourceType, string> = {
  photo: '📷 عکس',
  video: '🎥 ویدیو',
  article: '📰 مقاله',
  social: '🔗 شبکه اجتماعی',
  document: '📄 سند',
  other: '🔗 سایر',
};

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function AddResourceForm({ martyrId }: { martyrId: string }) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResourceType>('other');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setStatus('loading');

    const { error } = await supabase.from('resources').insert({
      martyr_id: martyrId,
      url: url.trim(),
      title: title.trim() || null,
      description: description.trim() || null,
      type,
    });

    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      setUrl('');
      setTitle('');
      setDescription('');
      setType('other');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const inputClass =
    'w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition';

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6" dir="rtl">
      <h3 className="text-xl font-semibold text-white mb-1">افزودن منبع جدید</h3>
      <p className="text-gray-500 text-sm mb-5">
        لینک عکس، ویدیو، مقاله یا هر مدرکی را اضافه کنید
      </p>

      <div className="space-y-3">
        <input
          type="url"
          placeholder="آدرس لینک (الزامی)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className={inputClass}
          dir="ltr"
        />
        <input
          type="text"
          placeholder="عنوان (اختیاری)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className={inputClass}
        />
        <textarea
          placeholder="توضیحات (اختیاری)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
        <select
          value={type}
          onChange={e => setType(e.target.value as ResourceType)}
          className={`${inputClass} cursor-pointer`}
        >
          {(Object.keys(typeLabel) as ResourceType[]).map(t => (
            <option key={t} value={t} className="bg-gray-900 text-white">
              {typeLabel[t]}
            </option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          disabled={status === 'loading' || !url.trim()}
          className="w-full bg-red-700 text-white py-3 rounded-xl font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {status === 'loading' ? 'در حال ارسال...' : 'افزودن منبع ←'}
        </button>

        {status === 'success' && (
          <p className="text-green-400 text-center text-sm">
            ✓ منبع با موفقیت اضافه شد
          </p>
        )}
        {status === 'error' && (
          <p className="text-red-400 text-center text-sm">
            خطا در ارسال. دوباره تلاش کنید.
          </p>
        )}
      </div>
    </div>
  );
}