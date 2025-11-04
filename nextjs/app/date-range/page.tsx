'use client';

import { useState } from 'react';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

export default function DateRangePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = new Date();
  today.setHours(23, 59, 59, 999); // 设置为今天的最后一刻

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center py-16 px-8 bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <Calendar
            date={selectedDate}
            onChange={handleSelect}
            maxDate={today}
          />
        </div>
      </main>
    </div>
  );
}

