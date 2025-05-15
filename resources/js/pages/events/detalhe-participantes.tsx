import { Head, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { StepBack, StepForward } from 'lucide-react';
import { formatarDataBrasileira } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { FaFileExcel } from 'react-icons/fa';

type Participante = {
    nome: string;
    email: string;
    data_inscricao: string;
};

//@ts-ignore
export default function DetalheParticipantes({eventoNome}) {

    const handleDownload = () => {
        const worksheet = XLSX.utils.json_to_sheet(participantes);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Participantes");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsm', type: 'array' });
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.ms-excel.sheet.macroEnabled.12',
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `participantes_${eventoNome}.xlsm`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const { props } = usePage();
    const participantes = props.participantes as Participante[];

    const [globalFilter, setGlobalFilter] = useState('');

    const columns: ColumnDef<Participante>[] = [
        {
            accessorKey: 'nome',
            header: 'Nome',
        },
        {
            accessorKey: 'cpf',
            header: 'CPF',
        },
        {
            accessorKey: 'categoria_profissional',
            header: 'Categoria',
        },
        {
            accessorKey: 'instituicao',
            header: 'Instituição',
            cell: (info) => {
                const valor = info.getValue() as string;
                return valor?.trim() ? valor : 'Não preenchido';
            },
        },
        {
            accessorKey: 'data_inscricao',
            header: 'Data de Inscrição',
            cell: (info) => formatarDataBrasileira(info.getValue() as string),
        },
    ];

    const table = useReactTable({
        data: participantes,
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
            <Head title='Detalhe Participantes' />
            <DefaultLayout>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-primary dark:text-white">Participantes do(a) {eventoNome}</h2>

                    <div className="mb-4 flex items-center gap-4">
                        <Input
                            type='text'
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Buscar participante..."
                        />
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Mostrar:</label>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => table.setPageSize(Number(e.target.value))}
                                className="p-2 rounded-lg text-primary shadow-lg bg-white dark:border-white dark:bg-gray-800 dark:text-white"
                            >
                                {[5, 10, 20, 50].map(size => (
                                    <option key={size} value={size} className='text-primary bg-white'>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            onClick={handleDownload}
                            className="ml-auto flex items-center justify-center bg-green-600 hover:bg-green-700 text-white w-16"
                            title='Baixar excel'
                        >
                            <FaFileExcel />
                        </Button>
                    </div>

                    {participantes.length === 0 && (
                        <div className='flex items-center justify-center'>
                            <Alert variant={'warning'} className='mb-6'>
                                <AlertTitle variant={'warning'} className='text-lg font-bold'>Ainda não temos participantes cadastrados</AlertTitle>
                            </Alert>
                        </div>
                    )}

                    {participantes.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-primary divide-y dark:divide-gray-600 dark:text-white rounded shadow-md">
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
                                <tbody className="bg-white text-primary divide-y divide-gray-200 dark:bg-gray-800 dark:text-white">
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
                    )}

                    {/* Paginação */}
                    <div className="mt-4 flex items-center justify-between gap-4">
                        <Button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className='w-12 pr-10 disabled:bg-gray-300 disabled:cursor-not-allowed'
                        >
                            <StepBack />
                        </Button>
                        <span className='text-primary dark:text-white'>
                            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                        </span>
                        <Button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className='w-12 pr-10 disabled:bg-gray-300 disabled:cursor-not-allowed'
                        >
                            <StepForward />
                        </Button>
                    </div>
                </div>
            </DefaultLayout>
        </>
    );
}
