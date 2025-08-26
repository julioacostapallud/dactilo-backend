import { NextRequest, NextResponse } from 'next/server';

// Simulación de base de datos - en producción esto vendría de tu BD real
const users = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Usuario Test',
    created_at: '2024-08-26T20:00:00.000Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    // En un entorno real, aquí verificarías autenticación y permisos
    // Por ahora, retornamos todos los usuarios sin contraseñas
    
    const usersWithoutPasswords = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
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
