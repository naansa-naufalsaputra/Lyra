import { addDays, startOfDay, setHours, setMinutes } from 'date-fns';

export const parseSmartInput = (input: string, categories: string[] = []) => {
  let title = input;
  let priority: "low" | "medium" | "high" = "medium";
  let category = "Personal";
  let isRecurring = false;
  let recurrence: { frequency: "daily" | "weekly" | "biweekly" | "monthly"; daysOfWeek: number[] } | null = null;
  let dueDate = startOfDay(new Date());

  // 1. Ekstrak Prioritas (Keyword Based)
  const prioritySymbolMatch = title.match(/!(high|medium|low|tinggi|sedang|rendah)/i);
  if (prioritySymbolMatch) {
    const val = prioritySymbolMatch[1].toLowerCase();
    if (val === 'high' || val === 'tinggi') priority = 'high';
    else if (val === 'low' || val === 'rendah') priority = 'low';
    else priority = 'medium';
    title = title.replace(prioritySymbolMatch[0], "");
  } else if (title.includes("!!!")) {
    priority = "high";
    title = title.replace("!!!", "");
  } else if (title.includes("!!")) {
    priority = "medium";
    title = title.replace("!!", "");
  } else {
    const words = title.split(' ');
    const lastWord = words[words.length - 1].toLowerCase();
    if (['high', 'tinggi', 'prio'].includes(lastWord)) {
      priority = 'high';
      title = words.slice(0, -1).join(' ');
    } else if (['low', 'rendah', 'santai'].includes(lastWord)) {
      priority = 'low';
      title = words.slice(0, -1).join(' ');
    }
  }

  // 2. Ekstrak Kategori
  const categoryMatch = title.match(/#(\w+)/i);
  if (categoryMatch) {
    const rawCat = categoryMatch[1];
    const existing = categories.find(c => c.toLowerCase() === rawCat.toLowerCase());
    if (existing) {
      category = existing;
    } else {
      category = rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();
    }
    title = title.replace(categoryMatch[0], "");
  }

  // 3. Hari Mapping
  const daysMap: Record<string, number> = {
    minggu: 0, senin: 1, selasa: 2, rabu: 3, kamis: 4, jumat: 5, sabtu: 6,
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
  };

  const dayRegexStr = "(senin|selasa|rabu|kamis|jumat|sabtu|minggu|monday|tuesday|wednesday|thursday|friday|saturday|sunday)";

  // 4. Ekstrak Recurring
  const weeklyMatch = title.match(new RegExp(`(?:setiap|tiap)\\s+(?:hari\\s+)?${dayRegexStr}`, "i"));
  
  if (weeklyMatch) {
    isRecurring = true;
    const dayName = weeklyMatch[1].toLowerCase();
    const dayIndex = daysMap[dayName];
    recurrence = { frequency: 'weekly', daysOfWeek: [dayIndex] };

    const currentDay = dueDate.getDay();
    const distance = (dayIndex + 7 - currentDay) % 7;
    dueDate = addDays(dueDate, distance);
    title = title.replace(weeklyMatch[0], "");
  } else {
    const biweeklyRegex = /(?:setiap|tiap)\s+2\s+minggu|2\s+mingguan/i;
    const monthlyRegex = /(?:setiap|tiap)\s+bulan|bulanan/i;
    const dailyRegex = /(?:setiap|tiap)\s+hari/i;

    if (title.match(biweeklyRegex)) {
      isRecurring = true;
      recurrence = { frequency: 'biweekly', daysOfWeek: [dueDate.getDay()] };
      title = title.replace(biweeklyRegex, "");
    } else if (title.match(monthlyRegex)) {
      isRecurring = true;
      recurrence = { frequency: 'monthly', daysOfWeek: [dueDate.getDay()] };
      title = title.replace(monthlyRegex, "");
    } else if (title.match(dailyRegex)) {
      isRecurring = true;
      recurrence = { frequency: 'daily', daysOfWeek: [] };
      title = title.replace(dailyRegex, "");
    }
  }

  // 5. Standalone Day Names (e.g., "Selasa") -> Set due date to next occurrence
  if (!isRecurring) {
    const standaloneDayMatch = title.match(new RegExp(`\\b${dayRegexStr}\\b`, "i"));
    if (standaloneDayMatch) {
      const dayName = standaloneDayMatch[1].toLowerCase();
      const dayIndex = daysMap[dayName];
      const currentDay = dueDate.getDay();
      let distance = (dayIndex + 7 - currentDay) % 7;
      if (distance === 0) distance = 7; // If today is Tuesday, "Tuesday" means next Tuesday
      dueDate = addDays(dueDate, distance);
      title = title.replace(standaloneDayMatch[0], "");
    }
  }

  // 6. Ekstrak Waktu
  const timeMatch = title.match(/(?:jam|pukul)\s+(\d{1,2})[:.](\d{2})/i);
  let hasTime = false;
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      dueDate = setHours(setMinutes(dueDate, minutes), hours);
      hasTime = true;
      title = title.replace(timeMatch[0], "");
    }
  }

  // 7. Ekstrak Date Relatif
  const tomorrowMatch = title.match(/\bbesok\b/i);
  const lusaMatch = title.match(/\blusa\b/i);

  if (tomorrowMatch) {
    dueDate = addDays(startOfDay(new Date()), 1); // Reset to base tomorrow
    title = title.replace(tomorrowMatch[0], "");
  } else if (lusaMatch) {
    dueDate = addDays(startOfDay(new Date()), 2);
    title = title.replace(lusaMatch[0], "");
  }

  title = title.replace(/\s+/g, ' ').trim();

  return {
    text: title || "Tugas Tanpa Judul",
    priority,
    category,
    dueDate: hasTime ? dueDate.toISOString() : dueDate.toISOString().split('T')[0],
    isRecurring,
    recurrence
  };
};


