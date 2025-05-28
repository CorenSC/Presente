import { FaCalendarAlt, FaClock, FaLink, FaMapMarkerAlt, FaQrcode } from 'react-icons/fa';
import { BiSolidEdit  } from "react-icons/bi";
import { Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ClipboardCopy, Download } from 'lucide-react';
import { formatarDataBrasileira } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FaChartBar } from "react-icons/fa";

type Atividade = {
    nome: string;
    data: string;
    hora_inicio: string;
    hora_fim: string;
}
interface Evento {
    id: number;
    nome: string;
    local_do_evento: string;
    data_inicio: string;
    data_fim: string;
    hora_inicio: string;
    hora_fim: string;
    descricao: string;
    atividades: Atividade[];
    link_liberado: boolean;
    qr_code_gerado: boolean;
    qr_code_base64: string;
    ativo:boolean;
}

const formatTime = (time: string | undefined) => {
    if (!time) return time;
    return time.slice(0, 5);
};

export default function EventoDetalhes({ evento, app_url }: { evento: Evento; app_url: string }) {
    const [openModal, setOpenModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState(null);

    const gerarQrCode = () => {
        put(route('liberarQrCode', { evento }), {
            onError: (errors) => {
                // @ts-ignore
                setValidationErrors(errors);
            },
        });
    };

    const { data, setData, put, get } = useForm({
        cadastro_abertura: '',
        cadastro_encerramento: '',
    });
    const editarEvento = (e: FormEvent) => {
        e.preventDefault();
        get(route('editarEvento', evento.id), {});
    };

    const handleConfirmarLink = () => {
        put(route('liberarLinkCadastro', evento.id), {
            onSuccess: () => {
                setValidationErrors(null);
                setOpenModal(false);
            },
            onError: (errors) => {
                // @ts-ignore
                setValidationErrors(errors);
                setOpenModal(false);
            },
        });
    };

    return (
        <div className="text-primary mx-auto mt-12 max-w-4xl space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl dark:border-none dark:bg-gray-800 dark:text-white">
            {validationErrors && (
                <Alert className="justify-self-center lg:w-full">
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
            )}
            {evento.link_liberado && (
                <Alert className="justify-self-center lg:w-full" variant="info">
                    <AlertTitle variant="info">Link para se cadastrar no evento</AlertTitle>
                    <AlertDescription className="flex items-center gap-4">
                        {app_url}/evento/formulario-cadastro/{evento.id}
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(`${app_url}/evento/formulario-cadastro/${evento.id}`);
                            }}
                            className="w-10 px-2 py-1"
                            title="Copiar"
                        >
                            <ClipboardCopy className="w-5" />
                        </Button>
                    </AlertDescription>
                </Alert>
            )}
            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold tracking-tight">{evento.nome}</h1>
                <p className="text-sm">Descrição do evento: {evento.descricao}</p>
                <p className="text-sm">ID: {evento.id}</p>
            </div>

            <div className="grid w-full grid-cols-2 items-start gap-6 md:grid-cols-3 lg:ms-8">
                <InfoItem icon={<FaMapMarkerAlt />} label="Local" value={evento.local_do_evento || ''} />
                <InfoItem icon={<FaCalendarAlt />} label="Data início" value={formatarDataBrasileira(evento.data_inicio) || ''} />
                <InfoItem icon={<FaCalendarAlt />} label="Data fim" value={formatarDataBrasileira(evento.data_fim) || ''} />
                <InfoItem icon={<FaClock />} label="Hora início" value={formatTime(evento.hora_inicio) || ''} />
                <InfoItem icon={<FaClock />} label="Hora fim" value={formatTime(evento.hora_fim) || ''} />
                <br />
                {evento.qr_code_base64 && (
                    <div className="">
                        <div className="flex flex-col items-center rounded-lg border p-4 shadow-md dark:border-gray-700">
                            <p className="mb-2 text-sm font-medium">QR Code de confirmação </p>
                            <img src={`data:image/png;base64,${evento.qr_code_base64}`} alt="QR Code do evento" className="h-32 w-32" />
                        </div>
                    </div>
                )}
            </div>

            {evento.atividades && evento.atividades.length > 0 && (
                <div className="pt-6">
                    <h2 className="mb-4 text-xl font-semibold">Atividades</h2>
                    <div className="space-y-4">
                        {evento.atividades.map((atividade, index) => (
                            <div key={index} className="rounded-lg border p-4 dark:border-gray-700">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-sm font-medium">Nome:</p>
                                        <p>{atividade.nome}</p>
                                    </div>
                                    <div>
                                        <InfoItem icon={<FaCalendarAlt />} label="Data" value={formatarDataBrasileira(atividade.data) || ''} />
                                    </div>
                                    <div>
                                        <InfoItem icon={<FaClock />} label="Hora início" value={formatTime(atividade.hora_inicio) || ''} />
                                    </div>
                                    <div>
                                        <InfoItem icon={<FaClock />} label="Hora fim" value={formatTime(atividade.hora_fim) || ''} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col justify-center gap-6 pt-4 lg:flex-row">
                {!evento.link_liberado && (
                    <Dialog open={openModal} onOpenChange={setOpenModal}>
                        <DialogTrigger asChild>
                            <button className="bg-primary hover:bg-primary-foreground flex cursor-pointer items-center justify-around gap-3 rounded-xl px-6 py-3 text-white shadow-lg transition-all duration-200 active:scale-95">
                                <FaLink className="text-lg" />
                                <span className="text-sm font-medium">Gerar link de cadastro</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Definir datas de duração do cadastro</DialogTitle>
                            </DialogHeader>

                            <div className="flex flex-col gap-4 py-4">
                                <div>
                                    <label className="text-sm">Data início</label>
                                    <Input
                                        type="date"
                                        value={data.cadastro_abertura}
                                        onChange={(e) => setData('cadastro_abertura', e.target.value)}
                                        required={true}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm">Data fim</label>
                                    <Input
                                        type="date"
                                        value={data.cadastro_encerramento}
                                        onChange={(e) => setData('cadastro_encerramento', e.target.value)}
                                        required={true}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button onClick={handleConfirmarLink}>Confirmar e gerar link</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                {!evento.qr_code_gerado && evento.link_liberado && (
                    <button
                        onClick={gerarQrCode}
                        className="flex cursor-pointer items-center justify-around gap-3 rounded-xl bg-[#295180] px-6 py-3 text-white shadow-lg transition-all duration-200 hover:bg-[#1d416a] active:scale-95"
                    >
                        <FaQrcode className="text-lg" />
                        <span className="text-sm font-medium">Gerar QrCode</span>
                    </button>
                )}
                {evento.qr_code_gerado && (
                    <a
                        href={`data:image/png;base64,${evento.qr_code_base64}`}
                        download={`evento_${evento.nome}_qrCode.png`}
                        className={
                            'flex cursor-pointer items-center justify-around gap-3 rounded-xl bg-green-600/80 px-6 py-3 text-white shadow-lg transition-all duration-200 hover:bg-green-700 active:scale-95'
                        }
                    >
                        <Download />
                        Baixar QrCode
                    </a>
                )}
                {evento.ativo && (
                    <button
                        onClick={editarEvento}
                        className="flex cursor-pointer items-center justify-around gap-3 rounded-xl bg-yellow-600/80 px-6 py-3 text-white shadow-lg transition-all duration-200 hover:bg-yellow-700 active:scale-95"
                    >
                        <BiSolidEdit className="text-xl" />
                        <span className="text-sm font-medium">Editar</span>
                    </button>
                )}
                <Link
                    href={route('detalhesEvento', evento.id)}
                    className="flex cursor-pointer items-center justify-around gap-3 rounded-xl bg-gray-600/80 px-6 py-3 text-white shadow-lg transition-all duration-200 hover:bg-gray-700 active:scale-95"
                >
                    <FaChartBar className="text-xl" />
                    <span className="text-sm font-medium">Mais detalhes</span>
                </Link>
            </div>
        </div>
    );
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-4">
        <div className="text-primary flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl shadow-sm">{icon}</div>
        <div>
            <p className="text-sm">{label}</p>
            <p className="text-base font-medium">{value}</p>
        </div>
    </div>
);
