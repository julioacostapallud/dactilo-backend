import { NextRequest, NextResponse } from 'next/server';
import { pool, handleError } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, ejercicio_id, velocidad_wpm, precision_porcentaje, tiempo_segundos, errores } = await request.json();

    // Validaciones básicas
    if (!usuario_id || !ejercicio_id || !velocidad_wpm || !precision_porcentaje || !tiempo_segundos) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos excepto errores' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'INSERT INTO resultados (usuario_id, ejercicio_id, velocidad_wpm, precision_porcentaje, tiempo_segundos, errores) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [usuario_id, ejercicio_id, velocidad_wpm, precision_porcentaje, tiempo_segundos, errores || 0]
      );

      return NextResponse.json({
        message: 'Resultado guardado exitosamente',
        resultado: result.rows[0]
      }, { status: 201 });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');
    const limit = searchParams.get('limit') || '10';

    if (!usuario_id) {
      return NextResponse.json(
        { error: 'usuario_id es requerido' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT r.*, e.titulo as ejercicio_titulo, e.dificultad 
         FROM resultados r 
         JOIN ejercicios e ON r.ejercicio_id = e.id 
         WHERE r.usuario_id = $1 
         ORDER BY r.created_at DESC 
         LIMIT $2`,
        [usuario_id, parseInt(limit)]
      );

      return NextResponse.json({
        resultados: result.rows,
        total: result.rows.length
      });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}
