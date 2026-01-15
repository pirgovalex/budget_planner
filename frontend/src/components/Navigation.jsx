import { A } from '@solidjs/router';
import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
    const auth = useAuth();

    return (
        <nav class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex">
                        <div class="flex-shrink-0 flex items-center">
                            <span class="text-2xl font-bold text-primary-600">Budget Planner</span>
                        </div>
                        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <A
                                href="/"
                                class="border-transparent text-gray-900 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                activeClass="border-primary-500 text-primary-600"
                            >
                                Dashboard
                            </A>
                            <A
                                href="/transactions"
                                class="border-transparent text-gray-900 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                activeClass="border-primary-500 text-primary-600"
                            >
                                Transactions
                            </A>
                            <A
                                href="/goals"
                                class="border-transparent text-gray-900 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                activeClass="border-primary-500 text-primary-600"
                            >
                                Goals
                            </A>
                            <A
                                href="/insights"
                                class="border-transparent text-gray-900 hover:border-primary-500 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                                activeClass="border-primary-500 text-primary-600"
                            >
                                AI Insights
                            </A>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <span class="text-sm text-gray-700 mr-4">Welcome, {auth.user()?.username}</span>
                        <button
                            onClick={() => auth.logout()}
                            class="text-sm text-gray-700 hover:text-gray-900"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
