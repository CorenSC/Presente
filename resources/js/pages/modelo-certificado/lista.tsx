import { Head, Link, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Eye, Import, SquarePen, StepBack, StepForward, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatarDataBrasileira } from '@/lib/utils';

type Modelo = {
    id: number;
    nome: string;
}

export default function Lista() {
    const { modelos } = usePage().props as unknown as { modelos: Modelo[] };
    const [globalFilter, setGlobalFilter] = useState('');
    const { props } = usePage();
    //@ts-ignore
    const message = props.flash?.success;

    const columns: ColumnDef<Modelo>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'nome', header: 'Nome do modelo' },
        {
            id: 'acoes',
            header: 'Ações',
            cell: ({ row }) => {
                const modelo = row.original;
                return (
                    <div className="flex gap-2">
                        <Link
                            href={route('modeloCertificadoShow', modelo.id)}
                            alt="Visualizar"
                            title="Visualizar"
                            className="bg-primary hover:bg-primary-foreground flex cursor-pointer items-center justify-center rounded px-3 py-1 font-semibold text-white shadow-2xl transition-all active:scale-95"
                        >
                            <Eye className="w-5" />
                        </Link>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: modelos,
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
            <Head title='Lista'/>
            <DefaultLayout>
                <div className="p-6">
                    <h2 className="text-primary mb-4 text-2xl font-bold dark:text-white">Lista de modelo de certificado</h2>

                    {message && (

                        <>
                            <Alert variant="success" className="mb-6">
                                <AlertTitle variant="success" className="text-lg font-bold">
                                    Sucesso!
                                </AlertTitle>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                            <br/>
                        </>
                    )}


                    <div className="mb-4 flex items-center gap-4">
                        <Input
                            type="text"
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Buscar modelo..."
                        />

                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Mostrar:</label>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={(e) => table.setPageSize(Number(e.target.value))}
                                className="text-primary rounded-lg bg-white p-2 shadow-lg dark:border-white dark:bg-gray-800 dark:text-white"
                            >
                                {[5, 10, 20, 50].map((size) => (
                                    <option key={size} value={size} className="text-primary bg-white">
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {modelos.length === 0 && (
                        <div className="flex items-center justify-center">
                            <Alert variant={'warning'} className="mb-6">
                                <AlertTitle variant={'warning'} className="text-lg font-bold">
                                    Ainda não temos evento cadastrados
                                </AlertTitle>
                            </Alert>
                        </div>
                    )}
                    <div className="overflow-x-auto">
                        <table className="text-primary min-w-full divide-y rounded shadow-md dark:divide-gray-600 dark:text-white">
                            <thead className="bg-gray-100 dark:bg-gray-800/50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="px-6 py-3 text-left text-xs font-medium tracking-wider">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            </thead>
                            <tbody className="text-primary divide-y divide-gray-200 bg-white dark:bg-gray-800 dark:text-white">
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

                    {/* Paginação */}
                    <div className="mt-4 flex items-center justify-between gap-4">
                        <Button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="w-12 pr-10 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            <StepBack />
                        </Button>
                        <span className="text-primary dark:text-white">
                            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                        </span>
                        <Button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="w-12 pr-10 disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                            <StepForward />
                        </Button>
                    </div>
                </div>
            </DefaultLayout>
        </>
    );
}
