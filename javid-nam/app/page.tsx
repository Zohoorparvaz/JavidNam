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
};

export default function Home() {
  const [martyrs, setMartyrs] = useState<Martyr[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMartyrs = async () => {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('martyrs')
        .select('id, full_name, date_killed, age, location, additional_comments')
        .like('full_name', `%${query}%`)
        .order('full_name')
        .limit(100);

      console.log('data:', data);
      console.log('error:', sbError);

      if (sbError) {
        setError('خطا: ' + sbError.message);
      } else {
        setMartyrs(data ?? []);
      }
      setLoading(false);
    };

    fetchMartyrs();
  }, [query]);



  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <h1 className="text-4xl font-bold text-center mb-2 text-red-800">
        یادمان جاویدنامان و فرزندان ایران
      </h1>
      <p className="text-center text-gray-500 mb-6">
        {martyrs.length} نفر
      </p>

      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="جستجو بر اساس نام یا شهر..."
          className="w-full p-4 rounded-xl border border-gray-300 shadow-sm text-right focus:outline-none focus:ring-2 focus:ring-red-700"
          autoFocus
        />
      </div>

      {error && (
        <p className="text-center text-red-500 mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-center text-gray-400">در حال جستجو...</p>
      ) : martyrs.length === 0 ? (
        <p className="text-center text-gray-400">
          {query.trim() ? 'نتیجه‌ای یافت نشد' : 'برای جستجو تایپ کنید'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {martyrs.map(m => (
            <Link
              key={m.id}
              href={`/martyr/${m.id}`}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition border-r-4 border-red-700 block"
            >
              <h2 className="text-xl font-semibold">{m.full_name}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {m.age ? `${m.age} ساله` : ''}
                {m.age && m.location ? ' • ' : ''}
                {m.location}
              </p>
              {m.additional_comments && (
                <p className="text-sm text-red-600 mt-2 line-clamp-2">
                  {m.additional_comments}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}