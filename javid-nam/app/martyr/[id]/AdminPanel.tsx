'use client';

import { useState } from 'react';
import EditableField from './EditableField';
import PhotoUpload from './PhotoUpload';

type Props = {
  martyrId: string;
  photoUrl: string | null;
  fullName: string;
  age: string | null;
  location: string | null;
  dateKilled: string | null;
  additionalComments: string | null;
};

export default function AdminPanel({
  martyrId,
  photoUrl,
  fullName,
  age,
  location,
  dateKilled,
  additionalComments,
}: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [wrong, setWrong] = useState(false);

  const handleUnlock = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setUnlocked(true);
      setWrong(false);
    } else {
      setWrong(true);
    }
  };

  if (!unlocked) {
    return (
      <div className="mt-10 border-t border-gray-800 pt-6" dir="rtl">
        <p className="text-gray-600 text-sm mb-3">ورود مدیر برای ویرایش اطلاعات:</p>
        <div className="flex gap-2 max-w-sm">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            placeholder="رمز عبور"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={handleUnlock}
            className="px-4 py-2 bg-gray-800 text-white text-sm rounded-xl border border-gray-700 hover:border-red-500 transition"
          >
            ورود
          </button>
        </div>
        {wrong && <p className="text-red-400 text-xs mt-2">رمز عبور اشتباه است</p>}
      </div>
    );
  }

  return (
    <div className="mt-10 border-t border-gray-800 pt-6" dir="rtl">
      <p className="text-green-400 text-sm mb-6">✓ حالت ویرایش فعال است</p>

      <div className="flex gap-6 items-start mb-6">
        <PhotoUpload martyrId={martyrId} currentPhotoUrl={photoUrl} />
        <div className="flex-1 space-y-1">
          <EditableField martyrId={martyrId} field="full_name" value={fullName} label="نام کامل" />
          <EditableField martyrId={martyrId} field="age" value={age} label="سن" />
          <EditableField martyrId={martyrId} field="location" value={location} label="شهر" />
          <EditableField martyrId={martyrId} field="date_killed" value={dateKilled} label="تاریخ" />
          <EditableField martyrId={martyrId} field="additional_comments" value={additionalComments} label="توضیحات" multiline />
        </div>
      </div>
    </div>
  );
}