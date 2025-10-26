/**
 * Date helper utilities for the AI assistant
 */

export function getCurrentDateInfo() {
  const now = new Date();
  
  return {
    currentDate: now.toISOString().split('T')[0], // YYYY-MM-DD format
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1, // 1-12
    currentDay: now.getDate(),
    currentWeekday: now.toLocaleDateString('en-US', { weekday: 'long' }), // Monday, Tuesday, etc.
    currentMonthName: now.toLocaleDateString('en-US', { month: 'long' }), // January, February, etc.
    yesterday: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tomorrow: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastWeek: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextWeek: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
}

export function parseRelativeDate(dateString: string): string | null {
  const dateInfo = getCurrentDateInfo();
  const lowerDateString = dateString.toLowerCase().trim();
  
  // Handle common relative date expressions
  if (lowerDateString === 'today' || lowerDateString === 'now') {
    return dateInfo.currentDate;
  }
  
  if (lowerDateString === 'yesterday') {
    return dateInfo.yesterday;
  }
  
  if (lowerDateString === 'tomorrow') {
    return dateInfo.tomorrow;
  }
  
  if (lowerDateString === 'last week' || lowerDateString === 'a week ago') {
    return dateInfo.lastWeek;
  }
  
  if (lowerDateString === 'next week') {
    return dateInfo.nextWeek;
  }
  
  // Handle "X days ago" format
  const daysAgoMatch = lowerDateString.match(/(\d+)\s+days?\s+ago/);
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1]);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    return targetDate.toISOString().split('T')[0];
  }
  
  // Handle "X days from now" format
  const daysFromNowMatch = lowerDateString.match(/(\d+)\s+days?\s+from\s+now/);
  if (daysFromNowMatch) {
    const days = parseInt(daysFromNowMatch[1]);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    return targetDate.toISOString().split('T')[0];
  }
  
  // Handle "next [weekday]" format
  const nextWeekdayMatch = lowerDateString.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (nextWeekdayMatch) {
    const targetWeekday = nextWeekdayMatch[1];
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetWeekdayIndex = weekdays.indexOf(targetWeekday);
    
    const today = new Date();
    const todayWeekdayIndex = today.getDay();
    
    // Calculate days until next occurrence of the target weekday
    let daysUntilTarget = targetWeekdayIndex - todayWeekdayIndex;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Next week
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
  }
  
  // Handle "this [weekday]" format
  const thisWeekdayMatch = lowerDateString.match(/this\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (thisWeekdayMatch) {
    const targetWeekday = thisWeekdayMatch[1];
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetWeekdayIndex = weekdays.indexOf(targetWeekday);
    
    const today = new Date();
    const todayWeekdayIndex = today.getDay();
    
    // Calculate days until this week's occurrence of the target weekday
    let daysUntilTarget = targetWeekdayIndex - todayWeekdayIndex;
    if (daysUntilTarget < 0) {
      daysUntilTarget += 7; // Next week if already passed this week
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);
    return targetDate.toISOString().split('T')[0];
  }
  
  // If it's already a valid date format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  return null;
}

export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
}

export function getDateContextString(): string {
  const dateInfo = getCurrentDateInfo();
  
  return `Current Date Information:
- Today: ${dateInfo.currentDate} (${dateInfo.currentWeekday}, ${dateInfo.currentMonthName} ${dateInfo.currentDay}, ${dateInfo.currentYear})
- Yesterday: ${dateInfo.yesterday}
- Tomorrow: ${dateInfo.tomorrow}
- Last Week: ${dateInfo.lastWeek}
- Next Week: ${dateInfo.nextWeek}

When users mention relative dates, convert them to YYYY-MM-DD format:
- "yesterday" → ${dateInfo.yesterday}
- "today" → ${dateInfo.currentDate}
- "tomorrow" → ${dateInfo.tomorrow}
- "next Monday" → calculate the next Monday from today
- "this Friday" → calculate this week's Friday
- "next week" → ${dateInfo.nextWeek}

Examples:
- If today is ${dateInfo.currentWeekday} and user says "next Monday", calculate the date of the next Monday
- If user says "this Friday", calculate the date of this week's Friday (or next week's if already passed)`;
}
