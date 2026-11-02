import { getDatabase, resetDatabase } from '../../db/client';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';

export class BackupService {
  static async exportBackup(): Promise<string> {
    const db = getDatabase();

    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: db.getAllSync('SELECT * FROM profile'),
      tasks: db.getAllSync('SELECT * FROM tasks WHERE deleted_at IS NULL'),
      habits: db.getAllSync('SELECT * FROM habits'),
      habit_logs: db.getAllSync('SELECT * FROM habit_logs'),
      focus_sessions: db.getAllSync('SELECT * FROM focus_sessions'),
      subjects: db.getAllSync('SELECT * FROM subjects'),
      study_topics: db.getAllSync('SELECT * FROM study_topics'),
      study_sessions: db.getAllSync('SELECT * FROM study_sessions'),
      projects: db.getAllSync('SELECT * FROM projects'),
      project_tasks: db.getAllSync('SELECT * FROM project_tasks'),
      journal_entries: db.getAllSync('SELECT * FROM journal_entries'),
      trades: db.getAllSync('SELECT * FROM trades'),
      goals: db.getAllSync('SELECT * FROM goals'),
      goal_milestones: db.getAllSync('SELECT * FROM goal_milestones'),
      skills: db.getAllSync('SELECT * FROM skills'),
      skill_logs: db.getAllSync('SELECT * FROM skill_logs'),
      weekly_reviews: db.getAllSync('SELECT * FROM weekly_reviews'),
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `growpro_backup_${Date.now()}.growpro`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export GrowPro Backup',
        UTI: 'public.json',
      });
    }

    await AsyncStorage.setItem(STORAGE_KEYS.LAST_BACKUP_DATE, new Date().toISOString());
    return filePath;
  }

  static async importBackup(): Promise<boolean> {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return false;
    }

    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const parsed = JSON.parse(content);
    if (!parsed || !parsed.version) {
      throw new Error('Invalid GrowPro backup format.');
    }

    resetDatabase();
    const db = getDatabase();

    // Restore tables safely
    const insertRows = (tableName: string, rows: any[]) => {
      if (!Array.isArray(rows) || rows.length === 0) return;
      for (const row of rows) {
        const keys = Object.keys(row);
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map((k) => row[k]);
        db.runSync(
          `INSERT OR REPLACE INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
          values
        );
      }
    };

    insertRows('profile', parsed.profile);
    insertRows('tasks', parsed.tasks);
    insertRows('habits', parsed.habits);
    insertRows('habit_logs', parsed.habit_logs);
    insertRows('focus_sessions', parsed.focus_sessions);
    insertRows('subjects', parsed.subjects);
    insertRows('study_topics', parsed.study_topics);
    insertRows('study_sessions', parsed.study_sessions);
    insertRows('projects', parsed.projects);
    insertRows('project_tasks', parsed.project_tasks);
    insertRows('journal_entries', parsed.journal_entries);
    insertRows('trades', parsed.trades);
    insertRows('goals', parsed.goals);
    insertRows('goal_milestones', parsed.goal_milestones);
    insertRows('skills', parsed.skills);
    insertRows('skill_logs', parsed.skill_logs);
    insertRows('weekly_reviews', parsed.weekly_reviews);

    return true;
  }

  static clearAllData(): void {
    resetDatabase();
  }
}
