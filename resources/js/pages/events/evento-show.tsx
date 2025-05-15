import { Head, usePage } from '@inertiajs/react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import EventoDetalhes from '@/components/ui/show-evento';

type Atividades = {
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
    atividades: Atividades[];
    link_liberado: boolean;
    qr_code_gerado: boolean;
    qr_code_base64: string;
    ativo: boolean;
}

export default function EventoShow() {
    // @ts-ignore
    const { flash, evento, app_url }: { flash: Record<string, any>; evento: Evento } = usePage().props;
    const successMessage = flash?.success;

    console.log(app_url);

    const alertType = (['success', 'error', 'warning', 'info'].find(type => type in (flash || {})) || 'success') as 'success' | 'error' | 'warning' | 'info';

    return (
        <>
            <Head title={`Visualizar evento ID: ${evento?.id}`} />
            <DefaultLayout>
                {successMessage && (
                    // @ts-ignore
                    <Alert className='justify-self-center' variant={alertType}>
                        <AlertTitle variant={alertType}>Sucesso</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )}

                <EventoDetalhes evento={evento} app_url={app_url} />
            </DefaultLayout>
        </>
    );
}
