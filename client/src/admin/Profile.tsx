import { useState, useEffect } from 'react';
import { User, Lock, Info, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  role: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface UpdateProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function Profile() {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const getAuthHeaders = () => {
    const jwt = localStorage.getItem('auth_jwt');
    return {
      'Content-Type': 'application/json',
      'Authorization': jwt ? `Bearer ${jwt}` : '',
    };
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(t('errors.failedToLoadProfile'));
      }

      const data: ProfileData = await response.json();
      setProfile(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('errors.failedToLoadProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);

      const updateDto: UpdateProfileDto = {
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || undefined,
      };

      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateDto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('errors.failedToUpdate'));
      }

      const data: ProfileData = await response.json();
      setProfile(data);
      toast.success(t('success.profileUpdated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : t('errors.failedToUpdate'));
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error(t('errors.fillAllFields'));
        return;
      }

      if (newPassword.length < 8) {
        toast.error(t('errors.passwordTooShort'));
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error(t('errors.passwordsDoNotMatch'));
        return;
      }

      setChangingPassword(true);

      const changePasswordDto: ChangePasswordDto = {
        currentPassword,
        newPassword,
        confirmPassword,
      };

      const response = await fetch(`${API_URL}/api/profile/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(changePasswordDto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('errors.failedToUpdate'));
      }

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t('success.passwordChanged'));
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : t('errors.failedToUpdate'));
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const locale = i18n.language === 'uk' ? uk : enUS;
    return format(new Date(dateString), 'PPP', { locale });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>{t('profile.loadingProfile')}</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-muted-foreground">{t('errors.failedToLoadProfile')}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2">{t('profile.title')}</h2>
        <p className="text-muted-foreground">{t('profile.subtitle')}</p>
      </div>

      {/* Basic Information Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="size-5" />
          <h3>{t('profile.basicInfo')}</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('profile.firstName')}</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('profile.placeholders.firstName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('profile.lastName')}</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('profile.placeholders.lastName')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('profile.placeholders.email')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t('profile.phoneNumber')}</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t('profile.placeholders.phoneNumber')}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleUpdateProfile}
            disabled={updating}
            className="bg-[#F97316] hover:bg-[#F97316]/90"
          >
            {updating ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                {t('common.updating')}
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                {t('profile.saveChanges')}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="size-5" />
          <h3>{t('profile.changePassword')}</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('profile.placeholders.currentPassword')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('profile.placeholders.newPassword')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('profile.placeholders.confirmPassword')}
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="bg-[#F97316] hover:bg-[#F97316]/90"
          >
            {changingPassword ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                {t('common.updating')}
              </>
            ) : (
              <>
                <Lock className="size-4 mr-2" />
                {t('profile.changePassword')}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Account Information Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="size-5" />
          <h3>{t('profile.accountInfo')}</h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-muted-foreground">{t('profile.role')}</span>
            <span className="font-medium capitalize">{profile.role}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-muted-foreground">{t('profile.createdAt')}</span>
            <span className="font-medium">{formatDate(profile.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-muted-foreground">{t('profile.lastLogin')}</span>
            <span className="font-medium">{formatDate(profile.lastLoginAt)}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">{t('common.status')}</span>
            <span className="font-medium text-green-600">{t('common.active')}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
