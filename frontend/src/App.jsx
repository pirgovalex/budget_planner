import { Router, Route, Navigate } from '@solidjs/router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Insights from './pages/Insights';

function ProtectedRoute(props) {
    const auth = useAuth();

    return (
        <>
            {auth.loading() ? (
                <div class="min-h-screen flex items-center justify-center">
                    <div class="text-xl text-gray-600">Loading...</div>
                </div>
            ) : auth.isAuthenticated() ? (
                props.children
            ) : (
                <Navigate href="/login" />
            )}
        </>
    );
}

function App() {
    return (
        <Router root={(props) => (
            <AuthProvider>
                {props.children}
            </AuthProvider>
        )}>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/" component={() => (
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            )} />
            <Route path="/transactions" component={() => (
                <ProtectedRoute>
                    <Transactions />
                </ProtectedRoute>
            )} />
            <Route path="/goals" component={() => (
                <ProtectedRoute>
                    <Goals />
                </ProtectedRoute>
            )} />
            <Route path="/insights" component={() => (
                <ProtectedRoute>
                    <Insights />
                </ProtectedRoute>
            )} />
        </Router>
    );
}

export default App;
