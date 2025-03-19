import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { validateEmail, validatePassword } from '../utils/security';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const { error: showError, success, info } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState('');

  // Estado para el formulario de login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // Estado para el formulario de registro
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });

  const handleChange = (e) => {
    setErrorMessage(''); // Limpiar error al cambiar datos
    const { name, value } = e.target;

    if (isLogin) {
      setLoginForm({
        ...loginForm,
        [name]: value
      });
    } else {
      // Validaciones específicas para campos del registro
      if (name === 'name' && !value.trim() && e.type === 'blur') {
        showError('El nombre es requerido');
        return;
      }

      if (name === 'email' && value && !validateEmail(value) && e.type === 'blur') {
        showError('El formato del email no es válido');
        return;
      }

      if (name === 'birthDate' && value) {
        try {
          const inputDate = new Date(value);
          const today = new Date();
          const minDate = new Date('1900-01-01');

          if (isNaN(inputDate.getTime())) {
            showError('Fecha inválida');
            return;
          }

          if (inputDate > today) {
            showError('La fecha no puede ser posterior a hoy');
            return;
          }

          if (inputDate < minDate) {
            showError('La fecha no puede ser anterior a 1900');
            return;
          }

          // Calcular edad
          let age = today.getFullYear() - inputDate.getFullYear();
          const monthDiff = today.getMonth() - inputDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < inputDate.getDate())) {
            age--;
          }

          if (age < 13) {
            showError('Debes tener al menos 13 años para registrarte');
            return;
          }
        } catch (error) {
          showError('Error al procesar la fecha');
          return;
        }
      }

      setRegisterForm({
        ...registerForm,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validaciones del formulario de login
      if (!loginForm.email || !loginForm.password) {
        showError('Por favor, complete todos los campos');
        return;
      }

      // Validar formato de email
      if (!validateEmail(loginForm.email)) {
        showError('El formato del email no es válido');
        return;
      }

      info('Iniciando sesión...');
      const result = await login(loginForm.email, loginForm.password);
      
      if (result.success) {
        success('¡Bienvenido de nuevo!');
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        showError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      showError('Error al procesar la solicitud');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      // Validaciones del formulario de registro
      if (!validateEmail(registerForm.email)) {
        showError('El formato del email no es válido');
        return;
      }

      const passwordValidation = validatePassword(registerForm.password);
      if (!passwordValidation.isValid) {
        showError(passwordValidation.message);
        return;
      }

      if (!registerForm.name.trim()) {
        showError('El nombre es requerido');
        return;
      }

      // Validación de fecha de nacimiento
      if (!registerForm.birthDate) {
        showError('La fecha de nacimiento es requerida');
        return;
      }

      const birthDate = new Date(registerForm.birthDate);
      const today = new Date();
      const minDate = new Date('1900-01-01');

      if (birthDate > today) {
        showError('La fecha de nacimiento no puede ser posterior a hoy');
        return;
      }

      if (birthDate < minDate) {
        showError('La fecha de nacimiento no puede ser anterior a 1900');
        return;
      }

      // Calcular edad
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 13) {
        showError('Debes tener al menos 13 años para registrarte');
        return;
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
      }

      // Verificar que todos los campos requeridos estén completos
      const requiredFields = {
        name: 'nombre',
        email: 'email',
        password: 'contraseña',
        confirmPassword: 'confirmación de contraseña',
        birthDate: 'fecha de nacimiento'
      };

      for (const [field, fieldName] of Object.entries(requiredFields)) {
        if (!registerForm[field]) {
          showError(`El campo ${fieldName} es requerido`);
          return;
        }
      }

      info('Creando cuenta...');
      console.log('Datos del formulario:', { ...registerForm, password: '[PROTECTED]' });

      const { confirmPassword, ...newUser } = registerForm;
      const result = await register(newUser);
      console.log('Resultado del registro:', { ...result, user: result.user ? '[PROTECTED]' : null });

      if (result.success) {
        success('¡Cuenta creada correctamente!');
        
        // Iniciar sesión automáticamente
        info('Iniciando sesión...');
        const loginResult = await login(registerForm.email, registerForm.password);
        
        if (loginResult.success) {
          success('¡Bienvenido a Tech Store!');
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        } else {
          // Si falla el login automático, redirigir a la página de login
          info('Por favor, inicia sesión con tu nueva cuenta');
          setIsLogin(true);
        }
      } else {
        const errorMessage = result.error || result.message || 'Error al crear la cuenta';
        console.error('Error en el registro:', errorMessage);
        showError(errorMessage);
      }
    } catch (err) {
      console.error('Error detallado:', err);
      showError(err.message || 'Error al procesar la solicitud');
    }
  };

  const handleDemoLogin = async () => {
    setIsLogin(true); // Asegurarse de que estamos en modo login
    setLoginForm({
      email: 'admin@techstore.com',
      password: 'admin123'
    });
    
    try {
      const result = await login('admin@techstore.com', 'admin123');
      if (result.success) {
        navigate('/');
      } else {
        showError(result.error);
      }
    } catch (error) {
      showError('Error al intentar iniciar sesión con credenciales demo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24 sm:pt-32">
      {/* Demo Credentials Banner */}
      <div className="fixed top-0 left-0 right-0 bg-blue-50 p-4 border-b border-blue-100 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-2 text-blue-800">
            <InformationCircleIcon className="h-6 w-6 flex-shrink-0" />
            <span className="font-medium">Credenciales de demostración</span>
          </div>
          <div className="text-blue-600 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div>
              <span className="font-medium">Email:</span> admin@techstore.com
            </div>
            <div>
              <span className="font-medium">Contraseña:</span> admin123
            </div>
            <button
              onClick={handleDemoLogin}
              className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors duration-200"
            >
              Iniciar sesión como admin
            </button>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Mostrar error solo si hay un mensaje */}
          {errorMessage && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {errorMessage}
            </div>
          )}

          <form onSubmit={isLogin ? handleSubmit : handleRegister} className="space-y-6" noValidate>
            {isLogin ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre Completo
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={handleChange}
                      onBlur={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={handleChange}
                      onBlur={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      required
                      value={registerForm.birthDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      min="1900-01-01"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm date-input"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg 
                        className="h-5 w-5 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                    </div>
                    <style>
                      {`
                        .date-input::-webkit-calendar-picker-indicator {
                          background: transparent;
                          bottom: 0;
                          color: transparent;
                          cursor: pointer;
                          height: auto;
                          left: auto;
                          position: absolute;
                          right: 0;
                          top: 0;
                          width: 2.5rem;
                        }
                        .date-input {
                          color-scheme: light;
                        }
                      `}
                    </style>
                  </div>
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      id="register-password"
                      name="password"
                      type="password"
                      required
                      value={registerForm.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar Contraseña
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={registerForm.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage('');
                if (!isLogin) {
                  setLoginForm({
                    email: '',
                    password: ''
                  });
                } else {
                  setRegisterForm({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    birthDate: ''
                  });
                }
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
