import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { http } from '../lib/apiV2';
import { useAuth } from '../contexts/useAuth';

export function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const response = await http.auth.resetPassword({ password });
            if (!response.status) {
                toast.error(response.message ?? 'Error resetting password. Please try again.');
                return;
            }

            const result = await login(user?.email!, password);

            if (result.mustChangePassword) {
                toast.error('Unexpected issue: account still requires password change.');
                navigate('/reset-password');
                return;
            }

            toast.success('Password changed successfully!');
            navigate(result.role === 'admin' ? '/admin' : '/client', { replace: true });

        } catch (err) {
            console.error(err);
            toast.error('Something went wrong while resetting password.');

        } finally {
            localStorage.removeItem('temp_auth_jwt');
            localStorage.removeItem('temp_auth_user');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
                <h1 className="text-2xl font-bold text-center">Reset Password</h1>
                <Input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                />
                <Button type="submit" className="w-full bg-[#F97316]" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                </Button>
            </form>
        </div>
    );
}