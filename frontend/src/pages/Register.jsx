import { createSignal } from 'solid-js';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card, Label } from '../components/UI';
import { A } from '@solidjs/router';

export default function Register() {
    const auth = useAuth();
    const [username, setUsername] = createSignal('');
    const [email, setEmail] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [confirmPassword, setConfirmPassword] = createSignal('');
    const [error, setError] = createSignal('');
    const [loading, setLoading] = createSignal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password() !== confirmPassword()) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await auth.register(username(), email(), password());
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
            <Card class="max-w-md w-full">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p class="text-gray-600">Start managing your finances</p>
                </div>

                <form onSubmit={handleSubmit} class="space-y-6">
                    {error() && (
                        <div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error()}
                        </div>
                    )}

                    <div>
                        <Label>Username</Label>
                        <Input
                            type="text"
                            placeholder="Choose a username"
                            value={username()}
                            onInput={setUsername}
                            required
                        />
                    </div>

                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            placeholder="your@email.com"
                            value={email()}
                            onInput={setEmail}
                            required
                        />
                    </div>

                    <div>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            placeholder="Choose a password"
                            value={password()}
                            onInput={setPassword}
                            required
                        />
                    </div>

                    <div>
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword()}
                            onInput={setConfirmPassword}
                            required
                        />
                    </div>

                    <Button type="submit" class="w-full" disabled={loading()}>
                        {loading() ? 'Creating Account...' : 'Register'}
                    </Button>
                </form>

                <p class="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <A href="/login" class="text-primary-600 hover:text-primary-500 font-medium">
                        Login
                    </A>
                </p>
            </Card>
        </div>
    );
}
