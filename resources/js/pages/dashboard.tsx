import React, { useEffect, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import NavMain from '@/components/nav-main';
import DefaultLayout from '@/layouts/app/default-layout';

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [mesSelecionado, setMesSelecionado] = useState<string>("todos");
    const [dataInicio, setDataInicio] = useState<string>("");
    const [dataFim, setDataFim] = useState<string>("");

    const eventos = [
        { id: 1, nome: "Workshop de Inovação", data: "2025-04-10", local: "Auditório 1" },
        { id: 2, nome: "Treinamento de Vendas", data: "2025-05-20", local: "Sala 3" },
        { id: 3, nome: "Palestra Motivacional", data: "2025-06-01", local: "Auditório Principal" },
        { id: 4, nome: "Feira de Negócios", data: "2025-03-01", local: "Centro de Eventos" },
    ];

    // Filtro por data
    const eventosFiltrados = eventos.filter((evento) => {
        if (mesSelecionado !== "todos") {
            const dataEvento = new Date(evento.data);
            const mesAno = `${dataEvento.getFullYear()}-${String(dataEvento.getMonth() + 1).padStart(2, "0")}`;
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
    const eventosPassados = eventosFiltrados.filter(e => new Date(e.data) < hoje);
    const eventosFuturos = eventosFiltrados.filter(e => new Date(e.data) >= hoje);

    const pieData = [
        { name: "Eventos Realizados", value: eventosPassados.length },
        { name: "Eventos Futuros", value: eventosFuturos.length },
    ];

    const cores = ["#6366f1", "#10b981"]; // Indigo e verde

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-indigo-600 text-sm font-medium">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <DefaultLayout>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard de Eventos</h1>
                <p className="text-gray-600">Resumo geral dos eventos da empresa</p>
            </header>

            <div className="mb-6">
                <select
                    value={mesSelecionado}
                    onChange={(e) => setMesSelecionado(e.target.value)}
                    className="mb-4 p-2 border rounded shadow text-sm"
                >
                    <option value="todos">Todos os meses</option>
                    <option value="2025-03">Março 2025</option>
                    <option value="2025-04">Abril 2025</option>
                    <option value="2025-05">Maio 2025</option>
                </select>

                <div className="flex space-x-4">
                    <div>
                        <label htmlFor="dataInicio" className="text-sm text-gray-600">Data Início:</label>
                        <input
                            id="dataInicio"
                            type="date"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                            className="mt-2 p-2 border rounded shadow text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="dataFim" className="text-sm text-gray-600">Data Fim:</label>
                        <input
                            id="dataFim"
                            type="date"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                            className="mt-2 p-2 border rounded shadow text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
                    <h2 className="text-lg font-semibold text-gray-700">Total de Eventos</h2>
                    <p className="text-2xl font-bold text-indigo-600">{eventosFiltrados.length}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
                    <h2 className="text-lg font-semibold text-gray-700">Eventos Realizados</h2>
                    <p className="text-2xl font-bold text-indigo-600">{eventosPassados.length}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
                    <h2 className="text-lg font-semibold text-gray-700">Eventos Pendentes</h2>
                    <p className="text-2xl font-bold text-indigo-600">{eventosFuturos.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Próximos Eventos</h2>
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

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumo de Eventos</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const { name, value } = payload[0].payload;
                                        return (
                                            <div
                                                className="bg-white border rounded-lg shadow px-4 py-2 text-sm text-gray-800">
                                                <p className="font-semibold">{name}</p>
                                                <p>{value} evento{value > 1 ? "s" : ""}</p>
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
