import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table';
import { formatarDataBrasileira } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Eye, StepBack, StepForward, SquarePen, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type Evento = {
    id: number;
    nome: string;
    data_inicio: string;
    data_fim: string;
    local_do_evento: string;
    hora_inicio: string;
    hora_fim: string;
    ativo: boolean;
    link_liberado: boolean;
    qr_code_gerado: boolean;
};

function ListaEvento() {
    const { eventos } = usePage().props as unknown as { eventos: Evento[] };
    const [globalFilter, setGlobalFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar a modal
    const [eventoId, setEventoId] = useState<number | null>(null); // Guardar o id do evento para inativar

    const { props } = usePage();
    //@ts-ignore
    const message = props.flash?.success;

    const columns: ColumnDef<Evento>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'nome', header: 'Nome do Evento' },
        { accessorKey: 'local_do_evento', header: 'Local' },
        {
            accessorKey: 'data_inicio',
            header: 'Data início',
            cell: info => formatarDataBrasileira(info.getValue() as string),
        },
        {
            accessorKey: 'data_fim',
            header: 'Data fim',
            cell: info => formatarDataBrasileira(info.getValue() as string),
        },
        {
            accessorKey: 'hora_inicio',
            header: 'Hora início',
            cell: info => (info.getValue() as string).slice(0, 5),
        },
        {
            accessorKey: 'qr_code_gerado',
            header: 'QrCode de confirmação',
            cell: info => (info.getValue() ? 'Gerado' : 'Inativo' ),
        },
        {
            accessorKey: 'link_liberado',
            header: 'Link para cadastro',
            cell: info => (info.getValue() ? 'Ativo' : 'Inativo'),
        },
        {
            accessorKey: 'ativo',
            header: 'Evento ativo',
            cell: info => (info.getValue() ? 'Ativo' : 'Inativo'),
        },
        {
            id: 'acoes',
            header: 'Ações',
            cell: ({ row }) => {
                const evento = row.original;
                return (
                    <div className="flex gap-2">
                        <Link
                            href={route('eventoShow', evento.id)}
                            alt="Visualizar"
                            title="Visualizar"
                            className="bg-primary hover:bg-primary-foreground cursor-pointer rounded flex items-center justify-center px-3 py-1 font-semibold text-white shadow-2xl transition-all active:scale-95"
                        >
                            <Eye className='w-5' />
                        </Link>

                        <Link
                            href={ route('editarEvento', evento.id) }
                            alt="Editar"
                            title={'Editar'}
                            className="cursor-pointer rounded bg-yellow-600/80 items-center justify-center px-3 py-1 font-semibold text-white shadow-2xl transition-all hover:bg-yellow-700 active:scale-95"
                        >
                            <SquarePen className='w-5' />
                        </Link>

                        {evento.ativo && (
                            <Button
                                className="bg-red-700 hover:bg-red-800 px-3 py-1 w-11"
                                title="Inativar"
                                onClick={() => {
                                    setEventoId(evento.id);
                                    setIsModalOpen(true);
                                }}
                            >
                                <Trash className="w-5" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
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

    const handleInativarEvento = () => {
        if (eventoId !== null) {
            const evento = eventos.find(e => e.id === eventoId);
            if (evento) {
                // Enviar requisição PUT para inativar o evento, passando o evento completo
                router.put(route('inativarEvento', evento), {}, {
                    onFinish: () => {
                        setIsModalOpen(false); // Fecha a modal após a ação
                    }
                });
            }
        }
    };

    return (
        <>
            <Head title="Lista de eventos" />
            <DefaultLayout>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-primary dark:text-white">Lista de eventos</h2>

                    {message && (
                        <Alert variant="success" className="mb-6">
                            <AlertTitle variant="success" className="text-lg font-bold">Sucesso!</AlertTitle>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="mb-4 flex items-center gap-4">
                        <Input
                            type='text'
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Buscar evento..."
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
                    </div>

                    {eventos.length === 0 && (
                        <div className='flex items-center justify-center'>
                            <Alert variant={'warning'} className='mb-6'>
                                <AlertTitle variant={'warning'} className='text-lg font-bold'>Ainda não temos evento cadastrados</AlertTitle>
                            </Alert>
                        </div>
                    )}
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
                            <tbody className=" bg-white text-primary divide-y divide-gray-200 dark:bg-gray-800 dark:text-white">
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

            {/* Modal de confirmação */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar inativação</DialogTitle>
                        <DialogDescription>
                            Tem certeza de que deseja inativar este evento?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className='mt-8'>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleInativarEvento} className='bg-red-800 hover:bg-red-900'>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ListaEvento;
