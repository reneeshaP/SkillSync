import PropTypes from 'prop-types';
import TagInput from '../TagInput';
import { SKILLS_SUGGESTIONS } from '../../constants/skills';
import { FormField } from '../ui/FormField';

export default function StepSkills({ isMentor, skills, onChange, error }) {
  return (
    <div>
      <h2 className="text-h3 font-display font-bold text-text mb-2">
        {isMentor ? 'Your field of expertise' : 'Skills you want to learn'}
      </h2>
      <p className="text-text-muted mb-6">
        {isMentor
          ? 'Tell mentees what you can help them with.'
          : "Tell us what you're looking to get better at."}
      </p>
      <FormField error={error}>
        <TagInput
          value={skills}
          onChange={onChange}
          placeholder="Type a skill and press Enter"
          suggestions={SKILLS_SUGGESTIONS}
          maxCount={15}
          showHints
        />
      </FormField>
    </div>
  );
}

StepSkills.propTypes = {
  isMentor: PropTypes.bool,
  skills: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};
