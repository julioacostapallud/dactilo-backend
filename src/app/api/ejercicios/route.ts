import { NextRequest, NextResponse } from 'next/server';
import { pool, handleError } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dificultad = searchParams.get('dificultad');
    const categoria = searchParams.get('categoria');
    const limit = searchParams.get('limit') || '10';

    const client = await pool.connect();
    
    try {
      let query = 'SELECT * FROM ejercicios';
      const params: any[] = [];
      let paramCount = 0;

      // Construir WHERE clause dinámicamente
      const conditions: string[] = [];
      
      if (dificultad) {
        paramCount++;
        conditions.push(`dificultad = $${paramCount}`);
        params.push(dificultad);
      }

      if (categoria) {
        paramCount++;
        conditions.push(`categoria = $${paramCount}`);
        params.push(categoria);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC LIMIT $' + (paramCount + 1);
      params.push(parseInt(limit));

      const result = await client.query(query, params);

      return NextResponse.json({
        ejercicios: result.rows,
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
    const { titulo, descripcion, texto, dificultad, categoria } = await request.json();

    // Validaciones básicas
    if (!titulo || !texto) {
      return NextResponse.json(
        { error: 'Título y texto son requeridos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'INSERT INTO ejercicios (titulo, descripcion, texto, dificultad, categoria) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [titulo, descripcion, texto, dificultad || 'facil', categoria]
      );

      return NextResponse.json({
        message: 'Ejercicio creado exitosamente',
        ejercicio: result.rows[0]
      }, { status: 201 });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}
