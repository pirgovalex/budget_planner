import { createSignal, createResource, For } from 'solid-js';
import { Navigation } from '../components/Navigation';
import { Card, Button, Input, Label } from '../components/UI';
import { api } from '../api/client';

export default function Transactions() {
    const [transactions, { refetch }] = createResource(() => api.getTransactions());
    const [showForm, setShowForm] = createSignal(false);
    const [formData, setFormData] = createSignal({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        is_expense: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = formData();
        await api.createTransaction({
            date: new Date(data.date).toISOString(),
            amount: parseFloat(data.amount),
            description: data.description,
            is_expense: data.is_expense
        });
        setShowForm(false);
        refetch();
        setFormData({
            date: new Date().toISOString().split('T')[0],
            amount: '',
            description: '',
            is_expense: true
        });
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            await api.deleteTransaction(id);
            refetch();
        }
    };

    return (
        <div class="min-h-screen bg-gray-50">
            <Navigation />

            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex justify-between items-center mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Transactions</h1>
                    <Button onClick={() => setShowForm(!showForm())}>
                        {showForm() ? 'Cancel' : 'Add Transaction'}
                    </Button>
                </div>

                {showForm() && (
                    <Card class="mb-8">
                        <h2 class="text-xl font-semibold mb-4">New Transaction</h2>
                        <form onSubmit={handleSubmit} class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={formData().date}
                                        onInput={(v) => setFormData({ ...formData(), date: v })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData().amount}
                                        onInput={(v) => setFormData({ ...formData(), amount: v })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Input
                                    type="text"
                                    placeholder="What was this for?"
                                    value={formData().description}
                                    onInput={(v) => setFormData({ ...formData(), description: v })}
                                    required
                                />
                            </div>

                            <div class="flex items-center space-x-4">
                                <label class="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={formData().is_expense}
                                        onChange={() => setFormData({ ...formData(), is_expense: true })}
                                        class="mr-2"
                                    />
                                    Expense
                                </label>
                                <label class="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={!formData().is_expense}
                                        onChange={() => setFormData({ ...formData(), is_expense: false })}
                                        class="mr-2"
                                    />
                                    Income
                                </label>
                            </div>

                            <Button type="submit">Create Transaction</Button>
                        </form>
                    </Card>
                )}

                {transactions.loading && <p>Loading transactions...</p>}
                {transactions.error && <p class="text-red-600">Error loading transactions</p>}

                <div class="space-y-4">
                    <For each={transactions()}>
                        {(transaction) => (
                            <Card class="flex justify-between items-center">
                                <div class="flex-1">
                                    <div class="flex items-center space-x-4">
                                        <div class={`w-12 h-12 rounded-lg flex items-center justify-center ${transaction.is_expense ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {transaction.is_expense ? '-' : '+'}
                                        </div>
                                        <div class="flex-1">
                                            <h3 class="font-medium text-gray-900">{transaction.description}</h3>
                                            <div class="flex items-center space-x-2 text-sm text-gray-500">
                                                <span>{new Date(transaction.date).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span class="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                                    {transaction.category || 'Uncategorized'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <span class={`text-xl font-semibold ${transaction.is_expense ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        {transaction.is_expense ? '-' : '+'}${transaction.amount.toFixed(2)}
                                    </span>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(transaction.id)}
                                    >
                                        Delete
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
