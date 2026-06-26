import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const { data: martyrs } = await supabase
    .from('martyrs')
    .select('*')
    .order('id');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-red-800">
        یادمان جاویدنامان و فرزندان ایران
      </h1>

      <input
        type="text"
        placeholder="جستجو بر اساس نام یا شهر..."
        className="w-full max-w-md mx-auto block p-4 rounded-xl border border-gray-300 bg-white text-black placeholder:text-gray-500 mb-8 focus:outline-none focus:ring-2 focus:ring-red-700"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {martyrs?.map(m => (
          <a
            key={m.id}
            href={`/martyr/${m.id}`}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition"
          >
            <h2 className="text-xl font-semibold">{m.full_name}</h2>

            <p className="text-gray-500">
              {m.age ? `${m.age} ساله` : ''} • {m.location}
            </p>

            <p className="text-sm text-red-600 mt-2 line-clamp-2">
              {m.additional_comments}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
