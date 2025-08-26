import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { findUserByEmail } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario en la tabla users
    const user = await findUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Buscar la contraseña encriptada en user_credentials
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT password_hash FROM user_credentials WHERE user_id = $1',
        [user.id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Credenciales inválidas' },
          { status: 401 }
        );
      }

      const { password_hash } = result.rows[0];

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, password_hash);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Credenciales inválidas' },
          { status: 401 }
        );
      }

      // Retornar usuario sin información sensible
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error en validación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
