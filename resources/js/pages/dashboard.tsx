import React, { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import DefaultLayout from '@/layouts/app/default-layout';
import { Input } from '@/components/ui/input';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [mesSelecionado, setMesSelecionado] = useState<string>('todos');
    const [dataInicio, setDataInicio] = useState<string>('');
    const [dataFim, setDataFim] = useState<string>('');

    const eventos = [
        { id: 1, nome: 'Workshop de Inovação', data: '2025-04-10', local: 'Auditório 1' },
        { id: 2, nome: 'Treinamento de Vendas', data: '2025-05-20', local: 'Sala 3' },
        { id: 3, nome: 'Palestra Motivacional', data: '2025-06-01', local: 'Auditório Principal' },
        { id: 4, nome: 'Feira de Negócios', data: '2025-03-01', local: 'Centro de Eventos' },
    ];

    const eventosFiltrados = eventos.filter((evento) => {
        if (mesSelecionado !== 'todos') {
            const dataEvento = new Date(evento.data);
            const mesAno = `${dataEvento.getFullYear()}-${String(dataEvento.getMonth() + 1).padStart(2, '0')}`;
            if (mesAno !== mesSelecionado) return false;
        }

        if (dataInicio || dataFim) {
            const dataEvento = new Date(evento.data);
            if (dataInicio && dataEvento < new Date(dataInicio)) return false;
            if (dataFim && dataEvento > new Date(dataFim)) return false;
        }

        return true;
    });

    const hoje = new Date();
    const eventosPassados = eventosFiltrados.filter((e) => new Date(e.data) < hoje);
    const eventosFuturos = eventosFiltrados.filter((e) => new Date(e.data) >= hoje);

    const pieData = [
        { name: 'Eventos Realizados', value: eventosPassados.length },
        { name: 'Eventos Futuros', value: eventosFuturos.length },
    ];

    const cores = ['#6366f1', '#10b981']; // Indigo e verde

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <DefaultLayout>
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-1/4 rounded-md bg-gray-300" />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="rounded-2xl bg-white p-4 shadow">
                                <div className="mb-2 h-4 w-3/4 rounded bg-gray-300" />
                                <div className="h-6 w-1/2 rounded bg-gray-400" />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4 rounded-2xl bg-white p-6 shadow">
                            <div className="h-6 w-1/3 rounded bg-gray-300" />
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <div className="h-4 w-1/4 rounded bg-gray-300" />
                                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                                    <div className="h-4 w-1/4 rounded bg-gray-200" />
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 rounded-2xl bg-white p-6 shadow">
                            <div className="h-6 w-1/3 rounded bg-gray-300" />
                            <div className="h-40 w-full rounded-xl bg-gray-200" />
                            <div className="flex justify-between">
                                <div className="h-3 w-10 rounded bg-gray-300" />
                                <div className="h-3 w-10 rounded bg-gray-300" />
                                <div className="h-3 w-10 rounded bg-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-[#214064] dark:text-white">Dashboard de Eventos</h1>
                <p className="text-[#214064] dark:text-white">Resumo geral dos eventos da empresa</p>
            </header>

            <div className="mb-6">
                <select
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(e.target.value)}
                    className="mb-4 rounded border border-[#214064] text-[#214064] p-2 text-sm shadow dark:bg-gray-800 dark:text-white dark:border-none"
                >
                    <option value="todos">Todos os meses</option>
                    <option value="2025-03">Março 2025</option>
                    <option value="2025-04">Abril 2025</option>
                    <option value="2025-05">Maio 2025</option>
                </select>

                <div className="flex space-x-4">
                    <div>
                        <Input
                            placeholder="dd/mm/aaaa"
                            id="dataInicio"
                            label="Data início:"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            className="border border-[#214064] text-sm shadow-md text-[#214064] dark:bg-gray-800 dark:text-white dark:border-none"
                            type='date'
                        />
                    </div>
                    <div>
                        <Input
                            placeholder="dd/mm/aaaa"
                            id="dataFim"
                            label="Data fim:"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                            className="border border-[#214064] text-sm shadow-md text-[#214064] dark:bg-gray-800 dark:text-white dark:border-none"
                            type='date'
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
                    <h2 className="text-lg font-semibold text-gray-700">Total de Eventos</h2>
                    <p className="text-2xl font-bold text-indigo-600">{eventosFiltrados.length}</p>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
                    <h2 className="text-lg font-semibold text-gray-700">Eventos Realizados</h2>
                    <p className="text-2xl font-bold text-indigo-600">{eventosPassados.length}</p>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
                    <h2 className="text-lg font-semibold text-gray-700">Eventos Pendentes</h2>
                    <p className="text-2xl font-bold text-indigo-600">{eventosFuturos.length}</p>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
                    <h2 className="mb-4 text-xl font-semibold text-gray-800">Próximos Eventos</h2>
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-left text-sm text-gray-600">
                                <th className="pb-2">Nome</th>
                                <th className="pb-2">Data</th>
                                <th className="pb-2">Local</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventosFuturos.map((evento) => (
                                <tr key={evento.id} className="border-t text-sm text-gray-700">
                                    <td className="py-2">{evento.nome}</td>
                                    <td className="py-2">{evento.data}</td>
                                    <td className="py-2">{evento.local}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
                    <h2 className="mb-4 text-xl font-semibold text-gray-800">Resumo de Eventos</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const { name, value } = payload[0].payload;
                                        return (
                                            <div className="rounded-lg border bg-white px-4 py-2 text-sm text-gray-800 shadow">
                                                <p className="font-semibold">{name}</p>
                                                <p>
                                                    {value} evento{value > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default Dashboard;
