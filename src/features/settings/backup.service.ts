import { getDatabaseAsync, resetDatabaseAsync } from '../../db/client';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';

export class BackupService {
  static async exportBackup(): Promise<string> {
    const db = await getDatabaseAsync();

    const [
      profile,
      tasks,
      habits,
      habit_logs,
      focus_sessions,
      subjects,
      study_topics,
      study_sessions,
      projects,
      project_tasks,
      journal_entries,
      trades,
      goals,
      goal_milestones,
      skills,
      skill_logs,
      weekly_reviews,
    ] = await Promise.all([
      db.getAllAsync('SELECT * FROM profile;'),
      db.getAllAsync('SELECT * FROM tasks WHERE deleted_at IS NULL;'),
      db.getAllAsync('SELECT * FROM habits;'),
      db.getAllAsync('SELECT * FROM habit_logs;'),
      db.getAllAsync('SELECT * FROM focus_sessions;'),
      db.getAllAsync('SELECT * FROM subjects;'),
      db.getAllAsync('SELECT * FROM study_topics;'),
      db.getAllAsync('SELECT * FROM study_sessions;'),
      db.getAllAsync('SELECT * FROM projects;'),
      db.getAllAsync('SELECT * FROM project_tasks;'),
      db.getAllAsync('SELECT * FROM journal_entries;'),
      db.getAllAsync('SELECT * FROM trades;'),
      db.getAllAsync('SELECT * FROM goals;'),
      db.getAllAsync('SELECT * FROM goal_milestones;'),
      db.getAllAsync('SELECT * FROM skills;'),
      db.getAllAsync('SELECT * FROM skill_logs;'),
      db.getAllAsync('SELECT * FROM weekly_reviews;'),
      db.getAllAsync('SELECT * FROM ideas;'),
    ]);

    const backupData = {
      version: 3,
      exportedAt: new Date().toISOString(),
      profile,
      tasks,
      habits,
      habit_logs,
      focus_sessions,
      subjects,
      study_topics,
      study_sessions,
      projects,
      project_tasks,
      journal_entries,
      trades,
      goals,
      goal_milestones,
      skills,
      skill_logs,
      weekly_reviews,
      ideas,
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

    // Reset database with strict foreign-key order
    await resetDatabaseAsync();
    const db = await getDatabaseAsync();

    // Restore tables inside an atomic transaction
    await db.withTransactionAsync(async () => {
      const insertRows = async (tableName: string, rows: any[]) => {
        if (!Array.isArray(rows) || rows.length === 0) return;
        for (const row of rows) {
          const keys = Object.keys(row);
          const placeholders = keys.map(() => '?').join(', ');
          const values = keys.map((k) => row[k]);
          await db.runAsync(
            `INSERT OR REPLACE INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders});`,
            values
          );
        }
      };

      await insertRows('profile', parsed.profile);
      await insertRows('tasks', parsed.tasks);
      await insertRows('habits', parsed.habits);
      await insertRows('habit_logs', parsed.habit_logs);
      await insertRows('focus_sessions', parsed.focus_sessions);
      await insertRows('subjects', parsed.subjects);
      await insertRows('study_topics', parsed.study_topics);
      await insertRows('study_sessions', parsed.study_sessions);
      await insertRows('projects', parsed.projects);
      await insertRows('project_tasks', parsed.project_tasks);
      await insertRows('journal_entries', parsed.journal_entries);
      await insertRows('trades', parsed.trades);
      await insertRows('goals', parsed.goals);
      await insertRows('goal_milestones', parsed.goal_milestones);
      await insertRows('skills', parsed.skills);
      await insertRows('skill_logs', parsed.skill_logs);
      await insertRows('weekly_reviews', parsed.weekly_reviews);
      await insertRows('ideas', parsed.ideas);
    });

    return true;
  }

  static async clearAllData(): Promise<void> {
    await resetDatabaseAsync();
  }
}
