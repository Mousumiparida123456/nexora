import { pool } from "../db/pool";

export type UserRole = "user" | "admin";

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RefreshTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

function mapUser(row: Record<string, unknown>): UserRecord {
  return {
    id: String(row["id"]),
    email: String(row["email"]),
    passwordHash: String(row["password_hash"]),
    fullName: String(row["full_name"]),
    role: row["role"] as UserRole,
    isActive: Boolean(row["is_active"]),
    createdAt: new Date(String(row["created_at"])),
    updatedAt: new Date(String(row["updated_at"])),
  };
}

export const userRepository = {
  async createUser(input: { email: string; passwordHash: string; fullName: string; role?: UserRole }) {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.email, input.passwordHash, input.fullName, input.role ?? "user"],
    );

    return mapUser(result.rows[0] as Record<string, unknown>);
  },

  async findByEmail(email: string) {
    const result = await pool.query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email]);
    return result.rows[0] ? mapUser(result.rows[0] as Record<string, unknown>) : null;
  },

  async findById(id: string) {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [id]);
    return result.rows[0] ? mapUser(result.rows[0] as Record<string, unknown>) : null;
  },

  async listUsers(options: { limit: number; offset: number; role?: UserRole; search?: string }) {
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (options.role) {
      values.push(options.role);
      conditions.push(`role = $${values.length}`);
    }

    if (options.search) {
      values.push(`%${options.search.toLowerCase()}%`);
      conditions.push(`(LOWER(email) LIKE $${values.length} OR LOWER(full_name) LIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    values.push(options.limit, options.offset);

    const users = await pool.query(
      `SELECT id, email, full_name, role, is_active, created_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1}
       OFFSET $${values.length}`,
      values,
    );

    const countValues = values.slice(0, Math.max(0, values.length - 2));
    const total = await pool.query(
      `SELECT COUNT(*)::int AS total FROM users ${whereClause}`,
      countValues,
    );

    return {
      items: users.rows,
      total: Number(total.rows[0]?.["total"] ?? 0),
    };
  },

  async storeRefreshToken(input: {
    userId: string;
    tokenHash: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }) {
    const result = await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, user_agent, ip_address, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [input.userId, input.tokenHash, input.userAgent ?? null, input.ipAddress ?? null, input.expiresAt],
    );

    return result.rows[0] as RefreshTokenRecord;
  },

  async findRefreshToken(tokenHash: string) {
    const result = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1 LIMIT 1`,
      [tokenHash],
    );

    return (result.rows[0] as RefreshTokenRecord | undefined) ?? null;
  },

  async revokeRefreshToken(tokenHash: string) {
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL`,
      [tokenHash],
    );
  },

  async revokeAllUserRefreshTokens(userId: string) {
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );
  },
};
