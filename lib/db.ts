import mysql, { type RowDataPacket } from 'mysql2/promise';

// Singleton connection pool
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host:               process.env.DB_HOST     ?? 'localhost',
      port:               parseInt(process.env.DB_PORT ?? '3306'),
      user:               process.env.DB_USER     ?? 'root',
      password:           process.env.DB_PASSWORD ?? '',
      database:           process.env.DB_NAME     ?? 'simple_blog',
      waitForConnections: true,
      connectionLimit:    10,
      charset:            'utf8mb4',
      dateStrings:        true,   // return DATETIME as "YYYY-MM-DD HH:MM:SS" strings, not Date objects
    });
  }
  return pool;
}

export async function query<T extends RowDataPacket>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  const db = getPool();
  const [rows] = await db.execute<T[]>(sql, params);
  return rows;
}
