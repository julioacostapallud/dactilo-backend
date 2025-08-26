import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { findUserByEmail, createUser } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validaciones
    if (!email || !password || !name) {
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

    // Verificar si el usuario ya existe
    const existingUser = await findUserByEmail(email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario en la base de datos
    const newUser = await createUser({
      email,
      name,
      image: undefined,
      provider: 'credentials'
    });

    if (!newUser) {
      return NextResponse.json(
        { error: 'Error al crear usuario en la base de datos' },
        { status: 500 }
      );
    }

    // Guardar la contraseña encriptada en la tabla user_credentials
    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO user_credentials (user_id, password_hash) VALUES ($1, $2)',
        [newUser.id, hashedPassword]
      );
    } finally {
      client.release();
    }
    
    console.log('✅ REGISTRO EMAIL - Usuario creado exitosamente:', newUser.email);

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ REGISTRO EMAIL - Error interno:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
