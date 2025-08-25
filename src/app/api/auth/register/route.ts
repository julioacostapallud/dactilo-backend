import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { pool, handleError } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre, apellido } = await request.json();

    // Validaciones básicas
    if (!email || !password || !nombre || !apellido) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = await client.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 409 }
        );
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(password, 10);

      // Insertar nuevo usuario
      const result = await client.query(
        'INSERT INTO usuarios (email, password_hash, nombre, apellido) VALUES ($1, $2, $3, $4) RETURNING id, email, nombre, apellido, rol',
        [email, passwordHash, nombre, apellido]
      );

      const newUser = result.rows[0];

      return NextResponse.json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: newUser.id,
          email: newUser.email,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          rol: newUser.rol
        }
      }, { status: 201 });

    } finally {
      client.release();
    }

  } catch (error) {
    return handleError(error);
  }
}
