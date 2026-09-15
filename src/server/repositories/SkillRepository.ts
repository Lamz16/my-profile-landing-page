import { ISkillRepository } from '../interfaces';
import { SkillItem } from '../../types';
import { getDb } from '../db';

export class SkillRepository implements ISkillRepository {
  async getSkills(): Promise<SkillItem[]> {
    const db = await getDb();
    const res = await db.query(`
      SELECT s.id, s.name, sc.code as category
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      ORDER BY sc.display_order ASC, s.display_order ASC
    `);

    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category
    }));
  }

  async addSkill(name: string, categoryCode: string): Promise<SkillItem> {
    const db = await getDb();
    
    // Find category ID
    const catRes = await db.query('SELECT id FROM skill_categories WHERE code = $1', [categoryCode]);
    let catId = catRes.rows.length > 0 ? catRes.rows[0].id : null;

    if (!catId) {
      // Default fallback
      const defaultCat = await db.query('SELECT id FROM skill_categories ORDER BY id LIMIT 1');
      catId = defaultCat.rows[0].id;
    }

    const insertRes = await db.query(
      'INSERT INTO skills (category_id, name) VALUES ($1, $2) RETURNING id, name',
      [catId, name]
    );

    return {
      id: insertRes.rows[0].id,
      name: insertRes.rows[0].name,
      category: categoryCode as any
    };
  }

  async deleteSkill(id: string | number): Promise<boolean> {
    const db = await getDb();
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const res = await db.query('DELETE FROM skills WHERE id = $1', [numericId]);
    return (res.rowCount || 0) > 0;
  }
}
