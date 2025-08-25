import { NextRequest, NextResponse } from 'next/server';
import { pool, handleError } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      // Obtener todas las tablas
      const tablesQuery = `
        SELECT 
          table_name,
          table_type
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `;
      
      const tablesResult = await client.query(tablesQuery);
      const tables = tablesResult.rows;

      const databaseStructure: any = {
        tables: [],
        totalTables: tables.length,
        timestamp: new Date().toISOString()
      };

      // Para cada tabla, obtener su estructura completa
      for (const table of tables) {
        const tableName = table.table_name;
        
        // Obtener columnas de la tabla
        const columnsQuery = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position;
        `;
        
        const columnsResult = await client.query(columnsQuery, [tableName]);
        
        // Obtener constraints (PK, FK, etc.)
        const constraintsQuery = `
          SELECT 
            tc.constraint_name,
            tc.constraint_type,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints tc
          LEFT JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          LEFT JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.table_name = $1;
        `;
        
        const constraintsResult = await client.query(constraintsQuery, [tableName]);
        
        // Obtener índices
        const indexesQuery = `
          SELECT 
            indexname,
            indexdef
          FROM pg_indexes 
          WHERE tablename = $1;
        `;
        
        const indexesResult = await client.query(indexesQuery, [tableName]);
        
        // Contar registros en la tabla
        const countQuery = `SELECT COUNT(*) as count FROM "${tableName}";`;
        const countResult = await client.query(countQuery);
        
        const tableStructure = {
          name: tableName,
          type: table.table_type,
          columns: columnsResult.rows,
          constraints: constraintsResult.rows,
          indexes: indexesResult.rows,
          recordCount: parseInt(countResult.rows[0].count),
          createStatement: await generateCreateStatement(client, tableName)
        };
        
        databaseStructure.tables.push(tableStructure);
      }

      return NextResponse.json({
        success: true,
        database: databaseStructure
      });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}

// Función auxiliar para generar el CREATE TABLE statement
async function generateCreateStatement(client: any, tableName: string): Promise<string> {
  try {
    // Obtener la definición de la tabla
    const createQuery = `
      SELECT 
        'CREATE TABLE ' || quote_ident(tablename) || ' (' ||
        string_agg(
          quote_ident(attname) || ' ' || 
          format_type(atttypid, atttypmod) ||
          CASE 
            WHEN attnotnull THEN ' NOT NULL'
            ELSE ''
          END ||
          CASE 
            WHEN atthasdef THEN ' DEFAULT ' || pg_get_expr(adbin, adrelid)
            ELSE ''
          END,
          ', '
          ORDER BY attnum
        ) || ');' as create_statement
      FROM pg_attribute a
      LEFT JOIN pg_attrdef ad ON a.attrelid = ad.adrelid AND a.attnum = ad.adnum
      WHERE a.attrelid = $1::regclass
        AND a.attnum > 0
        AND NOT a.attisdropped
      GROUP BY tablename;
    `;
    
    const result = await client.query(createQuery, [tableName]);
    
    if (result.rows.length > 0) {
      return result.rows[0].create_statement;
    }
    
    return `-- No se pudo generar CREATE TABLE para ${tableName}`;
  } catch (error) {
    return `-- Error generando CREATE TABLE para ${tableName}: ${error}`;
  }
}
