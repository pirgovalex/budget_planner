import { createSignal, createResource, For } from 'solid-js';
import { Navigation } from '../components/Navigation';
import { Card, Button, Input, Label } from '../components/UI';
import { api } from '../api/client';

export default function Goals() {
    const [goals, { refetch }] = createResource(() => api.getGoals());
    const [showForm, setShowForm] = createSignal(false);
    const [formData, setFormData] = createSignal({
        name: '',
        target_amount: '',
        current_amount: '0',
        deadline: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = formData();
        await api.createGoal({
            name: data.name,
            target_amount: parseFloat(data.target_amount),
            current_amount: parseFloat(data.current_amount),
            deadline: data.deadline ? new Date(data.deadline).toISOString() : null
        });
        setShowForm(false);
        refetch();
        setFormData({
            name: '',
            target_amount: '',
            current_amount: '0',
            deadline: ''
        });
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this goal?')) {
            await api.deleteGoal(id);
            refetch();
        }
    };

    const handleUpdateProgress = async (goal) => {
        const amount = prompt(`Update progress for "${goal.name}"\nCurrent: $${goal.current_amount.toFixed(2)}`, goal.current_amount);
        if (amount !== null) {
            await api.updateGoal(goal.id, { current_amount: parseFloat(amount) });
            refetch();
        }
    };

    return (
        <div class="min-h-screen bg-gray-50">
            <Navigation />

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Goals</h1>
                    <Button onClick={() => setShowForm(!showForm())}>
                        {showForm() ? 'Cancel' : 'Add Goal'}
                    </Button>
                </div>

                {showForm() && (
                    <Card class="mb-8">
                        <h2 class="text-xl font-semibold mb-4">New Goal</h2>
                        <form onSubmit={handleSubmit} class="space-y-4">
                            <div>
                                <Label>Goal Name</Label>
                                <Input
                                    type="text"
                                    placeholder="e.g., Vacation Fund"
                                    value={formData().name}
                                    onInput={(v) => setFormData({ ...formData(), name: v })}
                                    required
                                />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Target Amount</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData().target_amount}
                                        onInput={(v) => setFormData({ ...formData(), target_amount: v })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Current Amount</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData().current_amount}
                                        onInput={(v) => setFormData({ ...formData(), current_amount: v })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Deadline (Optional)</Label>
                                <Input
                                    type="date"
                                    value={formData().deadline}
                                    onInput={(v) => setFormData({ ...formData(), deadline: v })}
                                />
                            </div>

                            <Button type="submit">Create Goal</Button>
                        </form>
                    </Card>
                )}

                {goals.loading && <p>Loading goals...</p>}
                {goals.error && <p class="text-red-600">Error loading goals</p>}

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <For each={goals()}>
                        {(goal) => (
                            <Card>
                                <div class="mb-4">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="text-xl font-semibold text-gray-900">{goal.name}</h3>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(goal.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                    {goal.deadline && (
                                        <p class="text-sm text-gray-500">
                                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                <div class="mb-4">
                                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>${goal.current_amount.toFixed(2)}</span>
                                        <span>${goal.target_amount.toFixed(2)}</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                            class="bg-primary-600 h-4 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p class="text-center text-sm font-medium text-gray-700 mt-2">
                                        {goal.progress.toFixed(1)}% Complete
                                    </p>
                                </div>

                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">
                                        Remaining: ${goal.remaining.toFixed(2)}
                                    </span>
                                    <Button
                                        size="sm"
                                        onClick={() => handleUpdateProgress(goal)}
                                    >
                                        Update Progress
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
}
