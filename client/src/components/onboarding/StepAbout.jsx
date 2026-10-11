import PropTypes from 'prop-types';
import { FormField } from '../ui/FormField';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';

export default function StepAbout({ isMentor, bio, onBioChange, experience, onExperienceChange, bioError }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h3 font-display font-bold text-text mb-2">
          {isMentor ? 'What can you mentor others on?' : "What are you hoping to learn?"}
        </h2>
        <p className="text-text-muted">A couple of sentences is plenty.</p>
      </div>

      <FormField label="Bio" htmlFor="bio" required error={bioError}>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          rows={4}
          placeholder="A couple of sentences about you"
          aria-describedby={bioError ? 'bio-error' : undefined}
        />
      </FormField>

      <FormField label="Experience" htmlFor="experience" hint="Optional">
        <Input
          id="experience"
          value={experience}
          onChange={(e) => onExperienceChange(e.target.value)}
          placeholder="e.g. 3 years as a frontend developer"
        />
      </FormField>
    </div>
  );
}

StepAbout.propTypes = {
  isMentor: PropTypes.bool,
  bio: PropTypes.string.isRequired,
  onBioChange: PropTypes.func.isRequired,
  experience: PropTypes.string.isRequired,
  onExperienceChange: PropTypes.func.isRequired,
  bioError: PropTypes.string,
};
