import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';
import { findUserByEmail, createUser, updateUser } from '@/lib/auth';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Aquí deberías buscar en tu base de datos real
          // Por ahora usamos el usuario de prueba
          const testUser = {
            id: '1',
            email: 'test@example.com',
            password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: 'password'
            name: 'Usuario Test'
          };

          if (credentials.email === testUser.email) {
            const isPasswordValid = await bcrypt.compare(credentials.password, testUser.password);
            if (isPasswordValid) {
              return {
                id: testUser.id,
                email: testUser.email,
                name: testUser.name,
              };
            }
          }

          return null;
        } catch (error) {
          console.error('Error in credentials authorize:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      console.log("=== SESSION CALLBACK ===");
      console.log("Session:", JSON.stringify(session, null, 2));
      console.log("Token:", JSON.stringify(token, null, 2));
      console.log("=======================");
      
      if (token.accessToken && typeof token.accessToken === 'string') {
        (session as { accessToken?: string }).accessToken = token.accessToken;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("=== SIGN IN CALLBACK ===");
      console.log("User:", JSON.stringify(user, null, 2));
      console.log("Account:", JSON.stringify(account, null, 2));
      console.log("Profile:", JSON.stringify(profile, null, 2));
      console.log("==========================");

      // Custom logic to handle user creation/update in your database
      if (account?.provider === "google") {
        try {
          const userEmail = user.email;
          if (!userEmail) {
            console.error('No email provided by Google');
            return false;
          }

          // Buscar si el usuario ya existe
          const existingUser = await findUserByEmail(userEmail);
          
          if (existingUser) {
            // Usuario existe, actualizar información si es necesario
            console.log('Usuario existente encontrado:', existingUser.email);
            await updateUser(userEmail, {
              name: user.name || existingUser.name,
              image_url: user.image || existingUser.image_url
            });
          } else {
            // Crear nuevo usuario
            console.log('Creando nuevo usuario de Google:', userEmail);
            const newUser = await createUser({
              email: userEmail,
              name: user.name || undefined,
              image_url: user.image || undefined,
              provider: 'google'
            });
            
            if (!newUser) {
              console.error('Error al crear usuario en la base de datos');
              return false;
            }
            
            console.log('Usuario creado exitosamente:', newUser.email);
          }
          
          return true;
        } catch (error) {
          console.error('Error en signIn callback:', error);
          return false;
        }
      }

      // Para credenciales normales, permitir el login
      return true;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
