'use client';

import { useState } from 'react';
import { DateRangePicker, RangeKeyDict, RangeFocus } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

export default function DateRange7DaysPage() {
  // 根据选中的日期，计算该日期所在周的周一和周日（正好7天）
  const getWeekRange = (selectedDate: Date) => {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    // 计算该日期所在周的周一
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekMonday = new Date(date);
    weekMonday.setDate(date.getDate() + mondayOffset);
    weekMonday.setHours(0, 0, 0, 0);
    
    // 计算该周的周日（周一 + 6天 = 周日，正好7天）
    const weekSunday = new Date(weekMonday);
    weekSunday.setDate(weekMonday.getDate() + 6);
    weekSunday.setHours(23, 59, 59, 999);
    
    return {
      startDate: weekMonday,
      endDate: weekSunday,
    };
  };

  const today = new Date();
  const initialWeekRange = getWeekRange(today);
  
  const [dateRange, setDateRange] = useState({
    startDate: initialWeekRange.startDate,
    endDate: initialWeekRange.endDate,
    key: 'selection',
  });

  const [rangeFocus, setRangeFocus] = useState<RangeFocus>([0, 0]);

  const handleSelect = (ranges: RangeKeyDict) => {
    const selection = ranges.selection;
    if (!selection?.startDate) return;
    
    // 根据点击的日期，计算并高亮那一周（7天）
    const weekRange = getWeekRange(selection.startDate);
    
    // 立即设置完整的周范围，避免模式切换
    setDateRange({
      startDate: weekRange.startDate,
      endDate: weekRange.endDate,
      key: 'selection',
    });
    
    // 重置焦点到开始日期，避免切换到结束日期选择模式
    setRangeFocus([0, 0]);
  };

  const handleRangeFocusChange = (newFocus: RangeFocus) => {
    // 如果用户试图切换到结束日期选择模式，立即重置回开始日期
    // 这样用户只需要点击一次就可以选择整周
    if (newFocus[1] === 1) {
      setRangeFocus([0, 0]);
    } else {
      setRangeFocus(newFocus);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8 bg-white dark:bg-black">
        <div className="w-full max-w-2xl">
          <DateRangePicker
            ranges={[dateRange]}
            onChange={handleSelect}
            onRangeFocusChange={handleRangeFocusChange}
            focusedRange={rangeFocus}
            showDateDisplay={false}
            showMonthAndYearPickers={true}
            months={2}
            direction="horizontal"
            staticRanges={[]}
            inputRanges={[]}
            moveRangeOnFirstSelection={false}
            retainEndDateOnFirstSelection={false}
            editableDateInputs={false}
          />
        </div>
      </main>
    </div>
  );
}

