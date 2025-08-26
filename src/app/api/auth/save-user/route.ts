import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, createUser, updateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, image_url, provider } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Buscar si el usuario ya existe
    const existingUser = await findUserByEmail(email);
    
    if (existingUser) {
      // Usuario existe, actualizar información si es necesario
      console.log('Usuario existente encontrado:', existingUser.email);
      const updatedUser = await updateUser(email, {
        name: name || existingUser.name,
        image_url: image_url || existingUser.image_url
      });
      
      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'Usuario actualizado'
      });
    } else {
      // Crear nuevo usuario
      console.log('Creando nuevo usuario:', email);
      const newUser = await createUser({
        email,
        name: name || undefined,
        image_url: image_url || undefined,
        provider: provider || 'google'
      });
      
      if (!newUser) {
        return NextResponse.json(
          { error: 'Error al crear usuario en la base de datos' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        user: newUser,
        message: 'Usuario creado exitosamente'
      });
    }

  } catch (error) {
    console.error('Error saving user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
