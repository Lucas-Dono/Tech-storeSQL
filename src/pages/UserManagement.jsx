import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { authService } from '../services/authService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, ROLES } = useAuth();
  const { error: showError, success } = useAlert();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await authService.getAllUsers(token);
      setUsers(response);
    } catch (err) {
      showError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await authService.updateUserRole(userId, newRole, token);
      success('Rol actualizado correctamente');
      loadUsers();
    } catch (err) {
      showError('Error al actualizar el rol');
      console.error(err);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await authService.toggleUserActive(userId, !currentStatus, token);
      success(currentStatus ? 'Usuario desactivado' : 'Usuario activado');
      loadUsers();
    } catch (err) {
      showError('Error al cambiar el estado del usuario');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {currentUser._id !== user._id ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={user.role === ROLES.SUPERADMIN}
                    >
                      <option value={ROLES.USER}>Usuario</option>
                      <option value={ROLES.ADMIN}>Administrador</option>
                    </select>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {currentUser._id !== user._id && user.role !== ROLES.SUPERADMIN && (
                    <button
                      onClick={() => handleToggleActive(user._id, user.isActive)}
                      className={`text-sm ${
                        user.isActive 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {user.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement; 