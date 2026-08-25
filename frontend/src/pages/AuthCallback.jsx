import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, fetchUser } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      fetchUser().then(() => {
        navigate('/');
      }).catch((err) => {
        console.error('Failed to fetch user:', err);
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setToken, fetchUser]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      <p className="text-zinc-500 dark:text-zinc-400">Authenticating...</p>
    </div>
  );
}
