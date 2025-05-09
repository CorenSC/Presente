import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DefaultLayout from '@/layouts/app/default-layout';
import { Head, Link } from '@inertiajs/react';

export default function Eventos() {
    return (
        <>
            <Head title="Eventos" />
            <DefaultLayout className='flex items-center justify-center p-2'>
                <Card className="mx-0 px-6 h-40 lg:px-0">
                    <CardHeader>
                        <CardTitle>Eventos</CardTitle>
                    </CardHeader>
                    <CardContent className='flex-1 flex flex-col items-center gap-6 justify-center lg:flex-row'>
                        <Link
                            href={route('listarEventos')}
                            className='p-2 rounded-md shadow-md w-2/3 lg:w-1/3 h-8 bg-primary text-white text-sm flex items-center justify-center hover:bg-primary-foreground hover:shadow-lg transition-all'>
                            Listar eventos
                        </Link>
                        <Link
                            href={route('criarEvento')}
                            className='p-2 rounded-md shadow-md w-2/3 lg:w-1/3 h-8 bg-primary text-white text-sm flex items-center justify-center hover:bg-primary-foreground hover:shadow-lg transition-all'>
                            Criar evento
                        </Link>
                    </CardContent>
                </Card>
            </DefaultLayout>
        </>
    );
}
