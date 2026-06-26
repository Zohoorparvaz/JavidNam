'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Martyr = {
  id: number;
  full_name: string;
  age: number | null;
  location: string | null;
  date_killed: string | null;
  additional_comments: string | null;
  photo_url: string | null;
};

const PAGE_SIZE = 50;

export default function Home() {
  const [martyrs, setMartyrs] = useState<Martyr[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const isSearching = query.trim().length > 0;

  useEffect(() => {
    // avoid synchronous setState in effect to prevent cascading renders
    const t = setTimeout(() => setPage(0), 0);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const fetchMartyrs = async () => {
      setLoading(true);
      setError(null);

      try {
        if (isSearching) {
          const { data, error: sbError } = await supabase
            .from('martyrs')
            .select('id, full_name, age, location, date_killed, additional_comments, photo_url')
            .ilike('full_name', `%${query}%`)
            .order('full_name')
            .limit(100);

          if (sbError) throw sbError;
          setMartyrs(data ?? []);
          setTotal(data?.length ?? 0);
        } else {
          const from = page * PAGE_SIZE;
          const to = from + PAGE_SIZE - 1;

          const { data, error: sbError, count } = await supabase
            .from('martyrs')
            .select('id, full_name, age, location, date_killed, additional_comments, photo_url', { count: 'exact' })
            .order('full_name')
            .range(from, to);

          if (sbError) throw sbError;
          setMartyrs(data ?? []);
          setTotal(count ?? 0);
        }
      } catch (e) {
        console.error(e);
        setError('خطا در بارگذاری اطلاعات');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchMartyrs, 300);
    return () => clearTimeout(timer);
  }, [query, page, isSearching]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-black p-6" dir="rtl">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-red-500">
          یادمان جاویدنامان و فرزندان ایران
        </h1>
        <p className="text-center text-gray-500 mb-6">
          {isSearching
            ? `${martyrs.length} نتیجه برای "${query}"`
            : `${total} نفر — صفحه ${page + 1} از ${totalPages}`}
        </p>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="جستجو بر اساس نام..."
          className="w-full max-w-md mx-auto block p-4 rounded-xl border border-gray-700 bg-gray-900 text-white placeholder-gray-500 text-right focus:outline-none focus:ring-2 focus:ring-red-500"
          autoFocus
        />
      </div>

      {error && <p className="text-center text-red-400 mb-4">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-600">در حال بارگذاری...</p>
      ) : martyrs.length === 0 ? (
        <p className="text-center text-gray-600">
          {isSearching ? 'نتیجه‌ای یافت نشد' : 'اطلاعاتی موجود نیست'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {martyrs.map(m => (
              <Link
                key={m.id}
                href={`/martyr/${m.id}`}
                className="bg-gray-900 rounded-2xl hover:bg-gray-800 transition border border-gray-800 hover:border-red-700 block overflow-hidden"
              >
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.full_name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-600 text-sm">بدون تصویر</span>
                  </div>
                )}
                <div className="p-5 border-r-4 border-red-700">
                  <h2 className="text-lg font-semibold text-white">{m.full_name}</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {m.age ? `${m.age} ساله` : ''}
                    {m.age && m.location ? ' • ' : ''}
                    {m.location}
                  </p>
                  {m.additional_comments && (
                    <p className="text-sm text-red-400 mt-2 line-clamp-2">
                      {m.additional_comments}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {!isSearching && totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white border border-gray-700 hover:border-red-500 disabled:opacity-30 transition"
              >
                ← قبلی
              </button>
              <span className="text-gray-500 text-sm">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white border border-gray-700 hover:border-red-500 disabled:opacity-30 transition"
              >
                بعدی →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}