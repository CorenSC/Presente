import { Head, Link, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import React, { useState } from 'react';
import {
    ColumnDef, flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';
import { formatarDataBrasileira } from '@/lib/utils';
import { Alert, AlertTitle } from '@/components/ui/alert';

type Eventos = {
    id: number
    nome: string;
    local_do_evento: string;
    data_inicio: string;
    ativo: boolean;
}

export default function Index() {
    const { props } = usePage();
    const eventos = props.eventos as Eventos[]
    const [globalFilter, setGlobalFilter] = useState('');

    const columns: ColumnDef<Eventos>[] = [

        {
            accessorKey: 'nome',
            header: 'Nome',
        },
        {
            accessorKey: 'local_do_evento',
            header: 'Local',
        },
        {
            accessorKey: 'data_inicio',
            header: 'Data',
            cell: (info) => formatarDataBrasileira(info.getValue() as string)
        },
        {
            accessorKey: 'ativo',
            header: 'Ativo',
            cell: (info) => info.getValue() ? 'Ativo' : 'Inativo'
        },
        {
            id: 'acoes',
            header: 'Ações',
            cell: ({row}) => {
                const evento = row.original;
                return(
                    <Link
                        href={route('detalhesEvento', evento.id)}
                        className="bg-primary hover:bg-primary-foreground cursor-pointer rounded px-4 py-2 text-center font-semibold text-white shadow-2xl transition-all active:scale-95 "
                    >
                        Detalhes
                    </Link>
                );
            }
        }

    ];

    const table = useReactTable({
        data: eventos,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <>
            <Head title="Visualizar eventos" />
            <DefaultLayout>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-primary dark:text-white">Eventos</h2>
                    {eventos.length === 0 && (
                        <div className="flex items-center justify-center">
                            <Alert variant={'warning'} className="mb-6">
                                <AlertTitle variant={'warning'} className="text-lg font-bold">
                                    Ainda não temos eventos cadastrados
                                </AlertTitle>
                            </Alert>
                        </div>
                    )}

                    {eventos.length > 0 && (
                        <div className="overflow-x-auto">
                            <table
                                className="text-primary min-w-full divide-y rounded shadow-md dark:divide-gray-600 dark:text-white">
                                <thead className="bg-gray-100 dark:bg-gray-800/50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id}
                                                className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                                </thead>
                                <tbody
                                    className="text-primary divide-y divide-gray-200 bg-white dark:bg-gray-800 dark:text-white">
                                {table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-6 py-2 text-sm whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </DefaultLayout>
        </>
    );
}
