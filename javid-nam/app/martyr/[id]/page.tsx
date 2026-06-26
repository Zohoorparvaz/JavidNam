import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import AddResourceForm from './AddResourceForm';
import CommentForm from './CommentForm';
import AdminPanel from './AdminPanel';

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

type Comment = {
  id: string;
  content: string;
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

  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, submitted_at')
    .eq('martyr_id', id)
    .order('submitted_at', { ascending: false })
    .returns<Comment[]>();

  if (!martyr) {
    return (
      <div className="min-h-screen bg-black p-6 text-center text-gray-500" dir="rtl">
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
    <div className="min-h-screen bg-black" dir="rtl">
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/" className="text-red-500 hover:underline text-sm mb-6 inline-block">
          ← بازگشت به فهرست
        </Link>

        {/* Public header */}
        <div className="flex gap-6 items-start mb-10">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border border-gray-700 shrink-0">
            {martyr.photo_url ? (
              <img
                src={martyr.photo_url}
                alt={martyr.full_name}
                width={160}
                height={160}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-600 text-sm">بدون تصویر</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{martyr.full_name}</h1>
            {meta && <p className="text-gray-400 mb-4">{meta}</p>}
            {martyr.additional_comments && (
              <p className="text-gray-300 text-lg">{martyr.additional_comments}</p>
            )}
          </div>
        </div>

        {/* Resources */}
        <h2 className="text-2xl font-semibold text-white mb-4">منابع و مستندات</h2>
        {resources && resources.length > 0 ? (
          <div className="space-y-3 mb-10">
            {resources.map(r => (
              <a
                key={r.id}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 bg-gray-900 p-4 rounded-xl hover:bg-gray-800 transition border border-gray-800 hover:border-red-700"
              >
                <span className="text-sm bg-red-900 text-red-300 px-2 py-1 rounded-lg shrink-0">
                  {typeLabel[r.type] ?? typeLabel.other}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{r.title ?? r.url}</p>
                  {r.description && (
                    <p className="text-sm text-gray-400 mt-0.5">{r.description}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1 truncate">{r.url}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mb-10">هنوز منبعی اضافه نشده است.</p>
        )}

        {/* Add resource — public */}
        <div className="mb-12">
          <AddResourceForm martyrId={id} />
        </div>

        {/* Comments — public */}
        <div className="mb-12">
          <CommentForm martyrId={id} initialComments={comments ?? []} />
        </div>

        {/* Admin panel — password protected */}
        <AdminPanel
          martyrId={id}
          photoUrl={martyr.photo_url}
          fullName={martyr.full_name}
          age={martyr.age ? String(martyr.age) : null}
          location={martyr.location}
          dateKilled={martyr.date_killed}
          additionalComments={martyr.additional_comments}
        />
      </div>
    </div >
  );
}