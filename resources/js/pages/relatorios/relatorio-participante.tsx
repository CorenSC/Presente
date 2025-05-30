import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DefaultLayout from '@/layouts/app/default-layout';
import { Head, router } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown, StepBack, StepForward } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaFileExcel } from 'react-icons/fa';

interface Evento {
    id: number;
    nome: string;
}

interface Participante {
    [key: string]: string;
}

interface RelatorioParticipantesProps {
    eventos: Evento[];
    participantes?: Participante[];
    colunasSelecionadas?: string[];
    eventoSelecionado?: number | string;
}

interface Props {
    options: string[];
    selected: string[];
    toggleOption: (value: string) => void;
}

export function MultiSelectDropdown({ options, selected, toggleOption }: Props) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="text-primary relative inline-block w-full max-w-md dark:text-white">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-md bg-white p-2 shadow-md dark:bg-gray-800"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
        <span className="truncate select-none">
          {selected.length > 0 ? selected.map(s => s.replace(/_/g, ' ')).join(', ') : 'Selecione as colunas'}
        </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-gray-600 dark:text-gray-300" />
            </button>

            {open && (
                <div
                    className="absolute z-10 mt-2 w-full rounded border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
                    role="listbox"
                    tabIndex={-1}
                >
                    <ul className="max-h-60 overflow-y-auto p-2">
                        {options.map(option => {
                            const isChecked = selected.includes(option);
                            return (
                                <li
                                    key={option}
                                    className="flex items-center gap-2 rounded py-1 px-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    role="option"
                                    aria-selected={isChecked}
                                >
                                    <input
                                        type="checkbox"
                                        id={option}
                                        checked={isChecked}
                                        onChange={() => toggleOption(option)}
                                        className="cursor-pointer accent-blue-600"
                                    />
                                    <label
                                        htmlFor={option}
                                        className="cursor-pointer capitalize select-none w-full"
                                    >
                                        {option.replace(/_/g, ' ')}
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function RelatorioParticipantes({
    eventos,
    participantes = [],
    colunasSelecionadas: colunasIniciais = [],
    eventoSelecionado = '',
}: RelatorioParticipantesProps) {
    const [eventoId, setEventoId] = useState<string>(eventoSelecionado ? String(eventoSelecionado) : '');
    const [colunasSelecionadas, setColunasSelecionadas] = useState<string[]>(colunasIniciais);
    const [globalFilter, setGlobalFilter] = useState('');

    const colunasDisponiveis = [
        'nome',
        'cpf',
        'email',
        'telefone',
        'categoria_profissional',
        'numero_inscricao',
        'municipio',
        'instituicao',
        'status',
        'data_inscricao',
    ];

    const gerarRelatorio = () => {
        router.post(route('gerarRelatorio'), {
            evento_id: eventoId,
            colunas: colunasSelecionadas,
        });
    };

    //@ts-ignore
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        try {
            const response = await fetch(route('exportarExcel'), {
                method: 'POST',
                body: formData,
                headers: {
                    // @ts-ignore
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'relatorio_evento.xlsx';

            if (contentDisposition) {
                const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = match[1].replace(/['"]/g, '');
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    };



    const toggleColuna = (coluna: string) => {
        setColunasSelecionadas((prev) => (prev.includes(coluna) ? prev.filter((c) => c !== coluna) : [...prev, coluna]));
    };

    const columns = useMemo<ColumnDef<Participante>[]>(
        () =>
            colunasSelecionadas.map((coluna) => ({
                accessorKey: coluna,
                header: coluna.replace('_', ' ').toUpperCase(),
                cell: (info) => info.getValue(),
            })),
        [colunasSelecionadas],
    );

    const table = useReactTable({
        data: participantes,
        columns,
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <>
            <Head title="Relatórios" />
            <DefaultLayout className="flex flex-col gap-6">
                <h1 className="text-primary text-3xl font-bold dark:text-white">Relatório</h1>
                <div className="mb-6 space-y-2">
                    <div className="flex w-full flex-col items-center gap-4 lg:flex-row">
                        <div className="flex w-1/4 flex-col">
                            <label className="text-primary block font-semibold dark:text-white">Evento:</label>
                            <select
                                value={eventoId}
                                onChange={(e) => setEventoId(e.target.value)}
                                className="text-primary rounded-md bg-white p-2 shadow-md dark:bg-gray-800 dark:text-white"
                                required={true}
                            >
                                <option value="">Selecione um evento</option>
                                {eventos.map((evento) => (
                                    <option key={evento.id} value={evento.id}>
                                        {evento.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-1/4">
                            <label className="text-primary block font-semibold dark:text-white">Colunas:</label>
                            <MultiSelectDropdown options={colunasDisponiveis} selected={colunasSelecionadas} toggleOption={toggleColuna} />
                        </div>
                    </div>
                    <Button onClick={gerarRelatorio} className="w-1/6">
                        Gerar relatório
                    </Button>

                    {participantes.length > 0 && (
                        <>
                            <div className="mt-6">
                                {/* Filtro e tamanho da página */}
                                <div className="mb-4 flex items-center gap-4">
                                    <Input
                                        type="text"
                                        value={globalFilter ?? ''}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        placeholder="Buscar participante..."
                                    />

                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600 dark:text-white">Mostrar:</label>
                                        <select
                                            value={table.getState().pagination.pageSize}
                                            onChange={(e) => table.setPageSize(Number(e.target.value))}
                                            className="text-primary rounded-lg bg-white p-2 shadow-lg dark:border-white dark:bg-gray-800 dark:text-white"
                                        >
                                            {[5, 10, 20, 50].map((size) => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <form className="ml-auto" onSubmit={handleSubmit}>
                                        <input type="hidden" name="evento_id" value={eventoId} />
                                        {colunasSelecionadas.map((coluna, index) => (
                                            <input key={index} type="hidden" name="colunas[]" value={coluna} />
                                        ))}
                                        <Button
                                            type="submit"
                                            className="flex w-16 items-center justify-center bg-green-600 text-white hover:bg-green-700"
                                            title="Baixar excel"
                                        >
                                            <FaFileExcel />
                                        </Button>
                                    </form>
                                </div>

                                {/* Tabela */}
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
                        </>
                    )}
                </div>
            </DefaultLayout>
        </>
    );
}
