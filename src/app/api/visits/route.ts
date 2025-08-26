import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
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
    
    // Insertar nueva visita (simplificado para pruebas)
    const result = await sql`
      INSERT INTO page_visits (
        user_id, page_url, referrer_url, ip_address, user_agent, 
        device_type, browser, os, session_id, visit_start
      ) VALUES (
        ${userId || null}, ${pageUrl}, ${referrerUrl || null}, 
        ${ipAddress}, ${userAgent}, ${deviceType}, ${browser}, ${os}, 
        ${sessionId}, NOW()
      ) RETURNING id
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Visita registrada exitosamente',
      visitId: result.rows[0].id 
    });
    
  } catch (error) {
    console.error('Error registrando visita:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Obtener visitas con paginación
    const visits = await sql`
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
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Obtener total de visitas
    const totalResult = await sql`
      SELECT COUNT(*) as total FROM page_visits
    `;
    
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
    
  } catch (error) {
    console.error('Error obteniendo visitas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para actualizar el final de una visita
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitId, timeOnPageSeconds } = body;
    
    await sql`
      UPDATE page_visits 
      SET visit_end = NOW(), time_on_page_seconds = ${timeOnPageSeconds}
      WHERE id = ${visitId}
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Visita actualizada exitosamente' 
    });
    
  } catch (error) {
    console.error('Error actualizando visita:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
