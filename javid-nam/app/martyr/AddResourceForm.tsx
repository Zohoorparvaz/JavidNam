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

  return (
    <div className="bg-white rounded-2xl shadow p-6 border" dir="rtl">
      <h3 className="text-xl font-semibold mb-4">افزودن منبع جدید</h3>

      <div className="space-y-3">
        <input
          type="url"
          placeholder="آدرس لینک (الزامی)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="w-full border rounded-xl p-3"
          dir="ltr"
        />
        <input
          type="text"
          placeholder="عنوان (اختیاری)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full border rounded-xl p-3 text-right"
        />
        <textarea
          placeholder="توضیحات (اختیاری)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="w-full border rounded-xl p-3 text-right resize-none"
        />
        <select
          value={type}
          onChange={e => setType(e.target.value as ResourceType)}
          className="w-full border rounded-xl p-3 text-right bg-white"
        >
          {(Object.keys(typeLabel) as ResourceType[]).map(t => (
            <option key={t} value={t}>
              {typeLabel[t]}
            </option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          disabled={status === 'loading' || !url.trim()}
          className="w-full bg-red-700 text-white py-3 rounded-xl font-semibold hover:bg-red-800 disabled:opacity-50 transition"
        >
          {status === 'loading' ? 'در حال ارسال...' : 'افزودن منبع'}
        </button>

        {status === 'success' && (
          <p className="text-green-600 text-center">✓ منبع با موفقیت اضافه شد</p>
        )}
        {status === 'error' && (
          <p className="text-red-600 text-center">خطا در ارسال. دوباره تلاش کنید.</p>
        )}
      </div>
    </div>
  );
}