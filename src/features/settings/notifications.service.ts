import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class NotificationsService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('growpro_reminders', {
          name: 'GrowPro Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1E8E4E',
        });
      }

      return finalStatus === 'granted';
    } catch {
      return false;
    }
  }

  static async scheduleDailyReminder(timeString = '08:30'): Promise<void> {
    try {
      const hasPerm = await this.requestPermissions();
      if (!hasPerm) return;

      // Cancel previous scheduled reminders
      await Notifications.cancelAllScheduledNotificationsAsync();

      const [hours, minutes] = timeString.split(':').map(Number);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Plan Your Day With GrowPro 🎯',
          body: 'Check your priorities, habits, and focus targets for today!',
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours || 8,
          minute: minutes || 30,
        },
      });
    } catch {
      // Graceful fail
    }
  }

  static async notifyTimerComplete(type: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: type === 'pomodoro' ? 'Focus Session Complete! 🏆' : 'Break Finished! ⏰',
          body: type === 'pomodoro' ? 'Great work! Take a short break.' : 'Time to focus again!',
          sound: true,
        },
        trigger: null, // immediate
      });
    } catch {
      // Graceful fail
    }
  }
}

