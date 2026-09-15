import { IProfileRepository } from '../interfaces';
import { ProfileInfo } from '../../types';
import { getDb } from '../db';

export class ProfileRepository implements IProfileRepository {
  async getProfile(): Promise<ProfileInfo> {
    const db = await getDb();

    const profileRes = await db.query('SELECT * FROM profiles ORDER BY id LIMIT 1');
    if (profileRes.rows.length === 0) {
      throw new Error('Profile record not found in database');
    }
    const row = profileRes.rows[0];

    const skillsRes = await db.query(`
      SELECT s.id, s.name, sc.code as category
      FROM skills s
      JOIN skill_categories sc ON s.category_id = sc.id
      ORDER BY sc.display_order ASC, s.display_order ASC
    `);

    return {
      name: row.name,
      title: row.title,
      location: row.location,
      email: row.email,
      phone: row.phone,
      bio: row.bio,
      longBio: row.long_bio,
      avatarUrl: row.avatar_url,
      githubUrl: row.github_url,
      linkedinUrl: row.linkedin_url,
      instagramUrl: row.instagram_url,
      skills: skillsRes.rows.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category
      }))
    };
  }

  async updateProfile(profile: Partial<ProfileInfo>): Promise<ProfileInfo> {
    const db = await getDb();

    await db.query(
      `UPDATE profiles SET
        name = COALESCE($1, name),
        title = COALESCE($2, title),
        location = COALESCE($3, location),
        email = COALESCE($4, email),
        phone = COALESCE($5, phone),
        bio = COALESCE($6, bio),
        long_bio = COALESCE($7, long_bio),
        avatar_url = COALESCE($8, avatar_url),
        github_url = COALESCE($9, github_url),
        linkedin_url = COALESCE($10, linkedin_url),
        instagram_url = COALESCE($11, instagram_url),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = (SELECT id FROM profiles ORDER BY id LIMIT 1)`,
      [
        profile.name,
        profile.title,
        profile.location,
        profile.email,
        profile.phone,
        profile.bio,
        profile.longBio,
        profile.avatarUrl,
        profile.githubUrl,
        profile.linkedinUrl,
        profile.instagramUrl
      ]
    );

    return this.getProfile();
  }
}
