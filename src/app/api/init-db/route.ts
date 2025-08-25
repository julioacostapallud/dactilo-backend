import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, handleError } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    return NextResponse.json({
      message: 'Base de datos inicializada correctamente',
      status: 'success'
    });

  } catch (error) {
    return handleError(error);
  }
}
