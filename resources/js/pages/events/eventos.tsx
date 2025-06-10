import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DefaultLayout from '@/layouts/app/default-layout';
import { Head, Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function Eventos() {
    const [openDropdown, setOpenDropdown] = useState(false);
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
                        <div className="relative w-2/3 lg:w-1/3">
                            <button
                                onClick={() => setOpenDropdown(!openDropdown)}
                                className='p-2 rounded-md shadow-md h-8 bg-primary text-white text-sm w-full flex items-center justify-between hover:bg-primary-foreground hover:shadow-lg transition-all'>
                                Modelos de certificado
                                <ChevronDown className="ml-2 w-4 h-4" />
                            </button>

                            {openDropdown && (
                                <div
                                    className="absolute top-full mt-2 w-full bg-white rounded-md shadow-md z-10 border">
                                    <Link
                                        href={route('modeloCertificado')}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Criar modelo certificado
                                    </Link>
                                    <Link
                                        href={route('modeloCertificadoLista')}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Listar modelos de certificado
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </DefaultLayout>
        </>
    );
}
