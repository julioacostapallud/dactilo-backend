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
      console.log('🔵 REGISTRO GOOGLE - Usuario existente:', existingUser.email);
      const updatedUser = await updateUser(email, {
        name: name || existingUser.name,
        image: image_url || existingUser.image
      });
      
      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: 'Usuario actualizado'
      });
    } else {
      // Crear nuevo usuario
      console.log('🔵 REGISTRO GOOGLE - Creando nuevo usuario:', email);
      const newUser = await createUser({
        email,
        name: name || undefined,
        image: image_url || undefined
      });
      
      if (!newUser) {
        console.error('❌ REGISTRO GOOGLE - Error al crear usuario en la base de datos');
        return NextResponse.json(
          { error: 'Error al crear usuario en la base de datos' },
          { status: 500 }
        );
      }
      
      console.log('✅ REGISTRO GOOGLE - Usuario creado exitosamente:', newUser.email);
      return NextResponse.json({
        success: true,
        user: newUser,
        message: 'Usuario creado exitosamente'
      });
    }

  } catch (error) {
    console.error('❌ REGISTRO GOOGLE - Error interno:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
