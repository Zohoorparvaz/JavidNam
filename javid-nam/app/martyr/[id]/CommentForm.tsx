'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Comment = {
  id: string;
  content: string;
  submitted_at: string;
};

export default function CommentForm({
  martyrId,
  initialComments,
}: {
  martyrId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setStatus('loading');

    const { data, error } = await supabase
      .from('comments')
      .insert({ martyr_id: martyrId, content: content.trim() })
      .select()
      .single();

    if (error) {
      setStatus('error');
    } else {
      setComments(prev => [data, ...prev]);
      setContent('');
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div dir="rtl">
      <h2 className="text-2xl font-semibold text-white mb-4">نظرات و پیشنهادات</h2>

      {/* Existing comments */}
      {comments.length > 0 ? (
        <div className="space-y-3 mb-6">
          {comments.map(c => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-300 text-sm">{c.content}</p>
              <p className="text-gray-600 text-xs mt-2">
                {new Date(c.submitted_at).toLocaleDateString('fa-IR')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-sm mb-6">هنوز نظری ثبت نشده است.</p>
      )}

      {/* Submit form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3">
        <p className="text-gray-400 text-sm">
          اطلاعات اشتباه یا ناقص می‌بینید؟ پیشنهاد یا تصحیح خود را بنویسید:
        </p>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="نظر یا پیشنهاد شما..."
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={status === 'loading' || !content.trim()}
          className="w-full bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {status === 'loading' ? 'در حال ارسال...' : 'ارسال نظر'}
        </button>
        {status === 'success' && <p className="text-green-400 text-xs text-center">✓ نظر شما ثبت شد</p>}
        {status === 'error' && <p className="text-red-400 text-xs text-center">خطا در ارسال</p>}
      </div>
    </div>
  );
}