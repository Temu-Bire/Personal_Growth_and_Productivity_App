export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_uri TEXT,
  main_focus TEXT DEFAULT 'Study',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  category TEXT DEFAULT 'General',
  priority TEXT DEFAULT 'medium',
  reminder_time TEXT,
  repeat TEXT DEFAULT 'none',
  is_completed INTEGER DEFAULT 0,
  completed_at TEXT,
  is_priority INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(is_completed);

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_count INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'times',
  frequency TEXT DEFAULT 'daily',
  icon TEXT DEFAULT 'flash-outline',
  color TEXT DEFAULT '#1E8E4E',
  reminder_time TEXT,
  is_archived INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  type TEXT DEFAULT 'pomodoro',
  duration_minutes INTEGER NOT NULL,
  completed_seconds INTEGER NOT NULL,
  start_timestamp TEXT NOT NULL,
  end_timestamp TEXT NOT NULL,
  is_completed INTEGER DEFAULT 1,
  category TEXT DEFAULT 'Study',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_focus_created ON focus_sessions(created_at);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#1E8E4E',
  target_hours INTEGER DEFAULT 20,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS study_topics (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  completed_at TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_study_topics_sub ON study_topics(subject_id);

CREATE TABLE IF NOT EXISTS study_sessions (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_study_sessions_sub ON study_sessions(subject_id);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress',
  color TEXT DEFAULT '#1E8E4E',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_project_tasks_prj ON project_tasks(project_id);

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  mood INTEGER NOT NULL,
  content TEXT NOT NULL,
  tags TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date);

CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY,
  pair TEXT NOT NULL,
  direction TEXT NOT NULL,
  entry_price REAL NOT NULL,
  exit_price REAL NOT NULL,
  lot_size REAL NOT NULL,
  pnl REAL NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  screenshot_uri TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  target_value REAL DEFAULT 100,
  unit TEXT DEFAULT '%',
  is_completed INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_goals_due ON goals(due_date);
CREATE INDEX IF NOT EXISTS idx_goals_completed ON goals(is_completed);

CREATE TABLE IF NOT EXISTS goal_milestones (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  title TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal ON goal_milestones(goal_id);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'technical',
  progress INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_logs (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_skill_logs_skill ON skill_logs(skill_id);

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id TEXT PRIMARY KEY,
  week_start_date TEXT NOT NULL,
  week_end_date TEXT NOT NULL,
  tasks_done INTEGER DEFAULT 0,
  habits_rate REAL DEFAULT 0,
  top_achievement TEXT,
  reflection TEXT,
  mood_average REAL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_start ON weekly_reviews(week_start_date);

CREATE TABLE IF NOT EXISTS custom_categories (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#1E8E4E',
  icon TEXT DEFAULT 'bookmark-outline',
  is_default INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_custom_categories_entity ON custom_categories(entity_type);

CREATE TABLE IF NOT EXISTS custom_units (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_custom_units_entity ON custom_units(entity_type);

CREATE TABLE IF NOT EXISTS custom_fields (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL,
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  placeholder TEXT,
  help_text TEXT,
  default_value TEXT,
  options_json TEXT,
  is_required INTEGER DEFAULT 0,
  is_system INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0,
  section TEXT DEFAULT 'General',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_custom_fields_entity ON custom_fields(entity_type);

CREATE TABLE IF NOT EXISTS custom_field_values (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field_key TEXT NOT NULL,
  value_text TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_field_values_entity ON custom_field_values(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS user_preferences (
  key TEXT PRIMARY KEY NOT NULL,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

