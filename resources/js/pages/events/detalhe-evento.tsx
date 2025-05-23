import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import { Head, Link } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { formatarDataBrasileira } from '@/lib/utils';

// @ts-ignore
export default function EventoDetalhe({ chartData, eventoNome, eventoId }) {
    const formatData = chartData.map((item: { date: string | number | Date; count: any }) => ({
        // @ts-ignore
        name: formatarDataBrasileira(item.date),
        count: item.count,
    }));

    return (
        <>
            <Head title="Detalhes do evento" />
            <DefaultLayout>
                <div className="w-full max-w-5xl mx-auto p-4">
                    <h2 className="text-2xl font-semibold text-primary mb-6 text-center dark:text-white">
                        Inscrições por dia do {eventoNome}
                    </h2>
                    {formatData.length === 0 ? (
                        <Alert className="justify-self-center" variant="warning">
                            <AlertTitle>Ainda não temos nenhum dado disponível.</AlertTitle>
                        </Alert>
                    ) : (
                        <div className="w-full h-[400px] flex flex-col gap-6 justiy-center">
                            <ResponsiveContainer width='100%' height={400}>
                                <BarChart
                                    data={formatData}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} domain={[0, 50]} />
                                    <Tooltip formatter={(value) => [`${value}`, 'Número de pessoas']} />
                                    <Bar dataKey="count" fill="#104E64FF" radius={[4, 4, 0, 0]} barSize={70} />
                                </BarChart>
                            </ResponsiveContainer>
                            <Link className='w-1/2 lg:w-1/4 self-end bg-primary hover:bg-primary-foreground text-white font-semibold py-2 px-4 cursor-pointer rounded shadow-2xl active:scale-95 transition-all text-center' href={route('detalheParticipantes', eventoId)}>Ver mais detalhes</Link>
                        </div>
                    )}
                </div>
            </DefaultLayout>
        </>
    );
}
