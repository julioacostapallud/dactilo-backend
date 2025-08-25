// lib/db.ts
import { Pool } from 'pg';

// 1) Pool compartido para toda la aplicación
export const pool = new Pool({
  connectionString: process.env.NEON_CONNECTION_STRING,
});

// 2) Función auxiliar para manejar errores
export function handleError(error: any) {
  console.error(error);
  return new Response(
    JSON.stringify({ error: 'Internal Server Error' }),
    { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
}

// 3) Función para inicializar la base de datos
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Crear tabla usuarios si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        apellido VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'usuario',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Crear tabla ejercicios si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS ejercicios (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        texto TEXT NOT NULL,
        dificultad VARCHAR(50) DEFAULT 'facil',
        categoria VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Crear tabla resultados si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS resultados (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        ejercicio_id INTEGER REFERENCES ejercicios(id) ON DELETE CASCADE,
        velocidad_wpm INTEGER NOT NULL,
        precision_porcentaje DECIMAL(5,2) NOT NULL,
        tiempo_segundos INTEGER NOT NULL,
        errores INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Base de datos de Dactilo inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    throw error;
  } finally {
    client.release();
  }
}
