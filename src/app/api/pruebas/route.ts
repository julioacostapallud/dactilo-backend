import { NextRequest, NextResponse } from 'next/server';
import { pool, handleError } from '@/lib/db';

// GET - Obtener todas las pruebas con información de la institución
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institucionId = searchParams.get('institucion_id');

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          p.id, 
          p.nombre, 
          p.minutos, 
          p.minimo_palabras, 
          p.created_at,
          i.id as institucion_id,
          i.nombre as institucion_nombre,
          i.provincia
        FROM pruebas p
        JOIN instituciones i ON p.institucion_id = i.id
      `;
      
      const params: any[] = [];
      
      if (institucionId) {
        query += ' WHERE p.institucion_id = $1';
        params.push(institucionId);
      }
      
      query += ' ORDER BY i.nombre, p.nombre';
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        success: true,
        pruebas: result.rows,
        total: result.rows.length
      });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}

// POST - Crear una nueva prueba
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { institucion_id, nombre, minutos, minimo_palabras } = body;

    // Validaciones
    if (!institucion_id || !nombre || !minutos || !minimo_palabras) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos: institucion_id, nombre, minutos, minimo_palabras' },
        { status: 400 }
      );
    }

    if (minutos <= 0 || minimo_palabras <= 0) {
      return NextResponse.json(
        { error: 'Minutos y mínimo_palabras deben ser mayores a 0' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Verificar que la institución existe
      const institucionCheck = await client.query(
        'SELECT id FROM instituciones WHERE id = $1',
        [institucion_id]
      );

      if (institucionCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'La institución especificada no existe' },
          { status: 404 }
        );
      }

      const query = `
        INSERT INTO pruebas (institucion_id, nombre, minutos, minimo_palabras) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, institucion_id, nombre, minutos, minimo_palabras, created_at;
      `;
      
      const result = await client.query(query, [institucion_id, nombre, minutos, minimo_palabras]);
      
      return NextResponse.json({
        success: true,
        message: 'Prueba creada exitosamente',
        prueba: result.rows[0]
      }, { status: 201 });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}
