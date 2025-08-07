import React, { useState, useEffect } from 'react';
import { supabase, supabaseHelpers } from '~/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UserData {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export function SupabaseExample() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Verificar usuário logado ao carregar componente
  useEffect(() => {
    checkUser();
    
    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUsers();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabaseHelpers.auth.getUser();
    setUser(user);
    if (user) {
      fetchUsers();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabaseHelpers.auth.signUp(email, password);
      
      if (error) {
        alert(`Erro no cadastro: ${error.message}`);
      } else {
        alert('Cadastro realizado! Verifique seu email.');
        setEmail('');
        setPassword('');
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

    try {
      const { data, error } = await supabaseHelpers.auth.signIn(email, password);
      
      if (error) {
        alert(`Erro no login: ${error.message}`);
      } else {
        alert('Login realizado com sucesso!');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Erro:', error);
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
        setUsers([]);
        alert('Logout realizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro inesperado no logout');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabaseHelpers.db.select('users');
      
      if (error) {
        console.error('Erro ao buscar usuários:', error);
      } else {
        // Verificar se data é um array válido antes de definir
        if (Array.isArray(data)) {
          setUsers(data as unknown as UserData[]);
        } else {
          setUsers([]);
        }
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    
    try {
      const { data, error } = await supabaseHelpers.db.insert('users', {
        name: name.trim(),
        email: user?.email || 'sem-email@exemplo.com'
      });
      
      if (error) {
        alert(`Erro ao adicionar usuário: ${error.message}`);
      } else {
        setName('');
        fetchUsers(); // Recarregar lista
        alert('Usuário adicionado com sucesso!');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro inesperado ao adicionar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          🔐 Autenticação Supabase
        </h2>
        
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳' : '🔑'} Entrar
            </button>
            
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳' : '📝'} Cadastrar
            </button>
          </div>
        </form>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>💡 Dica:</strong> Configure suas credenciais do Supabase no arquivo <code>.env</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          👋 Olá, {user.email}!
        </h2>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? '⏳' : '🚪'} Sair
        </button>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          ➕ Adicionar Usuário
        </h3>
        
        <form onSubmit={addUser} className="flex space-x-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do usuário"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳' : '➕'} Adicionar
          </button>
        </form>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            👥 Usuários ({users.length})
          </h3>
          <button
            onClick={fetchUsers}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            🔄 Atualizar
          </button>
        </div>
        
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>📭 Nenhum usuário encontrado</p>
            <p className="text-sm mt-2">Adicione o primeiro usuário acima!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((userData) => (
              <div
                key={userData.id}
                className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {userData.name || 'Sem nome'}
                    </h4>
                    <p className="text-sm text-gray-600">{userData.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(userData.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-800">
          <strong>✅ Conectado ao Supabase!</strong> Este é um exemplo de integração completa.
        </p>
      </div>
    </div>
  );
}

export default SupabaseExample;