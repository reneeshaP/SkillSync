import { useState } from 'react';
import PropTypes from 'prop-types';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import TagInput from '../TagInput';
import { SKILLS_SUGGESTIONS } from '../../constants/skills';

const CHECKS = [
  { key: 'bio', label: 'Bio', test: (u) => !!u.bio },
  { key: 'experience', label: 'Experience', test: (u) => !!u.experience },
  { key: 'skills', label: 'Skills', test: (u) => Array.isArray(u.skills) && u.skills.length > 0 },
  { key: 'github', label: 'GitHub', test: (u) => !!u.socialLinks?.github },
  { key: 'linkedin', label: 'LinkedIn', test: (u) => !!u.socialLinks?.linkedin },
  { key: 'location', label: 'Location', test: (u) => !!u.location },
];

function getCompleteness(user) {
  const missing = CHECKS.filter((check) => !check.test(user)).map((check) => check.label);
  const percent = Math.round(((CHECKS.length - missing.length) / CHECKS.length) * 100);
  return { percent, missing };
}

function CompletenessRing({ percent }) {
  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className="fill-none stroke-surface-overlay" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="fill-none stroke-brand transition-[stroke-dashoffset] duration-300"
        />
      </svg>
      <span className="absolute text-caption font-semibold text-text">{percent}%</span>
    </div>
  );
}

CompletenessRing.propTypes = { percent: PropTypes.number.isRequired };

export default function ProfileAbout({
  user,
  formData,
  isEditing,
  onToggleEdit,
  onChange,
  onSocialLinkChange,
  onSkillsChange,
  onSubmit,
  onCancel,
  isDirty,
}) {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { percent, missing } = getCompleteness(user);

  const handleCancelClick = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onCancel();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile Details</h1>
        {!isEditing && (
          <Button variant="primary" onClick={onToggleEdit}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="mb-6 flex items-center gap-4">
        <CompletenessRing percent={percent} />
        <div>
          <p className="text-sm text-gray-300 font-medium">Profile completeness</p>
          {missing.length > 0 ? (
            <p className="text-sm text-gray-500">Missing: {missing.join(', ')}</p>
          ) : (
            <p className="text-sm text-gray-500">Your profile is complete!</p>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={onSubmit} className="space-y-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Username" htmlFor="username">
              <Input id="username" name="username" value={formData.username} onChange={onChange} />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <Input id="email" type="email" name="email" value={formData.email} onChange={onChange} />
            </FormField>
            <FormField label="Location" htmlFor="location">
              <Input id="location" name="location" value={formData.location} onChange={onChange} />
            </FormField>
            <FormField label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" value={formData.phone} onChange={onChange} />
            </FormField>
          </div>

          <FormField label="Address" htmlFor="address">
            <Input id="address" name="address" value={formData.address} onChange={onChange} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Experience" htmlFor="experience">
              <Input id="experience" name="experience" value={formData.experience} onChange={onChange} />
            </FormField>
            <FormField label="Skills" htmlFor="skills">
              <TagInput
                value={formData.skills}
                onChange={onSkillsChange}
                placeholder="Type a skill and press Enter"
                suggestions={SKILLS_SUGGESTIONS}
              />
            </FormField>
          </div>

          <FormField label="Bio" htmlFor="bio">
            <Textarea id="bio" name="bio" value={formData.bio} onChange={onChange} rows={3} />
          </FormField>

          <div className="space-y-4 border-t border-gray-700 pt-4">
            <h3 className="font-medium text-gray-300">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="GitHub" htmlFor="github">
                <div className="flex items-center bg-surface-raised rounded-md border border-border px-3 focus-within:ring-2 focus-within:ring-ring">
                  <FiGithub className="text-text-subtle shrink-0" size={16} />
                  <input
                    id="github"
                    type="url"
                    value={formData.socialLinks.github}
                    onChange={(e) => onSocialLinkChange('github', e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-transparent py-2 px-2 text-text outline-none placeholder-text-subtle"
                  />
                </div>
              </FormField>
              <FormField label="LinkedIn" htmlFor="linkedin">
                <div className="flex items-center bg-surface-raised rounded-md border border-border px-3 focus-within:ring-2 focus-within:ring-ring">
                  <FiLinkedin className="text-text-subtle shrink-0" size={16} />
                  <input
                    id="linkedin"
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => onSocialLinkChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full bg-transparent py-2 px-2 text-text outline-none placeholder-text-subtle"
                  />
                </div>
              </FormField>
              <FormField label="Twitter" htmlFor="twitter">
                <div className="flex items-center bg-surface-raised rounded-md border border-border px-3 focus-within:ring-2 focus-within:ring-ring">
                  <FiTwitter className="text-text-subtle shrink-0" size={16} />
                  <input
                    id="twitter"
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => onSocialLinkChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/username"
                    className="w-full bg-transparent py-2 px-2 text-text outline-none placeholder-text-subtle"
                  />
                </div>
              </FormField>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-between gap-3 border-t border-gray-700 bg-[#1a1c23] px-6 py-4">
            {showDiscardConfirm ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-300">Discard your changes?</span>
                <Button type="button" variant="danger" size="sm" onClick={onCancel}>
                  Discard
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowDiscardConfirm(false)}>
                  Keep editing
                </Button>
              </div>
            ) : (
              <>
                {isDirty ? (
                  <span className="text-sm text-amber-400">Unsaved changes</span>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={handleCancelClick}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg text-gray-200">Location</h3>
            <p className="text-sm text-gray-400">{user.location || "Not specified"}</p>
            <p className="text-sm text-gray-400">{user.address || "No address provided"}</p>
            <p className="text-sm text-gray-400">{user.phone || "No phone provided"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-200">Bio</h3>
            <p className="text-sm text-gray-400 mt-1">{user.bio || "Not specified"}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-200">
              {user.role === "mentee" ? "Skills I Want to Learn" : "Skills I Offer"}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {(user.skills || []).map((skill, i) => (
                <Badge key={i} variant="brand">{skill}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-200">Experience</h3>
            <p className="text-sm text-gray-400 mt-1">
              {user.experience || "Not specified"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

ProfileAbout.propTypes = {
  user: PropTypes.object.isRequired,
  formData: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onToggleEdit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSocialLinkChange: PropTypes.func.isRequired,
  onSkillsChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isDirty: PropTypes.bool.isRequired,
};
