import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { format, subDays } from 'date-fns';
import { HabitsRepository, Habit } from '../habits/habits.repository';
import { TasksRepository } from '../tasks/tasks.repository';
import { JournalRepository } from '../journal/journal.repository';

export class ReportsService {
  static async exportDailyReport(): Promise<void> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const tasks = TasksRepository.getTasksByDate(today);
    const habits = HabitsRepository.getAllWithProgress(today);
    const journal = JournalRepository.getEntryByDate(today);

    let csv = 'Type,Title/Name,Category,Status,Time/Schedule\n';

    habits.forEach((h) => {
      const isDone = (h.todayCount || 0) >= (h.target_count || 1);
      csv += `Habit,"${h.name}","${h.category}",${isDone ? 'Completed' : 'Pending'},"${h.preferred_time || h.frequency}"\n`;
    });

    tasks.forEach((t) => {
      csv += `Task,"${t.title}","${t.category}",${t.is_completed ? 'Completed' : 'Pending'},"${t.start_time || 'Today'}"\n`;
    });

    if (journal) {
      csv += `\nJournal Date,Mood (1-5),Energy (1-5),Productivity (1-5),Recap,Lessons Learned\n`;
      csv += `"${journal.date}",${journal.mood_rating},${journal.energy_rating},${journal.productivity_rating},"${journal.recap}","${journal.learned}"\n`;
    }

    await this.shareFile(`dayvane_daily_${today}.csv`, csv);
  }

  static async exportWeeklyReport(): Promise<void> {
    const today = new Date();
    let csv = 'Date,Tasks Total,Tasks Completed,Habits Total,Habits Completed,Daily Score %\n';

    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(today, i), 'yyyy-MM-dd');
      const taskStats = TasksRepository.getCompletionStats(d);
      const habits = HabitsRepository.getAll();
      const completedHabits = habits.filter((h) => {
        const dates = HabitsRepository.getCompletionDates(h.id);
        return dates.includes(d);
      }).length;

      const total = taskStats.total + habits.length;
      const completed = taskStats.completed + completedHabits;
      const score = total === 0 ? 100 : Math.round((completed / total) * 100);

      csv += `"${d}",${taskStats.total},${taskStats.completed},${habits.length},${completedHabits},${score}%\n`;
    }

    await this.shareFile(`dayvane_weekly_report.csv`, csv);
  }

  static async exportMonthlyReport(): Promise<void> {
    const today = new Date();
    let csv = 'Category,Total Tasks,Completed Tasks,Completion Rate %\n';

    const tasks = TasksRepository.getTasks();
    const categories = ['Health', 'Career', 'Finance', 'Learning', 'Faith', 'Personal'];

    categories.forEach((cat) => {
      const catTasks = tasks.filter((t) => t.category?.toLowerCase() === cat.toLowerCase());
      const completed = catTasks.filter((t) => t.is_completed === 1).length;
      const rate = catTasks.length === 0 ? 0 : Math.round((completed / catTasks.length) * 100);
      csv += `"${cat}",${catTasks.length},${completed},${rate}%\n`;
    });

    await this.shareFile(`dayvane_monthly_report.csv`, csv);
  }

  private static async shareFile(fileName: string, content: string): Promise<void> {
    if (Platform.OS === 'web') {
      // In web browser create a download link
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: `Export ${fileName}`,
        UTI: 'public.comma-separated-values-text',
      });
    }
  }
}
