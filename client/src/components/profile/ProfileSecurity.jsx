import PropTypes from 'prop-types';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export default function ProfileSecurity({ passwordData, onChange, onSubmit, passwordError, passwordSuccess }) {
  return (
    <div className="max-w-md mx-auto bg-[#282c3a] rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Change Password</h3>
      {passwordError && (
        <div className="mb-4 text-red-500 text-sm">{passwordError}</div>
      )}
      {passwordSuccess && (
        <div className="mb-4 text-green-500 text-sm">{passwordSuccess}</div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Current Password" htmlFor="currentPassword" required>
          <Input
            id="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => onChange('currentPassword', e.target.value)}
            required
          />
        </FormField>
        <FormField label="New Password" htmlFor="newPassword" required>
          <Input
            id="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => onChange('newPassword', e.target.value)}
            required
          />
        </FormField>
        <FormField label="Confirm New Password" htmlFor="confirmNewPassword" required>
          <Input
            id="confirmNewPassword"
            type="password"
            value={passwordData.confirmNewPassword}
            onChange={(e) => onChange('confirmNewPassword', e.target.value)}
            required
          />
        </FormField>
        <Button type="submit" variant="primary" className="w-full">
          Update Password
        </Button>
      </form>
    </div>
  );
}

ProfileSecurity.propTypes = {
  passwordData: PropTypes.shape({
    currentPassword: PropTypes.string,
    newPassword: PropTypes.string,
    confirmNewPassword: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  passwordError: PropTypes.string,
  passwordSuccess: PropTypes.string,
};
