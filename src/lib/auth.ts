import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING,
});

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

export async function createUser(userData: {
  email: string;
  name?: string;
  image?: string;
  provider?: string;
}): Promise<User | null> {
  try {
    const result = await pool.query(
      'INSERT INTO users (id, email, name, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [userData.email, userData.email, userData.name, userData.image]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

export async function updateUser(email: string, userData: {
  name?: string;
  image?: string;
}): Promise<User | null> {
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, image = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE email = $3 RETURNING *',
      [userData.name, userData.image, email]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY "createdAt" DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}
