/**
 * Weekly quota logic (handles Render cold start / sleep):
 * - "Week" = Monday 00:00 UTC to Sunday 23:59 UTC
 * - No cron needed: purely request-time calculation
 * - If current Monday > user's stored weekStart → reset counter
 * - Quota: 10 images / week, does NOT carry over
 */

const WEEKLY_LIMIT = 10;

// Get the most recent Monday (00:00 UTC) for a given date
export const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon...
  const diff = (day === 0 ? -6 : 1 - day); // days to subtract to get Monday
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Check and update user quota.
 * Returns { allowed: bool, remaining: number, resetDate: Date }
 * Mutates the user object but does NOT save — caller must save.
 */
export const checkAndUpdateQuota = (user) => {
  const currentWeekStart = getMondayOfWeek();

  // If user has no weekStart or it's from a previous week → reset
  if (!user.weekStart || new Date(user.weekStart) < currentWeekStart) {
    user.weekStart = currentWeekStart;
    user.imagesThisWeek = 0;
  }

  const remaining = WEEKLY_LIMIT - user.imagesThisWeek;

  if (remaining <= 0) {
    // Calculate next Monday (reset date)
    const resetDate = new Date(currentWeekStart);
    resetDate.setUTCDate(resetDate.getUTCDate() + 7);
    return { allowed: false, remaining: 0, resetDate };
  }

  return { allowed: true, remaining, resetDate: null };
};

export const WEEKLY_LIMIT_CONST = WEEKLY_LIMIT;
