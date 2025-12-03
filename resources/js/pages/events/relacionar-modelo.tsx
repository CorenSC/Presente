import Form from '@/components/form';
import { Button } from '@/components/ui/button';
import DefaultLayout from '@/layouts/app/default-layout';
import { Head, useForm } from '@inertiajs/react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RelacionarModelo({ evento, modelos }: any) {
    const { data, setData, put, processing } = useForm({
        certificado_modelo_id: evento.certificado_modelo_id?.toString() || '',
    });

    const [validationErrors, setValidationErrors] = useState(null);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('eventosAtualizarModelo', evento.id), {
            onError: (errors) => {
                // @ts-ignore
                setValidationErrors(errors);
            },
        });
    };


    return (
        <>
            <Head title="Relacionar certificado" />
            <DefaultLayout className="flex flex-col items-center justify-center gap-6">
                <h1 className="text-primary text-2xl font-bold dark:text-white">Relacionar modelo do certificado ao evento: {evento.nome}</h1>

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
                <Form onSubmit={handleSubmit} className="">
                        <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                            Selecionar Modelo
                            <Select
                                value={data.certificado_modelo_id}
                                onValueChange={(value) => {
                                    setData('certificado_modelo_id', value === 'nenhum' ? null : value);
                                }}
                            >
                                <SelectTrigger className="text-primary mb-4 w-full rounded border-none bg-white p-2 text-sm shadow dark:bg-gray-800 dark:text-white">
                                    <SelectValue placeholder="--Selecione--" />
                                </SelectTrigger>
                                <SelectContent>
                                    {modelos.map((modelo: any) => (
                                        <SelectItem key={modelo.id} value={modelo.id.toString()}>
                                            {modelo.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </label>

                    <Button disabled={processing} type="submit">
                        Salvar
                    </Button>
                </Form>
            </DefaultLayout>
        </>
    );
}
