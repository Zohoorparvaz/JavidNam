import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function MartyrPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: martyr } = await supabase
    .from('martyrs')
    .select('*')
    .eq('id', params.id)
    .single();
  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('martyr_id', params.id);
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('martyr_id', params.id);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">{martyr.full_name}</h1>
      <p className="text-2xl text-gray-600 mb-8">
        {martyr.age} ساله • {martyr.date_killed} • {martyr.location}
      </p>
      <p className="text-lg mb-12">{martyr.additional_comments}</p>

      <h2 className="text-2xl font-semibold mb-6">عکس‌ها</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {photos?.map(p => (
          <img key={p.id} src={p.photo_url} className="rounded-xl" />
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-6">ویدیوها</h2>
      <div className="grid grid-cols-1 gap-6">
        {videos?.map(v => (
          <iframe
            key={v.id}
            width="100%"
            height="400"
            src={v.video_url}
            className="rounded-2xl"
            allowFullScreen
          ></iframe>
        ))}
      </div>
    </div>
  );
}
