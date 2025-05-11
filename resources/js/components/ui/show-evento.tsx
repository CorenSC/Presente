import { FaCalendarAlt, FaClock, FaLink, FaMapMarkerAlt, FaQrcode } from 'react-icons/fa';
import { BiSolidEdit  } from "react-icons/bi";
import { useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ClipboardCopy } from 'lucide-react';

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
}

const formatDate = (date: string | undefined) => {
    if (!date) return date;
    const formattedDate = new Date(date);
    return new Intl.DateTimeFormat('pt-BR').format(formattedDate);
};

const formatTime = (time: string | undefined) => {
    if (!time) return time;
    return time.slice(0, 5);
};

export default function EventoDetalhes({ evento }: { evento: Evento }) {


    const gerarQrCode = () => {
        alert(`QR Code gerado para o evento: ${evento.nome}`);
    };

    const { get, put } = useForm({});
    const editarEvento = (e: FormEvent) => {
        e.preventDefault();
        get(route('editarEvento', evento.id), {});
    };

    const gerarLinkCadastro = () => {
        if (evento) {
            put(route('liberarLinkCadastro', evento.id), {});
        }
    };

    return (
        <div className="mx-auto mt-12 max-w-4xl space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-xl text-primary dark:bg-gray-800 dark:text-white dark:border-none">
            {evento.link_liberado &&
                <Alert className="justify-self-center lg:w-full" variant="info">
                    <AlertTitle variant="info">Link para se cadastrar no evento</AlertTitle>
                        <AlertDescription className='flex gap-4 items-center'>localhost:8000/evento/formulario-cadastro/{evento.id}
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(`http://localhost:8000/evento/formulario-cadastro/${evento.id}`);
                            }}
                            className='px-2 py-1 w-10'
                            title='Copiar'
                        >
                            <ClipboardCopy className='w-5'/>
                        </Button>
                    </AlertDescription>
                </Alert>
            }
            <div className="space-y-2 text-center">
                <h1 className="text-4xl font-bold tracking-tight">{evento.nome}</h1>
                <p className="text-sm">Descrição do evento: {evento.descricao}</p>
                <p className="text-sm">ID: {evento.id}</p>
            </div>

            <div className="grid w-full gap-6 grid-cols-2 md:grid-cols-3 items-start lg:ms-8">

                <InfoItem icon={<FaMapMarkerAlt />} label="Local" value={evento.local_do_evento || ''} />
                <InfoItem icon={<FaCalendarAlt />} label="Data início" value={formatDate(evento.data_inicio) || ''} />
                <InfoItem icon={<FaCalendarAlt />} label="Data fim" value={formatDate(evento.data_fim) || ''} />
                <InfoItem icon={<FaClock />} label="Hora início" value={formatTime(evento.hora_inicio) || ''} />
                <InfoItem icon={<FaClock />} label="Hora fim" value={formatTime(evento.hora_fim) || ''} />

            </div>

            {evento.atividades && evento.atividades.length > 0 && (
                <div className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Atividades</h2>
                    <div className="space-y-4">
                        {evento.atividades.map((atividade, index) => (
                            <div key={index} className="border rounded-lg p-4 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Nome:</p>
                                        <p>{atividade.nome}</p>
                                    </div>
                                    <div>
                                        <InfoItem icon={<FaCalendarAlt />} label="Data" value={formatDate(atividade.data) || ''} />
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
                <button
                    onClick={gerarLinkCadastro}
                    className="flex items-center gap-3 justify-around rounded-xl bg-primary px-6 py-3 text-white shadow-lg transition-all duration-200 hover:bg-primary-foreground cursor-pointer active:scale-95"
                >
                    <FaLink className="text-lg" />
                    <span className="text-sm font-medium">Gerar link de cadastro</span>
                </button>
                <button
                    onClick={gerarQrCode}
                    className="flex items-center gap-3 justify-around rounded-xl bg-[#295180] px-6 py-3 text-white shadow-lg transition-all duration-200 hover:bg-[#1d416a] cursor-pointer active:scale-95"
                >
                    <FaQrcode className="text-lg" />
                    <span className="text-sm font-medium">Gerar QrCode</span>
                </button>
                <button
                    onClick={editarEvento}
                    className="flex items-center gap-3 justify-around rounded-xl bg-yellow-600/80 px-6 py-3 text-white shadow-lg transition-all duration-200 hover:bg-yellow-700 cursor-pointer active:scale-95"
                >
                    <BiSolidEdit className='text-xl'/>
                    <span className="text-sm font-medium">Editar</span>
                </button>
            </div>
        </div>
    );
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl text-primary shadow-sm">{icon}</div>
        <div>
            <p className="text-sm">{label}</p>
            <p className="text-base font-medium">{value}</p>
        </div>
    </div>
);
