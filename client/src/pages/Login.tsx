import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Building2, Mail, Lock, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
    const navigate = useNavigate();
    const { login, register } = useAuth();

    // Login form state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoginLoading, setIsLoginLoading] = useState(false);

    // Register form state
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoginLoading(true);


        try {
            await login(loginEmail, loginPassword);
            const raw = localStorage.getItem('auth_user');
            const role = raw ? JSON.parse(raw).role : 'client';
            navigate(role === 'admin' ? '/admin' : '/client', { replace: true });
            toast.success('Successfully logged in!');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
        } finally {
            setIsLoginLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegisterLoading(true);

        try {
            await register({
                email: registerEmail,
                password: registerPassword,
                firstName,
                lastName,
                phoneNumber
            });
            const raw = localStorage.getItem('auth_user');
            const role = raw ? JSON.parse(raw).role : 'client';
            navigate(role === 'admin' ? '/admin' : '/client', { replace: true });
            toast.success('Account created successfully!');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
        } finally {
            setIsRegisterLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F97316]/10 via-background to-[#3B82F6]/10 p-4">
            <Card className="w-full max-w-md p-8 shadow-2xl">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-16 bg-gradient-to-br from-[#F97316] to-[#F97316]/80 rounded-xl mb-4">
                        <Building2 className="size-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">ZEM-DIM</h1>
                    <p className="text-muted-foreground">Construction Project Management</p>
                </div>

                {/* Login/Register Tabs */}
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="login">Sign In</TabsTrigger>
                        <TabsTrigger value="register">Sign Up</TabsTrigger>
                    </TabsList>

                    {/* Login Form */}
                    <TabsContent value="login">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#F97316] hover:bg-[#F97316]/90"
                                disabled={isLoginLoading}
                            >
                                {isLoginLoading ? 'Signing in...' : 'Sign In'}
                            </Button>

                            {/* Demo Credentials Hint */}
                            <div className="mt-4 p-3 bg-muted rounded-lg text-center">
                                <p className="text-muted-foreground">Demo credentials:</p>
                                <p className="text-muted-foreground">
                                    <strong>Admin:</strong> admin@admin.com / Password123!
                                </p>
                                <p className="text-muted-foreground">
                                    <strong>Client:</strong> user@user.com / Password123!
                                </p>
                            </div>
                        </form>
                    </TabsContent>

                    {/* Register Form */}
                    <TabsContent value="register">
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first-name">First Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            id="first-name"
                                            placeholder="John"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last-name">Last Name</Label>
                                    <Input
                                        id="last-name"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={registerEmail}
                                        onChange={(e) => setRegisterEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone (Optional)</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+380XXXXXXXXX"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="register-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={registerPassword}
                                        onChange={(e) => setRegisterPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <p className="text-muted-foreground">Minimum 6 characters</p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90"
                                disabled={isRegisterLoading}
                            >
                                {isRegisterLoading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}