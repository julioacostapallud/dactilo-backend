import { NextRequest, NextResponse } from 'next/server';
import { pool, handleError } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      // Verificar qué tablas existen
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      
      const tablesResult = await client.query(tablesQuery);
      
      // Obtener estructura de todas las tablas
      const allTablesStructure = {};
      
      for (const table of tablesResult.rows) {
        const tableName = table.table_name;
        const structureQuery = `
          SELECT column_name, data_type, is_nullable, column_default, ordinal_position
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position
        `;
        
        const structureResult = await client.query(structureQuery, [tableName]);
        allTablesStructure[tableName] = structureResult.rows;
      }
      
      // Obtener información de índices
      const indexesQuery = `
        SELECT 
          t.table_name,
          i.indexname,
          i.indexdef
        FROM pg_indexes i
        JOIN information_schema.tables t ON i.tablename = t.table_name
        WHERE t.table_schema = 'public'
        ORDER BY t.table_name, i.indexname
      `;
      
      const indexesResult = await client.query(indexesQuery);
      
      return NextResponse.json({
        success: true,
        tables: tablesResult.rows,
        structure: allTablesStructure,
        indexes: indexesResult.rows,
        timestamp: new Date().toISOString()
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    return handleError(error);
  }
}
