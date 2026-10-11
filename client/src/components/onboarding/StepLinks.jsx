import PropTypes from 'prop-types';
import { FiGithub, FiLinkedin } from 'react-icons/fi';
import { FormField } from '../ui/FormField';

export default function StepLinks({ github, onGithubChange, linkedin, onLinkedinChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h3 font-display font-bold text-text mb-2">Add your links</h2>
        <p className="text-text-muted">Optional, but it helps build trust.</p>
      </div>

      <FormField label="GitHub" htmlFor="github" hint="Optional">
        <div className="flex items-center bg-surface-raised rounded-md border border-border px-3 focus-within:ring-2 focus-within:ring-ring">
          <FiGithub className="text-text-subtle shrink-0" size={16} />
          <input
            type="url"
            id="github"
            value={github}
            onChange={(e) => onGithubChange(e.target.value)}
            className="w-full bg-transparent py-2 px-2 text-text outline-none placeholder-text-subtle"
            placeholder="https://github.com/username"
          />
        </div>
      </FormField>

      <FormField label="LinkedIn" htmlFor="linkedin" hint="Optional">
        <div className="flex items-center bg-surface-raised rounded-md border border-border px-3 focus-within:ring-2 focus-within:ring-ring">
          <FiLinkedin className="text-text-subtle shrink-0" size={16} />
          <input
            type="url"
            id="linkedin"
            value={linkedin}
            onChange={(e) => onLinkedinChange(e.target.value)}
            className="w-full bg-transparent py-2 px-2 text-text outline-none placeholder-text-subtle"
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </FormField>
    </div>
  );
}

StepLinks.propTypes = {
  github: PropTypes.string.isRequired,
  onGithubChange: PropTypes.func.isRequired,
  linkedin: PropTypes.string.isRequired,
  onLinkedinChange: PropTypes.func.isRequired,
};
