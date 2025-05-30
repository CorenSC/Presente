import { Input } from '@/components/ui/input';
import DefaultLayout from '@/layouts/app/default-layout';
import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatarDataBrasileira } from '@/lib/utils';
import { Alert, AlertTitle } from '@/components/ui/alert';

interface Evento {
    id: number;
    nome: string;
    local_do_evento: string;
    data_inicio: string;
    data_fim: string;
    hora_inicio: string;
    hora_fim: string;
}

interface EventoProps {
    eventos: Evento[];
}

const Dashboard: React.FC<EventoProps> = ({ eventos }) => {
    const [loading, setLoading] = useState(true);
    const [mesSelecionado, setMesSelecionado] = useState<string>('todos');
    const [dataInicio, setDataInicio] = useState<string>('');
    const [dataFim, setDataFim] = useState<string>('');

    const eventosFiltrados = eventos.filter((evento) => {
        if (mesSelecionado !== 'todos') {
            const mesAnoEvento = evento.data_inicio.slice(0, 7);
            if (mesAnoEvento !== mesSelecionado) return false;
        }

        if (dataInicio || dataFim) {
            const dataEvento = new Date(evento.data_inicio);
            if (dataInicio && dataEvento < new Date(dataInicio)) return false;
            if (dataFim && dataEvento > new Date(dataFim)) return false;
        }

        return true;
    });

    const hoje = new Date();
    const eventosPassados = eventosFiltrados.filter((e) => {
        const fimCompleto = new Date(`${e.data_fim}T${e.hora_fim}`);
        return fimCompleto < hoje;
    })
    const eventosFuturos = eventosFiltrados.filter((e) => {
        const inicioCompleto = new Date(`${e.data_inicio}T${e.hora_inicio}`);
        return inicioCompleto > hoje;
    });
    const eventosEmAndamento = eventosFiltrados.filter((e) => {
        const inicioCompleto = new Date(`${e.data_inicio}T${e.hora_inicio}`);
        const fimCompleto = new Date(`${e.data_fim}T${e.hora_fim}`);
        return inicioCompleto <= hoje && fimCompleto >= hoje;
    });

    const pieData = [
        { name: 'Eventos realizados', value: eventosPassados.length },
        { name: 'Eventos em andamento', value: eventosEmAndamento.length },
        { name: 'Eventos pendentes', value: eventosFuturos.length },
    ];

    const mesesDoAno = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const cores = ['#104E64FF', '#FFD166', '#009689FF'];

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
        <>
            <Head title="Dashboard" />
            <DefaultLayout>
                <header className="mb-6">
                    <h1 className="text-primary text-3xl font-bold dark:text-white">Dashboard</h1>
                </header>

                {eventos.length > 0 && (
                    <>
                        <div className="mb-6">
                            <Select value={mesSelecionado} onValueChange={(value) => setMesSelecionado(value)}>
                                <SelectTrigger className="text-primary mb-4 w-1/6 rounded border-none bg-white p-2 text-sm shadow dark:bg-gray-800 dark:text-white">
                                    <SelectValue placeholder="--Selecione o mês--" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os meses</SelectItem>
                                    {mesesDoAno.map((mes, index) => (
                                        <SelectItem key={index} value={`2025-${String(index + 1).padStart(2, '0')}`}>
                                            {mes}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex space-x-4">
                                <Input
                                    placeholder="dd/mm/aaaa"
                                    id="dataInicio"
                                    label="Data início:"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                    className="text-primary border text-sm shadow-md dark:border-none dark:bg-gray-800 dark:text-white"
                                    type="date"
                                />
                                <Input
                                    placeholder="dd/mm/aaaa"
                                    id="dataFim"
                                    label="Data fim:"
                                    value={dataFim}
                                    onChange={(e) => setDataFim(e.target.value)}
                                    className="text-primary border text-sm shadow-md dark:border-none dark:bg-gray-800 dark:text-white"
                                    type="date"
                                />
                            </div>
                        </div>
                        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                            <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
                                <h2 className="text-primary text-lg font-black dark:text-white">Total de Eventos</h2>
                                <p className="text-primary text-2xl font-bold dark:text-white">{eventosFiltrados.length}</p>
                            </div>

                            <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
                                <h2 className="text-primary text-lg font-black dark:text-white">Eventos Realizados</h2>
                                <p className="text-primary text-2xl font-bold dark:text-white">{eventosPassados.length}</p>
                            </div>

                            <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
                                <h2 className="text-primary text-lg font-black dark:text-white">Eventos em Andamento</h2>
                                <p className="text-primary text-2xl font-bold dark:text-white">{eventosEmAndamento.length}</p>
                            </div>

                            <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-800">
                                <h2 className="text-primary text-lg font-black dark:text-white">Eventos Pendentes</h2>
                                <p className="text-primary text-2xl font-bold dark:text-white">{eventosFuturos.length}</p>
                            </div>
                        </div>
                        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
                                <h2 className="text-primary mb-4 text-xl font-semibold dark:text-white">Eventos em andamento</h2>
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-400">
                                            <th className="pb-2">Nome</th>
                                            <th className="pb-2">Data</th>
                                            <th className="pb-2">Local</th>
                                            <th className="pb-2">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {eventosEmAndamento.map((evento) => (
                                            <tr key={evento.id} className="text-primary border-t font-black dark:text-white">
                                                <td className="py-2">{evento.nome}</td>
                                                <td className="py-2">{formatarDataBrasileira(evento.data_inicio)}</td>
                                                <td className="py-2">{evento.local_do_evento}</td>
                                                <td className="py-2">
                                                    <Link
                                                        href={route('detalhesEvento', evento.id)}
                                                        className="bg-primary hover:bg-primary-foreground cursor-pointer rounded px-4 py-2 text-center font-semibold text-white shadow-2xl transition-all active:scale-95"
                                                    >
                                                        Detalhes
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
                                <h2 className="text-primary mb-4 text-xl font-semibold dark:text-white">Próximos Eventos</h2>
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-400">
                                            <th className="pb-2">Nome</th>
                                            <th className="pb-2">Data</th>
                                            <th className="pb-2">Local</th>
                                            <th className="pb-2">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {eventosFuturos.map((evento) => (
                                            <tr key={evento.id} className="text-primary border-t font-black dark:text-white">
                                                <td className="py-2">{evento.nome}</td>
                                                <td className="py-2">{formatarDataBrasileira(evento.data_inicio)}</td>
                                                <td className="py-2">{evento.local_do_evento}</td>
                                                <td className="py-2">
                                                    <Link
                                                        href={route('detalhesEvento', evento.id)}
                                                        className="bg-primary hover:bg-primary-foreground cursor-pointer rounded px-4 py-2 text-center font-semibold text-white shadow-2xl transition-all active:scale-95"
                                                    >
                                                        Detalhes
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
                                <h2 className="text-primary mb-4 text-xl font-black dark:text-white">Resumo de Eventos</h2>
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
                    </>
                )}

                {eventos.length == 0 && (
                    <Alert variant='warning' className='self-center justify-self-center'>
                        <AlertTitle variant='warning'>Ainda não tem nenhum evento cadastrado!</AlertTitle>
                    </Alert>
                )}
            </DefaultLayout>
        </>
    );
};

export default Dashboard;
