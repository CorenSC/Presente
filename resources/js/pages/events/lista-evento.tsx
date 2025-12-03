import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import DefaultLayout from '@/layouts/app/default-layout';
import { formatarDataBrasileira } from '@/lib/utils';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Eye, Import, SquarePen, StepBack, StepForward, Trash } from 'lucide-react';
import { useState } from 'react';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [eventoId, setEventoId] = useState<number | null>(null);
    const [validationErrors, setValidationErrors] = useState(null);

    const { props } = usePage();
    //@ts-ignore
    const message = props.flash?.success;

    const handleImportSubmit = (eventoId: number) => {
        setValidationErrors(null); // limpa antes de enviar
        const fileInput = document.getElementById('arquivo') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        const formData = new FormData();
        // @ts-ignore
        formData.append('arquivo', file);
        formData.append('evento_id', eventoId.toString());

        router.post(route('importarParticipantes'), formData, {
            forceFormData: true,
            onError: (errors) => {
                // @ts-ignore
                setValidationErrors(errors);
            },
            onSuccess: () => {
                setValidationErrors(null);
            },
        });
    };

    const MAX_FILE_SIZE_MB = 100;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const fileSizeMB = file.size / (1024 * 1024); // Converte bytes para MB

            if (fileSizeMB > MAX_FILE_SIZE_MB) {
                setValidationErrors({
                    //@ts-ignore
                    arquivo: [`O arquivo não pode ultrapassar ${MAX_FILE_SIZE_MB}MB.`],
                });
                e.target.value = ''; // Limpa o input
            } else {
                setValidationErrors(null); // Limpa os erros se estiver tudo certo
            }
        }
    };

    const columns: ColumnDef<Evento>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'nome', header: 'Nome do Evento' },
        { accessorKey: 'local_do_evento', header: 'Local' },
        {
            accessorKey: 'data_inicio',
            header: 'Data início',
            cell: (info) => formatarDataBrasileira(info.getValue() as string),
        },
        {
            accessorKey: 'data_fim',
            header: 'Data fim',
            cell: (info) => formatarDataBrasileira(info.getValue() as string),
        },
        {
            accessorKey: 'hora_inicio',
            header: 'Hora início',
            cell: (info) => (info.getValue() as string).slice(0, 5),
        },
        {
            accessorKey: 'qr_code_gerado',
            header: 'QrCode de confirmação',
            cell: (info) => (info.getValue() ? 'Gerado' : 'Inativo'),
        },
        {
            accessorKey: 'link_liberado',
            header: 'Link para cadastro',
            cell: (info) => (info.getValue() ? 'Ativo' : 'Inativo'),
        },
        {
            accessorKey: 'ativo',
            header: 'Evento ativo',
            cell: (info) => (info.getValue() ? 'Ativo' : 'Inativo'),
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
                            className="bg-primary hover:bg-primary-foreground flex cursor-pointer items-center justify-center rounded px-3 py-1 font-semibold text-white shadow-2xl transition-all active:scale-95"
                        >
                            <Eye className="w-5" />
                        </Link>

                        {evento.ativo && (
                            <Link
                                href={route('editarEvento', evento.id)}
                                alt="Editar"
                                title={'Editar'}
                                className="cursor-pointer items-center justify-center rounded bg-yellow-600/80 px-3 py-1 font-semibold text-white shadow-2xl transition-all hover:bg-yellow-700 active:scale-95"
                            >
                                <SquarePen className="w-5" />
                            </Link>
                        )}

                        {evento.ativo && (
                            <>
                                <Button
                                    className="w-11 bg-red-700 px-3 py-1 hover:bg-red-800"
                                    title="Inativar"
                                    onClick={() => {
                                        setEventoId(evento.id);
                                        setIsModalOpen(true);
                                    }}
                                >
                                    <Trash className="w-5" />
                                </Button>
                            </>
                        )}
                        {evento.ativo && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button title="Importar excel" className="w-11 bg-green-700 px-3 py-1 hover:bg-green-800">
                                        <Import className="w-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Importar participantes</DialogTitle>
                                    </DialogHeader>

                                    <div className="flex flex-col gap-4 py-4">
                                        <Input
                                            className="file:bg-primary hover:file:bg-primary-foreground transition-colors duration-200 file:rounded-md file:border-0 file:px-4 file:text-sm file:font-semibold file:text-white"
                                            type="file"
                                            accept=".xlsx, .xls"
                                            name='arquivo'
                                            id='arquivo'
                                            required={true}
                                            onChange={handleFileChange}
                                        />
                                        <a href='/exemplo_excel.xlsx' download className='text-sm text-blue-600 hover:underline'>Baixar o modelo de exemplo</a>
                                    </div>

                                    <DialogFooter>
                                        <Button onClick={() => handleImportSubmit(evento.id)}>Importar</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {!evento.ativo && (
                            <Button
                                onClick={() => router.post(route('eventosLiberarCertificados', evento.id))}
                            >
                                Liberar certificados
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
            const evento = eventos.find((e) => e.id === eventoId);
            if (evento) {
                router.put(
                    route('inativarEvento', evento),
                    {},
                    {
                        onFinish: () => {
                            setIsModalOpen(false);
                        },
                    },
                );
            }
        }
    };

    return (
        <>
            <Head title="Lista de eventos" />
            <DefaultLayout>
                <div className="p-6">
                    <h2 className="text-primary mb-4 text-2xl font-bold dark:text-white">Lista de eventos</h2>

                    {validationErrors && (
                        <>
                            <Alert>
                                <AlertTitle>Erros de Validação</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-4">
                                        {Object.values(validationErrors).map((error, index) => (
                                            // @ts-ignore
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                            <br/>
                        </>
                    )}

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
                            placeholder="Buscar evento..."
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

                    {eventos.length === 0 && (
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

            {/* Modal de confirmação */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar inativação</DialogTitle>
                        <DialogDescription>Tem certeza de que deseja inativar este evento?</DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-8">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleInativarEvento} className="bg-red-800 hover:bg-red-900">
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default ListaEvento;
