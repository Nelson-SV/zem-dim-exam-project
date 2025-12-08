import { useState, useEffect } from 'react';
import { User, Lock, Info, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

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

const API_URL = 'http://localhost:5001';

export function ClientProfile() {
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
        throw new Error('Failed to fetch profile');
      }

      const data: ProfileData = await response.json();
      setProfile(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setEmail(data.email);
      setPhoneNumber(data.phoneNumber || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
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
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data: ProfileData = await response.json();
      setProfile(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('Please fill in all password fields');
        return;
      }

      if (newPassword.length < 8) {
        toast.error('New password must be at least 8 characters');
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
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
        throw new Error(errorData.error || 'Failed to change password');
      }

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        <span>Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-muted-foreground">Failed to load profile. Please try again.</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account information and security</p>
      </div>

      {/* Basic Information Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="size-5" />
          <h3>Basic information</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
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
                Updating...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="size-5" />
          <h3>Change password</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
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
                Changing...
              </>
            ) : (
              <>
                <Lock className="size-4 mr-2" />
                Change password
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Account Information Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="size-5" />
          <h3>Account information</h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{profile.role}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-muted-foreground">Created at</span>
            <span className="font-medium">{formatDate(profile.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="text-muted-foreground">Last login</span>
            <span className="font-medium">{formatDate(profile.lastLoginAt)}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-green-600">Active</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
