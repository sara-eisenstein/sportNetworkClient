export interface Achievement {
    achievementId?: number; // מזהה הישג (אופציונלי כי הוא נוצר אוטומטית בשרת)
    userId: number; // מזהה משתמש
    title: string; // כותרת ההישג
    description: string; // תיאור ההישג
    dateEarned: Date; // תאריך קבלת ההישג
  }
  