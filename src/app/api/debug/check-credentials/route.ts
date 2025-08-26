import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      // Verificar si la tabla existe y tiene datos
      const result = await client.query('SELECT * FROM user_credentials');
      
      return NextResponse.json({
        success: true,
        credentials: result.rows,
        count: result.rows.length,
        tableExists: true
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error checking credentials:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
