import { TABLE_DELETION_ORDER } from '../client';

describe('Foreign Key Integrity & Table Deletion Hierarchy', () => {
  it('defines TABLE_DELETION_ORDER with child tables strictly before parent tables', () => {
    const indexOf = (table: string) => TABLE_DELETION_ORDER.indexOf(table as any);

    // skill_logs (child) before skills (parent)
    expect(indexOf('skill_logs')).toBeLessThan(indexOf('skills'));

    // goal_milestones (child) before goals (parent)
    expect(indexOf('goal_milestones')).toBeLessThan(indexOf('goals'));

    // project_tasks (child) before projects (parent)
    expect(indexOf('project_tasks')).toBeLessThan(indexOf('projects'));

    // study_topics and study_sessions (children) before subjects (parent)
    expect(indexOf('study_topics')).toBeLessThan(indexOf('subjects'));
    expect(indexOf('study_sessions')).toBeLessThan(indexOf('subjects'));

    // habit_logs (child) before habits (parent)
    expect(indexOf('habit_logs')).toBeLessThan(indexOf('habits'));
  });

  it('contains all 17 system tables to prevent orphan data or lingering foreign keys', () => {
    const requiredTables = [
      'profile',
      'tasks',
      'habits',
      'habit_logs',
      'focus_sessions',
      'subjects',
      'study_topics',
      'study_sessions',
      'projects',
      'project_tasks',
      'journal_entries',
      'trades',
      'goals',
      'goal_milestones',
      'skills',
      'skill_logs',
      'weekly_reviews',
    ];

    for (const table of requiredTables) {
      expect(TABLE_DELETION_ORDER).toContain(table);
    }
  });

  it('drops tables sequentially in child-first order', () => {
    const dropStatements = TABLE_DELETION_ORDER.map((t) => `DROP TABLE IF EXISTS ${t};`);
    expect(dropStatements.length).toBe(17);
    expect(dropStatements[0]).toBe('DROP TABLE IF EXISTS weekly_reviews;');
    expect(dropStatements[dropStatements.length - 1]).toBe('DROP TABLE IF EXISTS profile;');
  });
});
