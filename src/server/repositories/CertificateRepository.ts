import { ICertificateRepository, PaginatedResult } from '../interfaces';
import { CertificateItem } from '../../types';
import { getDb } from '../db';

export class CertificateRepository implements ICertificateRepository {
  async getCertificates(page: number = 1, limit: number = 6): Promise<PaginatedResult<CertificateItem>> {
    const db = await getDb();
    const offset = (page - 1) * limit;

    const countRes = await db.query('SELECT COUNT(*) as total FROM certificates');
    const total = parseInt(countRes.rows[0].total, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    const dataRes = await db.query(`
      SELECT c.id, c.name, i.name as issuer, c.issue_date as date, c.credential_id as "credentialId", c.credential_url as "credentialUrl", c.image_url as image
      FROM certificates c
      JOIN issuers i ON c.issuer_id = i.id
      ORDER BY c.id DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const certificates: CertificateItem[] = dataRes.rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      issuer: row.issuer,
      date: row.date,
      credentialId: row.credentialId || '',
      credentialUrl: row.credentialUrl || '',
      image: row.image
    }));

    return {
      data: certificates,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async createCertificate(certificate: Omit<CertificateItem, 'id'>): Promise<CertificateItem> {
    const db = await getDb();

    // Ensure issuer exists in issuers table
    await db.query(`INSERT INTO issuers (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [certificate.issuer]);
    const issuerRes = await db.query(`SELECT id FROM issuers WHERE name = $1`, [certificate.issuer]);
    const issuerId = issuerRes.rows[0].id;

    const insertRes = await db.query(`
      INSERT INTO certificates (issuer_id, name, issue_date, credential_id, credential_url, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      issuerId,
      certificate.name,
      certificate.date,
      certificate.credentialId || '',
      certificate.credentialUrl || '',
      certificate.image
    ]);

    return {
      id: insertRes.rows[0].id.toString(),
      ...certificate
    };
  }

  async updateCertificate(id: string, certificate: Omit<CertificateItem, 'id'>): Promise<CertificateItem> {
    const db = await getDb();
    const numId = parseInt(id, 10);

    await db.query(`INSERT INTO issuers (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [certificate.issuer]);
    const issuerRes = await db.query(`SELECT id FROM issuers WHERE name = $1`, [certificate.issuer]);
    const issuerId = issuerRes.rows[0].id;

    await db.query(`
      UPDATE certificates SET
        issuer_id = $1,
        name = $2,
        issue_date = $3,
        credential_id = $4,
        credential_url = $5,
        image_url = $6
      WHERE id = $7
    `, [
      issuerId,
      certificate.name,
      certificate.date,
      certificate.credentialId || '',
      certificate.credentialUrl || '',
      certificate.image,
      numId
    ]);

    return {
      id,
      ...certificate
    };
  }

  async deleteCertificate(id: string): Promise<boolean> {
    const db = await getDb();
    const numId = parseInt(id, 10);
    const res = await db.query(`DELETE FROM certificates WHERE id = $1`, [numId]);
    return (res.rowCount || 0) > 0;
  }
}
