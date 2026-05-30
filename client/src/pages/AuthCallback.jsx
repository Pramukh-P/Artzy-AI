import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader } from '../components';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        login(token, user);
        addToast(`Welcome, ${user.name}! 🎨`, 'success');
        navigate('/', { replace: true });
      } catch {
        addToast('Login failed. Please try again.', 'error');
        navigate('/login', { replace: true });
      }
    } else {
      addToast('Login failed. Please try again.', 'error');
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Completing sign in…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
