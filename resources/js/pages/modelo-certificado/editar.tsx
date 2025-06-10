import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import DefaultLayout from '@/layouts/app/default-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Form from '@/components/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Modelo {
    id: number;
    nome: string;
    imagem_fundo: string;
    conteudo: string;
}

interface EditarModeloProps {
    modelo: Modelo;
}

export default function Editar({ modelo }: EditarModeloProps) {
    const { data, setData, post } = useForm<{
        nome: string;
        imagem_fundo: File | null;
        conteudo: string;
    }>({
        nome: modelo.nome,
        conteudo: modelo.conteudo,
        imagem_fundo: null
    });

    const [imagemPreview, setImagemPreview] = useState<string | null>(
        `/storage/${modelo.imagem_fundo}`
    );

    const [validationErrors, setValidationErrors] = useState(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('modeloUpdate', modelo.id), {
            //@ts-ignore
            data: {
                ...data,
                _method: 'put',
            },
            onError: (errors) => {
                // @ts-ignore
                setValidationErrors(errors);
            },
            forceFormData: true,
        });
    };


    const MAX_FILE_SIZE_MB = 100;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > MAX_FILE_SIZE_MB) {
                setValidationErrors({
                    //@ts-ignore
                    imagem_fundo: [`O arquivo não pode ultrapassar ${MAX_FILE_SIZE_MB}MB.`],
                });
                e.target.value = '';
                return;
            }

            setValidationErrors(null);
            setData('imagem_fundo', file);
            setImagemPreview(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <Head title="Editar modelo de certificado" />
            <DefaultLayout className="flex flex-col items-center justify-center gap-6">
                <h1 className="text-primary text-lg dark:text-white">Editar modelo de certificado</h1>

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

                {data.conteudo && (
                    <Alert variant="info">
                        <AlertTitle variant="info">Conteúdo do certificado</AlertTitle>
                        <AlertDescription>
                            Atenção, você deve colocar {`{participante.nome} {evento.nome}`} e afins para poder puxar os dados corretos.
                        </AlertDescription>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        label="Nome do modelo: *"
                        placeholder="Nome do modelo"
                        required
                        value={data.nome}
                        onChange={(e) => setData('nome', e.target.value)}
                    />

                    <label htmlFor="conteudo" className="text-primary flex flex-col gap-2 dark:text-white">
                        Conteúdo do modelo: *
                        <textarea
                            value={data.conteudo}
                            onChange={(e) => setData('conteudo', e.target.value)}
                            name="conteudo"
                            className="w-full rounded-md border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            rows={4}
                            placeholder="Digite o conteúdo aqui..."
                            required
                        ></textarea>
                    </label>

                    <Input
                        className="file:bg-primary hover:file:bg-primary-foreground transition-colors duration-200 file:rounded-md file:border-0 file:px-4 file:text-sm file:font-semibold file:text-white"
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        name="imagem_fundo"
                        id="imagem_fundo"
                        onChange={handleFileChange}
                    />

                    <Button type="submit">Salvar alterações</Button>
                </Form>

                {data.conteudo && (
                    <div className="w-full max-w-4xl border rounded-md overflow-hidden mt-6">
                        <h2 className="text-lg font-semibold mb-2 text-primary dark:text-white">Pré-visualização do certificado</h2>
                        <div className="relative w-full aspect-video border shadow-md">
                            {imagemPreview ? (
                                <img
                                    src={imagemPreview}
                                    alt="Imagem de fundo"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                                    Nenhuma imagem selecionada
                                </div>
                            )}
                            <div className="absolute inset-0 p-8 flex items-center justify-center text-center">
                                <p className="text-xl font-serif whitespace-pre-wrap text-black bg-white/70 p-4 rounded">
                                    {data.conteudo}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </DefaultLayout>
        </>
    );
}
