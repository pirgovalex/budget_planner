import { createSignal } from 'solid-js';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card, Label } from '../components/UI';
import { A } from '@solidjs/router';

export default function Login() {
    const auth = useAuth();
    const [username, setUsername] = createSignal('');
    const [password, setPassword] = createSignal('');
    const [error, setError] = createSignal('');
    const [loading, setLoading] = createSignal(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await auth.login(username(), password());
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
            <Card class="max-w-md w-full">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">AI Budget Planner</h1>
                    <p class="text-gray-600">Login to manage your finances</p>
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
                            placeholder="Enter your username"
                            value={username()}
                            onInput={setUsername}
                            required
                        />
                    </div>

                    <div>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            value={password()}
                            onInput={setPassword}
                            required
                        />
                    </div>

                    <Button type="submit" class="w-full" disabled={loading()}>
                        {loading() ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <p class="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <A href="/register" class="text-primary-600 hover:text-primary-500 font-medium">
                        Register
                    </A>
                </p>
            </Card>
        </div>
    );
}
