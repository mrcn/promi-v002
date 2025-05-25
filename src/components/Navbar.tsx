import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { showSuccess } from '@/utils/toast';

const Navbar: React.FC = () => {
  const user = useUser();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess('Successfully logged out');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow mb-8">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-2xl font-bold text-primary">
          Post Transformer
        </Link>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 text-sm">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;