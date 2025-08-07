import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';
import { supabase, supabaseHelpers } from '~/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export function AuthComponent() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Verificar usuário logado ao carregar componente
  useEffect(() => {
    checkUser();
    
    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          setUser(session.user);
          // Redirecionar para dashboard após login apenas se não estivermos já lá
          if (window.location.pathname !== '/dashboard-final') {
            console.log('Redirecionando para dashboard-final...');
            navigate('/dashboard-final');
          }
        } else {
          setUser(null);
        }
        // Só definir initialLoading como false após a primeira verificação
        setInitialLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabaseHelpers.auth.getUser();
      if (error) {
        console.log('Erro ao verificar usuário:', error.message);
        setUser(null);
      } else if (user) {
        console.log('Usuário encontrado:', user.email);
        setUser(user);
        if (window.location.pathname !== '/dashboard-final') {
          navigate('/dashboard-final');
        }
      } else {
        console.log('Nenhum usuário logado');
        setUser(null);
      }
    } catch (error) {
      console.error('Erro inesperado ao verificar usuário:', error);
      setUser(null);
    }
    setInitialLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    
    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabaseHelpers.auth.signUp(email, password);
      
      if (error) {
        alert(`Erro no cadastro: ${error.message}`);
      } else {
        // Criar perfil do usuário
        if (data.user) {
          await supabaseHelpers.db.insert('user_profiles', {
            id: data.user.id,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        resetForm();
        // O redirecionamento será feito automaticamente pelo onAuthStateChange
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro inesperado no cadastro');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabaseHelpers.auth.signIn(email, password);

      if (error) {
        setError(error.message);
        return;
      }

      console.log('Login successful, user:', data.user);
      resetForm();
      // O redirecionamento será feito automaticamente pelo onAuthStateChange
      // Fallback para garantir redirecionamento
      if (data.user) {
        try {
          navigate('/dashboard-final');
        } catch (navError) {
          console.error('Erro no navigate, usando window.location:', navError);
          window.location.href = '/dashboard-final';
        }
      }
    } catch (err) {
      setError('Erro inesperado durante o login');
      console.error('Login error:', err);
      alert('Erro inesperado no login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabaseHelpers.auth.signOut();
      
      if (error) {
        alert(`Erro no logout: ${error.message}`);
      } else {
        resetForm();
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro inesperado no logout');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading durante verificação inicial
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          Verificando autenticação...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Form */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
             <div className="mx-auto w-20 h-20 mb-6">
               <svg className="w-full h-full" viewBox="0 0 1024 1024" fill="none">
                 <g transform="translate(0,1024) scale(0.1,-0.1)" fill="#7C3AED">
                   <path d="M4733 7395 c-131 -29 -238 -116 -301 -244 -36 -73 -37 -77 -37 -190 0 -129 13 -179 69 -263 17 -26 326 -343 686 -705 500 -502 662 -671 685 -713 26 -48 30 -65 29 -130 -1 -134 29 -99 -712 -845 -456 -459 -677 -689 -699 -726 -78 -132 -83 -312 -12 -451 30 -58 119 -150 177 -181 135 -73 299 -74 432 -1 62 34 1886 1859 1923 1924 49 88 69 167 69 275 1 76 -4 115 -21 162 -49 144 -38 132 -990 1086 -493 494 -917 914 -943 933 -94 70 -234 97 -355 69z"/>
                 </g>
               </svg>
             </div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo à Lanzza</h1>
             <p className="text-gray-600">Acesse sua conta e continue transformando ideias em realidade</p>
           </div>

          {/* Formulário de Email/Senha */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço de Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Digite seu endereço de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              />
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
            </form>

          <div className="mt-8 text-center">
            <span className="text-sm text-gray-600">
              Novo em nossa plataforma? <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  resetForm();
                }}
                className="text-purple-600 hover:text-purple-700 font-medium underline transition-colors duration-200"
              >
                Criar uma conta
              </button>
            </span>
          </div>
        </div>
      </div>
      
      {/* Right side - Lanzza Design */}
        <div className="w-1/2 bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800 flex items-center justify-center relative overflow-hidden">
          <div className="text-center text-white z-10">
            <div className="mb-8">
              <svg className="w-40 h-40 mx-auto mb-6" viewBox="0 0 1024 1024" fill="none">
                <g transform="translate(0,1024) scale(0.1,-0.1)" fill="white">
                  <path d="M4733 7395 c-131 -29 -238 -116 -301 -244 -36 -73 -37 -77 -37 -190 0 -129 13 -179 69 -263 17 -26 326 -343 686 -705 500 -502 662 -671 685 -713 26 -48 30 -65 29 -130 -1 -134 29 -99 -712 -845 -456 -459 -677 -689 -699 -726 -78 -132 -83 -312 -12 -451 30 -58 119 -150 177 -181 135 -73 299 -74 432 -1 62 34 1886 1859 1923 1924 49 88 69 167 69 275 1 76 -4 115 -21 162 -49 144 -38 132 -990 1086 -493 494 -917 914 -943 933 -94 70 -234 97 -355 69z"/>
                </g>
              </svg>
            </div>
            <h2 className="text-5xl font-bold mb-4 tracking-wide">LANZZA</h2>
            <p className="text-xl opacity-90 font-light">Transformando ideias em realidade</p>
            <div className="mt-8 flex justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full opacity-60"></div>
              <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-white bg-opacity-5 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute top-1/3 right-10 w-16 h-16 bg-white bg-opacity-5 rounded-full"></div>
          <div className="absolute bottom-1/3 left-20 w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white bg-opacity-5 rounded-full -z-10"></div>
        </div>
    </div>
    );
  }

  // Se usuário está logado, redirecionar para dashboard-final
  // O redirecionamento já é feito no useEffect, mas vamos garantir que não renderize nada
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Redirecionando para o dashboard...</div>
    </div>
  );
}

export default AuthComponent;