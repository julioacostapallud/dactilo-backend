export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎯 Dactilo Backend API
          </h1>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong>✅ API Funcionando</strong>
            <p className="text-sm mt-1">El servidor está operativo</p>
          </div>
          <div className="text-left space-y-2 text-sm text-gray-600">
            <p><strong>Endpoints disponibles:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-gray-100 px-1 rounded">POST /api/auth/register</code></li>
              <li><code className="bg-gray-100 px-1 rounded">POST /api/auth/login</code></li>
              <li><code className="bg-gray-100 px-1 rounded">GET /api/ejercicios</code></li>
              <li><code className="bg-gray-100 px-1 rounded">POST /api/resultados</code></li>
              <li><code className="bg-gray-100 px-1 rounded">GET /api/db/structure</code></li>
              <li><code className="bg-gray-100 px-1 rounded">POST /api/db/execute</code></li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Versión 1.0.0 - Desarrollado para la aplicación de dactilografía
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
