import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DefaultLayout from '@/layouts/app/default-layout';
import Form from '@/components/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ValidarHash() {
    const { data, setData, post, processing, reset} = useForm({
        hash: ''
    });
    const [validationErrors, setValidationErrors] = useState(null);

    const { flash } = usePage().props;
    // @ts-ignore
    const successMessage = flash?.success;

    // @ts-ignore
    const alertType = (['success', 'error', 'warning', 'info'].find(type => type in (flash || {})) || 'success') as 'success' | 'error' | 'warning' | 'info';

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        post(route('validarHash'), {
            onSuccess: () => {
                reset(); // limpa o input
            },
            onError: (errors) => {
                // @ts-ignore
                setValidationErrors(errors);
            },
        });
    };

    // @ts-ignore
    return (
        <>
            <Head title={'Validar hash'}/>
            <DefaultLayout className={'flex flex-col items-center justify-center gap-6'}>
                <h1 className="text-primary font-bold text-lg dark:text-white">Validar Hash de Evento</h1>

                {validationErrors && (
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
                )}

                {successMessage && (
                    // @ts-ignore
                    <Alert className='justify-self-center' variant={alertType}>
                        <AlertTitle variant={alertType}>Sucesso</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Input
                        type='text'
                        label='Hash: *'
                        placeholder='e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                        required={true}
                        value={data.hash}
                        onChange={(e) => setData('hash', e.target.value)}
                    />
                    <Button
                        type='submit'
                        disabled={processing}
                    >
                        Validar
                    </Button>
                </Form>

            </DefaultLayout>
        </>
    )
}
