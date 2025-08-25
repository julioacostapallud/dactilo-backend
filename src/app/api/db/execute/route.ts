import { NextRequest, NextResponse } from 'next/server';
import { pool, handleError } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { query, description } = await request.json();

    // Validaciones básicas
    if (!query) {
      return NextResponse.json(
        { error: 'Query es requerido' },
        { status: 400 }
      );
    }

    // Validar que la query sea de tipo DDL (CREATE, ALTER, DROP, etc.)
    const normalizedQuery = query.trim().toUpperCase();
    const allowedOperations = ['CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'GRANT', 'REVOKE'];
    
    const isAllowedOperation = allowedOperations.some(op => normalizedQuery.startsWith(op));
    
    if (!isAllowedOperation) {
      return NextResponse.json(
        { 
          error: 'Solo se permiten operaciones DDL (CREATE, ALTER, DROP, TRUNCATE, GRANT, REVOKE)',
          allowedOperations,
          receivedQuery: query
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Ejecutar la query
      const startTime = Date.now();
      const result = await client.query(query);
      const executionTime = Date.now() - startTime;

      // Obtener información sobre el resultado
      let affectedRows = 0;
      let resultData = null;

      if (result.rowCount !== null) {
        affectedRows = result.rowCount;
      }

      if (result.rows && result.rows.length > 0) {
        resultData = result.rows;
      }

      return NextResponse.json({
        success: true,
        message: 'Query ejecutada exitosamente',
        query: query,
        description: description || 'Sin descripción',
        executionTime: `${executionTime}ms`,
        affectedRows: affectedRows,
        result: resultData,
        timestamp: new Date().toISOString()
      });

    } finally {
      client.release();
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      query: query,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Endpoint para obtener información sobre operaciones permitidas
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Endpoint para ejecutar operaciones DDL en la base de datos',
    allowedOperations: [
      'CREATE TABLE',
      'CREATE INDEX',
      'CREATE VIEW',
      'ALTER TABLE',
      'DROP TABLE',
      'DROP INDEX',
      'DROP VIEW',
      'TRUNCATE TABLE',
      'GRANT',
      'REVOKE'
    ],
    example: {
      method: 'POST',
      body: {
        query: 'CREATE TABLE ejemplo (id SERIAL PRIMARY KEY, nombre VARCHAR(100))',
        description: 'Crear tabla de ejemplo'
      }
    },
    security: 'Este endpoint permite modificar la estructura de la base de datos. Úsalo con precaución.'
  });
}
