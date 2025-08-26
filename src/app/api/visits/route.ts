import { NextRequest, NextResponse } from 'next/server';
import { pool, handleError } from '@/lib/db';
import { headers } from 'next/headers';

// Función para obtener información del dispositivo
function getDeviceInfo(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  let deviceType = 'desktop';
  let browser = 'unknown';
  let os = 'unknown';
  
  // Detectar dispositivo
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet';
  }
  
  // Detectar navegador
  if (ua.includes('chrome')) browser = 'chrome';
  else if (ua.includes('firefox')) browser = 'firefox';
  else if (ua.includes('safari')) browser = 'safari';
  else if (ua.includes('edge')) browser = 'edge';
  else if (ua.includes('opera')) browser = 'opera';
  
  // Detectar OS
  if (ua.includes('windows')) os = 'windows';
  else if (ua.includes('mac')) os = 'macos';
  else if (ua.includes('linux')) os = 'linux';
  else if (ua.includes('android')) os = 'android';
  else if (ua.includes('ios')) os = 'ios';
  
  return { deviceType, browser, os };
}

// Función para generar un sessionId único
function generateSessionId(ipAddress: string, userAgent: string): string {
  const timestamp = Date.now();
  const crypto = require('crypto');
  const hash = crypto.createHash('md5')
    .update(`${ipAddress}-${userAgent}-${timestamp}`)
    .digest('hex');
  return hash.substring(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageUrl, referrerUrl, userId } = body;
    
    // Obtener headers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    
    // Obtener IP real
    const ipAddress = realIp || forwardedFor?.split(',')[0] || 'unknown';
    
    // Generar sessionId
    const sessionId = generateSessionId(ipAddress, userAgent);
    
    // Obtener información del dispositivo
    const { deviceType, browser, os } = getDeviceInfo(userAgent);
    
    const client = await pool.connect();
    
    try {
      // Insertar nueva visita
      const query = `
        INSERT INTO page_visits (
          user_id, page_url, referrer_url, ip_address, user_agent, 
          device_type, browser, os, session_id, visit_start
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id
      `;
      
      const result = await client.query(query, [
        userId || null, 
        pageUrl, 
        referrerUrl || null, 
        ipAddress, 
        userAgent, 
        deviceType, 
        browser, 
        os, 
        sessionId
      ]);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Visita registrada exitosamente',
        visitId: result.rows[0].id 
      });
      
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const client = await pool.connect();
    
    try {
      // Obtener visitas con paginación
      const visitsQuery = `
        SELECT 
          pv.id,
          pv.page_url,
          pv.referrer_url,
          pv.ip_address,
          pv.device_type,
          pv.browser,
          pv.os,
          pv.session_id,
          pv.visit_start,
          pv.visit_end,
          pv.time_on_page_seconds,
          u.email as user_email
        FROM page_visits pv
        LEFT JOIN users u ON pv.user_id = u.id
        ORDER BY pv.visit_start DESC
        LIMIT $1 OFFSET $2
      `;
      
      const visits = await client.query(visitsQuery, [limit, offset]);
      
      // Obtener total de visitas
      const totalResult = await client.query('SELECT COUNT(*) as total FROM page_visits');
      const total = parseInt(totalResult.rows[0].total);
      
      return NextResponse.json({
        success: true,
        visits: visits.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    return handleError(error);
  }
}

// Endpoint para actualizar el final de una visita
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitId, timeOnPageSeconds } = body;
    
    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE page_visits 
        SET visit_end = NOW(), time_on_page_seconds = $1
        WHERE id = $2
      `;
      
      await client.query(query, [timeOnPageSeconds, visitId]);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Visita actualizada exitosamente' 
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    return handleError(error);
  }
}
