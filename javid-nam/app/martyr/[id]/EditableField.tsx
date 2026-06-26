'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditableField({
  martyrId,
  field,
  value,
  label,
  multiline = false,
}: {
  martyrId: string;
  field: string;
  value: string | null;
  label: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setStatus('saving');
    const { error } = await supabase
      .from('martyrs')
      .update({ [field]: current || null })
      .eq('id', martyrId);

    if (error) {
      setStatus('error');
    } else {
      setStatus('saved');
      setEditing(false);
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="group mb-3">
      <p className="text-gray-600 text-xs mb-1">{label}</p>
      {editing ? (
        <div className="flex flex-col gap-2">
          {multiline ? (
            <textarea
              value={current}
              onChange={e => setCurrent(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 border border-red-500 rounded-xl p-3 text-white text-sm focus:outline-none resize-none"
            />
          ) : (
            <input
              type="text"
              value={current}
              onChange={e => setCurrent(e.target.value)}
              className="w-full bg-gray-800 border border-red-500 rounded-xl p-3 text-white text-sm focus:outline-none"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={status === 'saving'}
              className="px-4 py-1.5 bg-red-700 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
            >
              {status === 'saving' ? 'ذخیره...' : 'ذخیره'}
            </button>
            <button
              onClick={() => { setEditing(false); setCurrent(value ?? ''); }}
              className="px-4 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition"
            >
              انصراف
            </button>
          </div>
          {status === 'error' && <p className="text-red-400 text-xs">خطا در ذخیره</p>}
          {status === 'saved' && <p className="text-green-400 text-xs">✓ ذخیره شد</p>}
        </div>
      ) : (
        <div
          onClick={() => setEditing(true)}
          className="cursor-pointer rounded-xl px-3 py-2 hover:bg-gray-800 transition border border-transparent hover:border-gray-700 flex justify-between items-start gap-2"
        >
          <span className="text-white text-sm">
            {current || <span className="text-gray-600 italic">خالی</span>}
          </span>
          <span className="text-gray-600 text-xs shrink-0 mt-0.5">✏️</span>
        </div>
      )}
    </div>
  );
}