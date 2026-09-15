import { IProjectRepository, PaginatedResult } from '../interfaces';
import { PortfolioItem } from '../../types';
import { getDb } from '../db';

export class ProjectRepository implements IProjectRepository {
  async getProjects(
    page: number = 1,
    limit: number = 4,
    category?: string,
    search?: string
  ): Promise<PaginatedResult<PortfolioItem>> {
    const db = await getDb();
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIdx = 1;

    if (category && category !== 'Semua') {
      whereClause += ` AND pc.name = $${paramIdx}`;
      params.push(category);
      paramIdx++;
    }

    if (search && search.trim() !== '') {
      whereClause += ` AND (p.title ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx})`;
      params.push(`%${search.trim()}%`);
      paramIdx++;
    }

    // Count Total
    const countSql = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM projects p
      JOIN project_categories pc ON p.category_id = pc.id
      ${whereClause}
    `;
    const countRes = await db.query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    // Fetch Paginated Rows
    const dataSql = `
      SELECT p.id, p.title, p.description, p.image_url as image, p.demo_url as "demoUrl", p.github_url as "githubUrl", pc.name as category
      FROM projects p
      JOIN project_categories pc ON p.category_id = pc.id
      ${whereClause}
      ORDER BY p.id DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const dataParams = [...params, limit, offset];
    const dataRes = await db.query(dataSql, dataParams);

    const projectItems: PortfolioItem[] = [];

    for (const row of dataRes.rows) {
      // Get Tags from normalized join table
      const tagsRes = await db.query(`
        SELECT t.name
        FROM tags t
        JOIN project_tag_map ptm ON t.id = ptm.tag_id
        WHERE ptm.project_id = $1
      `, [row.id]);

      projectItems.push({
        id: row.id.toString(),
        title: row.title,
        description: row.description,
        category: row.category,
        image: row.image,
        demoUrl: row.demoUrl || '',
        githubUrl: row.githubUrl || '',
        tags: tagsRes.rows.map(t => t.name)
      });
    }

    return {
      data: projectItems,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async getProjectById(id: string): Promise<PortfolioItem | null> {
    const db = await getDb();
    const numId = parseInt(id, 10);
    const res = await db.query(`
      SELECT p.id, p.title, p.description, p.image_url as image, p.demo_url as "demoUrl", p.github_url as "githubUrl", pc.name as category
      FROM projects p
      JOIN project_categories pc ON p.category_id = pc.id
      WHERE p.id = $1
    `, [numId]);

    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    const tagsRes = await db.query(`
      SELECT t.name
      FROM tags t
      JOIN project_tag_map ptm ON t.id = ptm.tag_id
      WHERE ptm.project_id = $1
    `, [numId]);

    return {
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      category: row.category,
      image: row.image,
      demoUrl: row.demoUrl || '',
      githubUrl: row.githubUrl || '',
      tags: tagsRes.rows.map(t => t.name)
    };
  }

  async createProject(project: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> {
    const db = await getDb();

    // Ensure category exists
    await db.query(
      `INSERT INTO project_categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
      [project.category, project.category.toLowerCase().replace(/\s+/g, '-')]
    );
    const catRes = await db.query(`SELECT id FROM project_categories WHERE name = $1`, [project.category]);
    const catId = catRes.rows[0].id;

    // Insert project
    const insertRes = await db.query(`
      INSERT INTO projects (category_id, title, description, image_url, demo_url, github_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [catId, project.title, project.description, project.image, project.demoUrl || '', project.githubUrl || '']);

    const newId = insertRes.rows[0].id;

    // Attach tags
    for (const tagName of project.tags) {
      if (!tagName.trim()) continue;
      await db.query(`INSERT INTO tags (name) VALUES ($1) ON CONFLICT DO NOTHING`, [tagName.trim()]);
      const tagRes = await db.query(`SELECT id FROM tags WHERE name = $1`, [tagName.trim()]);
      if (tagRes.rows.length > 0) {
        await db.query(`INSERT INTO project_tag_map (project_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [newId, tagRes.rows[0].id]);
      }
    }

    return {
      id: newId.toString(),
      ...project
    };
  }

  async updateProject(id: string, project: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> {
    const db = await getDb();
    const numId = parseInt(id, 10);

    // Ensure category
    await db.query(
      `INSERT INTO project_categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
      [project.category, project.category.toLowerCase().replace(/\s+/g, '-')]
    );
    const catRes = await db.query(`SELECT id FROM project_categories WHERE name = $1`, [project.category]);
    const catId = catRes.rows[0].id;

    await db.query(`
      UPDATE projects SET
        category_id = $1,
        title = $2,
        description = $3,
        image_url = $4,
        demo_url = $5,
        github_url = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [catId, project.title, project.description, project.image, project.demoUrl || '', project.githubUrl || '', numId]);

    // Clear existing tag mappings
    await db.query(`DELETE FROM project_tag_map WHERE project_id = $1`, [numId]);

    // Re-add tags
    for (const tagName of project.tags) {
      if (!tagName.trim()) continue;
      await db.query(`INSERT INTO tags (name) VALUES ($1) ON CONFLICT DO NOTHING`, [tagName.trim()]);
      const tagRes = await db.query(`SELECT id FROM tags WHERE name = $1`, [tagName.trim()]);
      if (tagRes.rows.length > 0) {
        await db.query(`INSERT INTO project_tag_map (project_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [numId, tagRes.rows[0].id]);
      }
    }

    return {
      id,
      ...project
    };
  }

  async deleteProject(id: string): Promise<boolean> {
    const db = await getDb();
    const numId = parseInt(id, 10);
    const res = await db.query(`DELETE FROM projects WHERE id = $1`, [numId]);
    return (res.rowCount || 0) > 0;
  }
}
