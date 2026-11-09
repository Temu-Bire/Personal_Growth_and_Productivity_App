import { getDatabase } from '../../db/client';
import { generateId } from '../../utils/id';
import { HabitsRepository } from '../habits/habits.repository';
import { TasksRepository } from '../tasks/tasks.repository';
import { format } from 'date-fns';

export interface CoachMessage {
  id: string;
  role: 'user' | 'coach';
  text: string;
  created_at: string;
}

export class CoachRepository {
  static getMessages(displayName: string = 'Temesgen'): CoachMessage[] {
    const db = getDatabase();
    const rows = db.getAllSync<any>('SELECT * FROM coach_messages ORDER BY created_at ASC;');

    if (rows.length === 0) {
      // Seed initial coach welcome message
      const today = format(new Date(), 'yyyy-MM-dd');
      const stats = TasksRepository.getCompletionStats(today);
      const habits = HabitsRepository.getAllWithProgress(today);
      const total = stats.total + habits.length;
      const completed = stats.completed + habits.filter((h) => (h.todayCount || 0) >= (h.target_count || 1)).length;

      const welcomeText = `Hi ${displayName}! You completed ${completed} of ${Math.max(total, 5)} today. What would you like to improve?`;
      this.addMessage('coach', welcomeText);
      return db.getAllSync<CoachMessage>('SELECT * FROM coach_messages ORDER BY created_at ASC;');
    }

    return rows.map((r) => ({
      id: r.id,
      role: r.role as 'user' | 'coach',
      text: r.text,
      created_at: r.created_at,
    }));
  }

  static addMessage(role: 'user' | 'coach', text: string): CoachMessage {
    const db = getDatabase();
    const id = generateId('coach_msg');
    const now = new Date().toISOString();

    db.runSync(
      'INSERT INTO coach_messages (id, role, text, created_at) VALUES (?, ?, ?, ?);',
      [id, role, text.trim(), now]
    );

    return { id, role, text: text.trim(), created_at: now };
  }

  static generateOfflineReply(userQuery: string): string {
    const q = userQuery.toLowerCase();
    const habits = HabitsRepository.getAll();
    const today = format(new Date(), 'yyyy-MM-dd');

    if (q.includes('slipping') || q.includes('why')) {
      const struggling = habits.find((h) => (h.current_streak || 0) === 0);
      if (struggling) {
        return `Your "${struggling.name}" habit dropped in consistency recently. Habits slip when friction is too high. Try scheduling it at the start of your day or pairing it with your morning routine.`;
      }
      return 'You are on track with your core habits! The key to avoiding slips is protecting your lowest energy hours and tackling priority tasks early.';
    }

    if (q.includes('plan') || q.includes('week')) {
      const topHabit = habits[0]?.name || 'morning routine';
      return `To plan an effective week: 1) Anchor your days around ${topHabit}, 2) Time-block 2 hours each morning for top priority tasks, and 3) Review your progress on Sunday evening.`;
    }

    if (q.includes('consistent') || q.includes('stay consistent')) {
      const bestStreak = habits.reduce((max, h) => Math.max(max, h.longest_streak || 0), 0);
      const bestHabit = habits.find((h) => (h.longest_streak || 0) === bestStreak)?.name || 'Daily focus';
      return `Start small: pick one habit and do it at the same time every day. Your best streak (${bestStreak || 7} days) is with ${bestHabit}. Protect that momentum!`;
    }

    // Default heuristic analysis
    const taskStats = TasksRepository.getCompletionStats(today);
    return `Looking at your data: you have ${taskStats.completed} tasks done today out of ${taskStats.total}. Keep focusing on one task at a time, celebrate small wins, and avoid multitasking.`;
  }

  static getWeeklyInsight(): { title: string; body: string } | null {
    const habits = HabitsRepository.getAll();
    if (habits.length === 0) return null;

    const struggling = habits.find((h) => (h.current_streak || 0) <= 1);
    if (struggling) {
      return {
        title: 'Weekly insight',
        body: `Your ${struggling.name} habit dropped this week. Try moving it to the morning.`,
      };
    }

    return {
      title: 'Weekly insight',
      body: `Your habit streaks are strong this week! Consistency creates compounding returns.`,
    };
  }
}

