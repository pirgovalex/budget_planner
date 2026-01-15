import { createResource } from 'solid-js';
import { Navigation } from '../components/Navigation';
import { Card } from '../components/UI';
import { api } from '../api/client';

export default function Insights() {
    const [insights] = createResource(() => api.getAIInsights());
    const [recommendations] = createResource(() => api.getSavingsRecommendations());
    const [predictions] = createResource(() => api.getPredictions());

    return (
        <div class="min-h-screen bg-gray-50">
            <Navigation />

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-8">AI Insights</h1>

                <div class="space-y-6">
                    <Card>
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">Spending Analysis</h2>
                        {insights.loading && <p class="text-gray-600">Analyzing your spending patterns...</p>}
                        {insights.error && <p class="text-red-600">Error loading insights</p>}
                        {insights() && (
                            <div>
                                <div class="mb-4 p-4 bg-primary-50 rounded-lg">
                                    <p class="text-gray-700 whitespace-pre-wrap">{insights().insights}</p>
                                </div>
                                <div class="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p class="text-sm text-gray-500">Total Income</p>
                                        <p class="text-2xl font-bold text-green-600">
                                            ${insights().total_income.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500">Total Expenses</p>
                                        <p class="text-2xl font-bold text-red-600">
                                            ${insights().total_expenses.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500">Net Savings</p>
                                        <p class="text-2xl font-bold text-primary-600">
                                            ${insights().net_savings.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">Savings Recommendations</h2>
                        {recommendations.loading && <p class="text-gray-600">Generating recommendations...</p>}
                        {recommendations.error && <p class="text-red-600">Error loading recommendations</p>}
                        {recommendations() && (
                            <div class="p-4 bg-green-50 rounded-lg">
                                <p class="text-gray-700 whitespace-pre-wrap">
                                    {recommendations().recommendations}
                                </p>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h2 class="text-xl font-semibold text-gray-900 mb-4">Predictions</h2>
                        {predictions.loading && <p class="text-gray-600">Calculating predictions...</p>}
                        {predictions.error && <p class="text-red-600">Error loading predictions</p>}
                        {predictions() && (
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="p-4 bg-blue-50 rounded-lg">
                                    <h3 class="text-sm font-medium text-gray-700 mb-2">Predicted Next Month</h3>
                                    <p class="text-3xl font-bold text-primary-600">
                                        ${predictions().predicted_expenses.toFixed(2)}
                                    </p>
                                </div>
                                <div class="p-4 bg-purple-50 rounded-lg">
                                    <h3 class="text-sm font-medium text-gray-700 mb-2">3-Month Average</h3>
                                    <p class="text-3xl font-bold text-purple-600">
                                        ${predictions().average_last_3_months.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
