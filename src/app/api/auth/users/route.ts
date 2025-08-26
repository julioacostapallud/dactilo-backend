import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // En un entorno real, aquí verificarías autenticación y permisos
    // Por ahora, retornamos todos los usuarios
    
    const users = await getAllUsers();
    
    const usersWithoutPasswords = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    return NextResponse.json({
      success: true,
      users: usersWithoutPasswords,
      total: usersWithoutPasswords.length
    });

  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
