import { NextRequest, NextResponse } from 'next/server';
import { pool, handleError } from '@/lib/db';

// GET - Obtener todas las instituciones
export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT id, nombre, provincia, created_at 
        FROM instituciones 
        ORDER BY nombre;
      `;
      
      const result = await client.query(query);
      
      return NextResponse.json({
        success: true,
        instituciones: result.rows,
        total: result.rows.length
      });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}

// POST - Crear una nueva institución
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, provincia } = body;

    // Validaciones
    if (!nombre || !provincia) {
      return NextResponse.json(
        { error: 'Nombre y provincia son requeridos' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO instituciones (nombre, provincia) 
        VALUES ($1, $2) 
        RETURNING id, nombre, provincia, created_at;
      `;
      
      const result = await client.query(query, [nombre, provincia]);
      
      return NextResponse.json({
        success: true,
        message: 'Institución creada exitosamente',
        institucion: result.rows[0]
      }, { status: 201 });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}
