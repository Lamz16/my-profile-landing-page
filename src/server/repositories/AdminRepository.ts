import { IAdminRepository } from '../interfaces';
import { getDb } from '../db';
import bcrypt from 'bcryptjs';

export class AdminRepository implements IAdminRepository {
  async verifyAdminCredentials(username: string, passwordAttempt: string): Promise<{ id: number; username: string } | null> {
    const db = await getDb();
    const res = await db.query('SELECT * FROM admin_users WHERE username = $1', [username]);

    if (res.rows.length === 0) return null;

    const user = res.rows[0];
    const isMatch = await bcrypt.compare(passwordAttempt, user.password_hash);

    if (!isMatch) return null;

    return {
      id: user.id,
      username: user.username
    };
  }

  async changePassword(adminId: number, oldPasswordAttempt: string, newPassword: string): Promise<boolean> {
    const db = await getDb();
    const res = await db.query('SELECT * FROM admin_users WHERE id = $1', [adminId]);

    if (res.rows.length === 0) return false;

    const user = res.rows[0];
    const isMatch = await bcrypt.compare(oldPasswordAttempt, user.password_hash);

    if (!isMatch) return false;

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [newHash, adminId]);
    return true;
  }

  async getAdminById(id: number): Promise<{ id: number; username: string } | null> {
    const db = await getDb();
    const res = await db.query('SELECT id, username FROM admin_users WHERE id = $1', [id]);

    if (res.rows.length === 0) return null;

    return {
      id: res.rows[0].id,
      username: res.rows[0].username
    };
  }
}
