'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  type Martyr = {
    id: number;
    full_name: string;
    age?: number | null;
    location?: string | null;
    additional_comments?: string | null;
  };

  const [martyrs, setMartyrs] = useState<Martyr[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMartyrs = async () => {
      setLoading(true);
      let q = supabase.from('martyrs').select('*').order('id');
      if (query.trim()) {
        q = q.or(`full_name.ilike.%${query}%,location.ilike.%${query}%`);
      }
      const { data } = await q.limit(100);
      setMartyrs(data ?? []);
      setLoading(false);
    };
    const timer = setTimeout(fetchMartyrs, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <h1 className="text-4xl font-bold text-center mb-2 text-red-800">
        یادمان جاویدنامان و فرزندان ایران
      </h1>
      <p className="text-center text-gray-500 mb-8">{martyrs.length} نفر</p>

      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="جستجو بر اساس نام یا شهر..."
        className="w-full max-w-md mx-auto block p-4 rounded-xl border mb-8 text-right"
      />

      {loading ? (
        <p className="text-center text-gray-400">در حال بارگذاری...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {martyrs.map(m => (
            <Link
              key={m.id}
              href={`/martyr/${m.id}`}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition border-r-4 border-red-700"
            >
              <h2 className="text-xl font-semibold">{m.full_name}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {m.age ? `${m.age} ساله` : ''}{m.age && m.location ? ' • ' : ''}{m.location}
              </p>
              <p className="text-sm text-red-600 mt-2 line-clamp-2">
                {m.additional_comments}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}