import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    ColumnDef,
    flexRender
} from '@tanstack/react-table';
import DefaultLayout from '@/layouts/app/default-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SquarePen, StepBack, StepForward } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Usuario = {
    id: number;
    nome: string;
    username: string;
    departamento: string;
    pode_acessar: boolean;
    role: string;
    email: string;
};

interface UsuariosProps {
    usuarios: Usuario[];
}

export default function Index({ usuarios }: UsuariosProps) {
    const [globalFilter, setGlobalFilter] = useState('');
    const { flash } = usePage().props as { flash?: Record<string, string> };

    const successMessage = flash?.success;
    const alertType = (['success', 'error', 'warning', 'info'].find(type => type in (flash || {})) || 'success') as 'success' | 'error' | 'warning' | 'info';




    const columns: ColumnDef<Usuario>[] = [
        {
            accessorKey: 'nome',
            header: 'Nome',
            cell: info => info.getValue(),
        },
        {
            accessorKey: 'username',
            header: 'Username',
        },
        {
            accessorKey: 'pode_acessar',
            header: 'Acesso ao sistema',
            cell: info => info.getValue() ? 'Sim' : 'Não',
        },
        {
            id: 'acoes',
            header: 'Ações',
            cell: ({ row }) => {
                const usuario = row.original;
                return (
                    <div className="flex gap-2">
                        <Link
                            href={ route('editarUsuario', usuario.id) }
                            alt="Editar"
                            title={'Editar'}
                            className="cursor-pointer rounded bg-yellow-600/80 items-center justify-center px-3 py-1 font-semibold text-white shadow-2xl transition-all hover:bg-yellow-700 active:scale-95"
                        >
                            <SquarePen className='w-5' />
                        </Link>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: usuarios,
        columns,
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 10, pageIndex: 0 },
        },
    });

    return (
        <DefaultLayout>
            <Head title="Participantes" />
            {successMessage && (
                // @ts-ignore
                <Alert className='justify-self-center' variant={alertType}>
                    <AlertTitle variant={alertType}>Sucesso</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            )}
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-primary dark:text-white">
                    Usuários
                </h2>

                {/* Barra de filtro e seleção de pageSize */}
                <div className="mb-4 flex items-center gap-4">
                    <Input
                        type="text"
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Buscar usuário..."
                    />
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Mostrar:</label>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                            className="p-2 rounded-lg text-primary shadow-lg bg-white dark:border-white dark:bg-gray-800 dark:text-white"
                        >
                            {[5, 10, 20, 50].map((size) => (
                                <option key={size} value={size} className="text-primary bg-white">
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto">
                    <table
                        className="min-w-full text-primary divide-y dark:divide-gray-600 dark:text-white rounded shadow-md">
                        <thead className="bg-gray-100 dark:bg-gray-800/50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-left text-xs font-medium tracking-wider"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>
                        <tbody
                            className="bg-white text-primary divide-y divide-gray-200 dark:bg-gray-800 dark:text-white">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-6 py-2 whitespace-nowrap text-sm">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div className="mt-4 flex items-center justify-between gap-4">
                    <Button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="w-12 pr-10 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <StepBack />
                    </Button>
                    <span className="text-primary dark:text-white">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                    </span>
                    <Button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="w-12 pr-10 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <StepForward />
                    </Button>
                </div>
            </div>
        </DefaultLayout>
    );
}
