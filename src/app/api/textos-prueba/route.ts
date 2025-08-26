import { NextRequest, NextResponse } from 'next/server';
import { pool, handleError } from '@/lib/db';

// GET - Obtener textos de prueba
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pruebaId = searchParams.get('prueba_id');
    const random = searchParams.get('random') === 'true';

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT 
          tp.id, 
          tp.texto, 
          tp.created_at,
          p.id as prueba_id,
          p.nombre as prueba_nombre,
          p.minutos,
          p.minimo_palabras,
          i.nombre as institucion_nombre
        FROM textos_prueba tp
        JOIN pruebas p ON tp.prueba_id = p.id
        JOIN instituciones i ON p.institucion_id = i.id
      `;
      
      const params: any[] = [];
      
      if (pruebaId) {
        query += ' WHERE tp.prueba_id = $1';
        params.push(pruebaId);
      }
      
      if (random) {
        query += ' ORDER BY RANDOM() LIMIT 1';
      } else {
        query += ' ORDER BY tp.created_at DESC';
      }
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        success: true,
        textos: result.rows,
        total: result.rows.length
      });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}

// POST - Crear un nuevo texto de prueba
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prueba_id, texto } = body;

    // Validaciones
    if (!prueba_id || !texto) {
      return NextResponse.json(
        { error: 'prueba_id y texto son requeridos' },
        { status: 400 }
      );
    }

    if (texto.trim().length < 10) {
      return NextResponse.json(
        { error: 'El texto debe tener al menos 10 caracteres' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Verificar que la prueba existe
      const pruebaCheck = await client.query(
        'SELECT id FROM pruebas WHERE id = $1',
        [prueba_id]
      );

      if (pruebaCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'La prueba especificada no existe' },
          { status: 404 }
        );
      }

      const query = `
        INSERT INTO textos_prueba (prueba_id, texto) 
        VALUES ($1, $2) 
        RETURNING id, prueba_id, texto, created_at;
      `;
      
      const result = await client.query(query, [prueba_id, texto.trim()]);
      
      return NextResponse.json({
        success: true,
        message: 'Texto de prueba creado exitosamente',
        texto: result.rows[0]
      }, { status: 201 });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}
