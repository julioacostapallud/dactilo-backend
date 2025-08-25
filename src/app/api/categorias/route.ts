import { NextRequest, NextResponse } from 'next/server';
import { pool, handleError } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT * FROM text_categories ORDER BY name');
      
      return NextResponse.json({
        categorias: result.rows,
        total: result.rows.length
      });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, difficultyLevel } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Nombre es requerido' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'INSERT INTO text_categories (name, description, "difficultyLevel") VALUES ($1, $2, $3) RETURNING *',
        [name, description, difficultyLevel || 1]
      );

      return NextResponse.json({
        message: 'Categoría creada exitosamente',
        categoria: result.rows[0]
      }, { status: 201 });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}
