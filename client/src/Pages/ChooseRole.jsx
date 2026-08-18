import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiUsers } from 'react-icons/fi';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';

export default function ChooseRole() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChoose = async (role) => {
    setSubmitting(true);
    setError('');
    try {
      const updatedUser = await authService.confirmRole(role);
      setUser((prev) => ({ ...prev, ...updatedUser }));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to set role');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome{user?.username ? `, ${user.username}` : ''}!</h1>
        <p className="text-gray-400 mb-8">One last thing — how do you want to use SkillSync?</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleChoose('mentee')}
            disabled={submitting}
            className="bg-[#1a1c23] hover:bg-[#20222b] disabled:opacity-50 rounded-xl p-6 transition-colors"
          >
            <FiUser className="mx-auto mb-3 text-purple-500" size={28} />
            <h3 className="font-semibold">I'm a Mentee</h3>
            <p className="text-sm text-gray-400 mt-1">I want to learn from mentors</p>
          </button>

          <button
            onClick={() => handleChoose('mentor')}
            disabled={submitting}
            className="bg-[#1a1c23] hover:bg-[#20222b] disabled:opacity-50 rounded-xl p-6 transition-colors"
          >
            <FiUsers className="mx-auto mb-3 text-purple-500" size={28} />
            <h3 className="font-semibold">I'm a Mentor</h3>
            <p className="text-sm text-gray-400 mt-1">I want to help others grow</p>
          </button>
        </div>
      </div>
    </div>
  );
}
