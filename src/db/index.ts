import { Pool, PoolClient, QueryResult } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

pool.on('error', function (err: Error) {
  console.log('db connect error');
});

/**
 * Single Query to Postgres
 * @param { string } sql the query for store data
 * @param { string[][] | undefined } data the data to be stored
 * @returns { Promise<QueryResult> }
 */
export const sqlToDB = async (sql: string, data: string[][] | undefined = undefined): Promise<QueryResult> => {
  let result: QueryResult;
  try {
    result = await pool.query(sql, data);
    return result;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

/**
 * Retrieve a SQL client with transaction from connection pool. If the client is valid, either
 * COMMMIT or ROALLBACK needs to be called at the end before releasing the connection back to pool.
 * @returns { Promise<PoolClient> }
 */
export const getTransaction = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    return client;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

/**
 * Execute a sql statment with a single row of data
 * @param { string } sql the query for store data
 * @param { string[][] | undefined } data the data to be stored
 * @returns { Promise<QueryResult> }
 */
export const sqlExecSingleRow = async (
  client: PoolClient,
  sql: string,
  data: string[][] | undefined = undefined,
): Promise<QueryResult> => {
  try {
    const result: QueryResult = await client.query(sql, data);
    return result;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

/**
 * Execute a sql statement with multiple rows of parameter data.
 * @param { string } sql the query for store data
 * @param { string[][] } data the data to be stored
 * @returns { Promise<QueryResult> }
 */
export const sqlExecMultipleRows = async (client: PoolClient, sql: string, data: string[][]): Promise<void> => {
  if (data.length !== 0) {
    for (const item of data) {
      try {
        await client.query(sql, item);
      } catch (error) {
        throw new Error((error as Error).message);
      }
    }
  } else {
    throw new Error('sqlExecMultipleRows(): No data available');
  }
};

/**
 * Rollback transaction
 * @param { PoolClient } client
 * @returns { Promise<void> }
 */
export const rollback = async (client: PoolClient): Promise<void> => {
  if (typeof client !== 'undefined' && client) {
    try {
      await client.query('ROLLBACK');
    } catch (error) {
      throw new Error((error as Error).message);
    } finally {
      client.release();
    }
  } else {
    console.warn(`rollback() not excuted. client is not set`);
  }
};

/**
 * Commit transaction
 * @param { PoolClient } client
 * @returns { Promise<void> }
 */
export const commit = async (client: PoolClient): Promise<void> => {
  try {
    await client.query('COMMIT');
  } catch (error) {
    throw new Error((error as Error).message);
  } finally {
    client.release();
  }
};
