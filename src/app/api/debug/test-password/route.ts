import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { findUserByEmail } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔍 TEST PASSWORD - Email:', email);
    console.log('🔍 TEST PASSWORD - Password:', password);

    // Buscar usuario
    const user = await findUserByEmail(email);
    console.log('🔍 TEST PASSWORD - User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' });
    }

    // Buscar contraseña
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT password_hash FROM user_credentials WHERE user_id = $1',
        [user.id]
      );

      console.log('🔍 TEST PASSWORD - Credentials found:', result.rows.length > 0 ? 'YES' : 'NO');

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Credenciales no encontradas' });
      }

      const { password_hash } = result.rows[0];
      console.log('🔍 TEST PASSWORD - Password hash:', password_hash);

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, password_hash);
      console.log('🔍 TEST PASSWORD - Password valid:', isPasswordValid);

      return NextResponse.json({
        success: true,
        userFound: true,
        credentialsFound: true,
        passwordValid: isPasswordValid,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ TEST PASSWORD - Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
