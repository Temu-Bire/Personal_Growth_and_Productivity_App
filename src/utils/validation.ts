import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required (YYYY-MM-DD)'),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
  category: z.string().default('General'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  reminderTime: z.string().optional().nullable(),
  repeat: z.enum(['none', 'daily', 'weekly']).default('none'),
});

export const habitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  targetCount: z.number().min(1, 'Target must be at least 1').default(1),
  unit: z.string().default('times'),
  frequency: z.enum(['daily', 'weekly']).default('daily'),
  icon: z.string().default('flash-outline'),
  color: z.string().default('#1E8E4E'),
  reminderTime: z.string().optional().nullable(),
});

export const tradeSchema = z.object({
  pair: z.string().min(1, 'Pair/symbol is required'),
  direction: z.enum(['buy', 'sell']),
  entryPrice: z.number().positive('Entry price must be positive'),
  exitPrice: z.number().positive('Exit price must be positive'),
  lotSize: z.number().positive('Lot size must be positive'),
  pnl: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required'),
  notes: z.string().optional().nullable(),
  screenshotUri: z.string().optional().nullable(),
});

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid due date required'),
  category: z.string().default('General'),
  targetValue: z.number().min(1).default(100),
  unit: z.string().default('%'),
});

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid due date required'),
  status: z.enum(['planning', 'in_progress', 'completed', 'on_hold']).default('in_progress'),
  color: z.string().default('#1E8E4E'),
});

export const journalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date required'),
  mood: z.number().min(1).max(5),
  content: z.string().min(1, 'Journal thoughts cannot be empty'),
  tags: z.array(z.string()).default([]),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required').max(60),
  category: z.enum(['technical', 'soft']).default('technical'),
  progress: z.number().min(0).max(100).default(0),
  notes: z.string().optional().nullable(),
});

