import mysql, { type RowDataPacket } from 'mysql2/promise';

// Persist pool across HMR reloads in dev (globalThis survives module re-evaluation)
const g = globalThis as typeof globalThis & { _dbPool?: mysql.Pool };

export function getPool(): mysql.Pool {
  if (!g._dbPool) {
    g._dbPool = mysql.createPool({
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
  return g._dbPool;
}

export async function query<T extends RowDataPacket>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  const db = getPool();
  const [rows] = await db.execute<T[]>(sql, params);
  return rows;
}
