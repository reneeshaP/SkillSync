import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Camera, FileText } from 'lucide-react';
import { FiGithub, FiLinkedin, FiTwitter, FiLink } from 'react-icons/fi';
import { Avatar } from '../ui/Avatar';
import StarRating from '../StarRating';
import { getAvatarUrl } from '../../lib/avatar';
import { cn } from '../../lib/utils';

export default function ProfileHeader({ user, onAvatarUpload, onResumeUpload }) {
  const [avatarDragging, setAvatarDragging] = useState(false);
  const [resumeDragging, setResumeDragging] = useState(false);
  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    setAvatarDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onAvatarUpload(file);
  };

  const handleResumeDrop = (e) => {
    e.preventDefault();
    setResumeDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onResumeUpload(file);
  };

  return (
    <div className="w-full md:w-1/3 bg-[#1a1c23] rounded-xl p-6 shadow-lg text-center">
      <div
        className={cn(
          'relative w-fit mx-auto rounded-full group',
          avatarDragging && 'ring-2 ring-brand ring-offset-2 ring-offset-[#1a1c23]'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setAvatarDragging(true);
        }}
        onDragLeave={() => setAvatarDragging(false)}
        onDrop={handleAvatarDrop}
      >
        <Avatar
          src={user.avatar}
          name={user.username}
          userId={user._id}
          size="xl"
          className="border-4 border-purple-600 rounded-full"
        />
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          aria-label="Change profile photo"
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/50 text-transparent group-hover:text-white transition-colors"
        >
          <Camera size={22} />
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onAvatarUpload(file);
          }}
        />
      </div>
      <h2 className="mt-4 text-xl font-bold">
        {user.username}
      </h2>
      <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs bg-purple-600/20 text-purple-400 font-medium">
        {user.role === 'mentor' ? 'I am a Mentor' : 'I am a Mentee'}
      </span>
      {user.role === 'mentor' && user.reviewCount > 0 && (
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <StarRating rating={user.averageRating} readOnly size={14} />
          <span className="text-sm text-gray-400">{user.averageRating.toFixed(1)} ({user.reviewCount})</span>
        </div>
      )}
      <p className="text-sm text-gray-400">{user.email}</p>

      {/* Social Links */}
      <div className="flex justify-center space-x-4 mt-4">
        {user.socialLinks?.github && (
          <a
            href={user.socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            <FiGithub size={20} />
          </a>
        )}
        {user.socialLinks?.linkedin && (
          <a
            href={user.socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            <FiLinkedin size={20} />
          </a>
        )}
        {user.socialLinks?.twitter && (
          <a
            href={user.socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition"
          >
            <FiTwitter size={20} />
          </a>
        )}
      </div>

      {/* Resume */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Resume</h3>
        {user.resume?.url && (
          <a
            href={getAvatarUrl(user.resume.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-2"
          >
            <FiLink size={14} />
            View Resume
          </a>
        )}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setResumeDragging(true);
          }}
          onDragLeave={() => setResumeDragging(false)}
          onDrop={handleResumeDrop}
          onClick={() => resumeInputRef.current?.click()}
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 px-3 py-2.5 text-sm cursor-pointer transition-colors hover:bg-[#282c3a]',
            resumeDragging && 'border-brand bg-brand-subtle/20'
          )}
        >
          <FileText size={16} className="text-gray-400" />
          {user.resume?.url ? 'Replace Resume (PDF)' : 'Upload Resume (PDF)'}
          <input
            ref={resumeInputRef}
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onResumeUpload(file);
            }}
          />
        </div>
      </div>
    </div>
  );
}

ProfileHeader.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string,
    avatar: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    socialLinks: PropTypes.object,
    resume: PropTypes.object,
  }).isRequired,
  onAvatarUpload: PropTypes.func.isRequired,
  onResumeUpload: PropTypes.func.isRequired,
};
