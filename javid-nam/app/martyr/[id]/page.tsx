import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import AddResourceForm from '../AddResourceForm';

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

type ResourceType = 'photo' | 'video' | 'article' | 'social' | 'document' | 'other';

type Resource = {
  id: string;
  martyr_id: string;
  url: string;
  title: string | null;
  description: string | null;
  type: ResourceType;
  submitted_at: string;
};

const typeLabel: Record<ResourceType, string> = {
  photo: '📷 عکس',
  video: '🎥 ویدیو',
  article: '📰 مقاله',
  social: '🔗 شبکه اجتماعی',
  document: '📄 سند',
  other: '🔗 سایر',
};

export default async function MartyrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: martyr } = await supabase
    .from('martyrs')
    .select('*')
    .eq('id', id)
    .single<Martyr>();

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('martyr_id', id)
    .order('submitted_at', { ascending: false })
    .returns<Resource[]>();

  if (!martyr) {
    return (
      <div className="p-6 text-center text-gray-500" dir="rtl">
        یافت نشد
      </div>
    );
  }

  const meta = [
    martyr.age ? `${martyr.age} ساله` : null,
    martyr.date_killed,
    martyr.location,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <Link href="/" className="text-red-700 hover:underline text-sm mb-6 inline-block">
        ← بازگشت به فهرست
      </Link>

      <h1 className="text-4xl font-bold mb-2">{martyr.full_name}</h1>
      {meta && <p className="text-gray-500 mb-4">{meta}</p>}
      {martyr.additional_comments && (
        <p className="text-lg text-gray-700 mb-10">{martyr.additional_comments}</p>
      )}

      <h2 className="text-2xl font-semibold mb-4">منابع و مستندات</h2>

      {resources && resources.length > 0 ? (
        <div className="space-y-3 mb-10">
          {resources.map(r => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border"
            >
              <span className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded-lg shrink-0">
                {typeLabel[r.type] ?? typeLabel.other}
              </span>
              <div className="min-w-0">
                <p className="font-medium truncate">{r.title ?? r.url}</p>
                {r.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{r.description}</p>
                )}
                <p className="text-xs text-gray-300 mt-1 truncate">{r.url}</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 mb-10">هنوز منبعی اضافه نشده است.</p>
      )
      }

      <AddResourceForm martyrId={id} />
    </div >
  );
}