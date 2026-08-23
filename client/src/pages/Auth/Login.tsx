import React, { useState } from 'react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // 🔌 Login logic here
      console.log('Login:', { email, password });
      // Example: await api.login({ email, password });
    } else {
      // 🔌 Register logic here
      console.log('Register:', { name, email, password });
      // Example: await api.register({ name, email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 transition-all hover:shadow-2xl">
        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-slate-500 text-sm mt-1 mb-6 pl-3 border-l-2 border-blue-500 bg-blue-50/30 rounded-r-md py-1">
          {isLogin ? 'Sign in to your account' : 'Start your journey with us'}
        </p>

        {/* Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              isLogin
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              !isLogin
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Extra */}
        <p className="text-xs text-slate-400 text-center mt-6">
          {isLogin ? 'No account?' : 'Already have an account?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline font-medium"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;