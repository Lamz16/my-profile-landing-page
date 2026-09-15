import { IContactRepository, PaginatedResult } from '../interfaces';
import { InboxMessage } from '../../types';
import { getDb } from '../db';

export class ContactRepository implements IContactRepository {
  async saveMessage(senderName: string, senderEmail: string, subject: string, message: string): Promise<InboxMessage> {
    const db = await getDb();
    const res = await db.query(`
      INSERT INTO inbox_messages (sender_name, sender_email, subject, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id, sender_name as "senderName", sender_email as "senderEmail", subject, message, is_read as "isRead", created_at as "createdAt"
    `, [senderName, senderEmail, subject, message]);

    const row = res.rows[0];
    return {
      id: row.id.toString(),
      senderName: row.senderName,
      senderEmail: row.senderEmail,
      subject: row.subject,
      message: row.message,
      isRead: row.isRead,
      createdAt: new Date(row.createdAt).toISOString()
    };
  }

  async getMessages(page: number = 1, limit: number = 5): Promise<PaginatedResult<InboxMessage>> {
    const db = await getDb();
    const offset = (page - 1) * limit;

    const countRes = await db.query('SELECT COUNT(*) as total FROM inbox_messages');
    const total = parseInt(countRes.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    const dataRes = await db.query(`
      SELECT id, sender_name as "senderName", sender_email as "senderEmail", subject, message, is_read as "isRead", created_at as "createdAt"
      FROM inbox_messages
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const messages: InboxMessage[] = dataRes.rows.map(row => ({
      id: row.id.toString(),
      senderName: row.senderName,
      senderEmail: row.senderEmail,
      subject: row.subject,
      message: row.message,
      isRead: row.isRead,
      createdAt: new Date(row.createdAt).toISOString()
    }));

    return {
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async markAsRead(id: string): Promise<boolean> {
    const db = await getDb();
    const numId = parseInt(id, 10);
    const res = await db.query(`UPDATE inbox_messages SET is_read = TRUE WHERE id = $1`, [numId]);
    return (res.rowCount || 0) > 0;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const db = await getDb();
    const numId = parseInt(id, 10);
    const res = await db.query(`DELETE FROM inbox_messages WHERE id = $1`, [numId]);
    return (res.rowCount || 0) > 0;
  }
}
