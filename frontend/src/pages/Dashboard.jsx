import { createSignal, createResource, onMount, For } from 'solid-js';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/UI';
import { api } from '../api/client';
import { Chart } from 'chart.js/auto';

export default function Dashboard() {
    const [analytics] = createResource(() => api.getAnalyticsSummary());
    const [spendingData] = createResource(() => api.getSpendingByCategory());
    let pieChartRef;
    let barChartRef;

    onMount(() => {
        createResource(() => spendingData(), (data) => {
            if (pieChartRef && data && Object.keys(data).length > 0) {
                const ctx = pieChartRef.getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(data),
                        datasets: [{
                            data: Object.values(data),
                            backgroundColor: [
                                '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
                                '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
                            ],
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        });
    });

    return (
        <div class="min-h-screen bg-gray-50">
            <Navigation />

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

                {analytics.loading && <p class="text-gray-600">Loading...</p>}
                {analytics.error && <p class="text-red-600">Error loading data</p>}

                {analytics() && (
                    <div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card>
                                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Income</h3>
                                <p class="mt-2 text-3xl font-bold text-green-600">
                                    ${analytics().total_income.toFixed(2)}
                                </p>
                            </Card>

                            <Card>
                                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Expenses</h3>
                                <p class="mt-2 text-3xl font-bold text-red-600">
                                    ${analytics().total_expenses.toFixed(2)}
                                </p>
                            </Card>

                            <Card>
                                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Net Savings</h3>
                                <p class="mt-2 text-3xl font-bold text-primary-600">
                                    ${analytics().net_savings.toFixed(2)}
                                </p>
                            </Card>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
                                <div class="flex justify-center">
                                    <canvas ref={pieChartRef} class="max-w-md"></canvas>
                                </div>
                            </Card>

                            <Card>
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
                                <div class="space-y-3">
                                    <For each={Object.entries(analytics().monthly_summary || {})}>
                                        {([month, data]) => (
                                            <div class="flex justify-between items-center py-2 border-b border-gray-200">
                                                <span class="font-medium text-gray-700">{month}</span>
                                                <div class="text-right">
                                                    <div class="text-sm text-green-600">+${data.income.toFixed(2)}</div>
                                                    <div class="text-sm text-red-600">-${data.expenses.toFixed(2)}</div>
                                                    <div class="font-medium">${data.net.toFixed(2)}</div>
                                                </div>
                                            </div>
                                        )}
                                    </For>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
