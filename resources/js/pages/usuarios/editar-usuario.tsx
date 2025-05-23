import DefaultLayout from '@/layouts/app/default-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Form from '@/components/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type Usuario = {
    id: number;
    nome: string;
    pode_acessar: boolean;
    role: string;
};

interface EditarUsuarioProps {
    usuario: Usuario;
}

export default function EditarUsuario({usuario}: EditarUsuarioProps) {
    const {data, setData, put } = useForm({
        nome: usuario.nome,
        pode_acessar: usuario.pode_acessar || false,
        role: usuario.role || '',
    });

    const [validationErrors, setValidationErrors] = useState(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        put(route('usuarioAtualizar', usuario), {
            onError: (errors) => {
                // @ts-ignore
                setValidationErrors(errors);
            },
        });

    };

    return(
        <>
            <Head title='Editar usuário'/>
            <DefaultLayout className='flex flex-col items-center justify-center gap-6'>
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
                <Form onSubmit={handleSubmit} >
                    <h1 className="text-primary text-lg dark:text-white">Usuário: {usuario.nome}</h1>
                    <div className='flex w-full flex-col justify-center gap-6 lg:flex-row lg:justify-between'>
                        <div className="w-full">
                            <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                                Usuário pode acessar o sistema:
                                <Select
                                    value={String(data.pode_acessar)}
                                    onValueChange={(value) => setData('pode_acessar', value === 'true')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pode acessar?" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Sim</SelectItem>
                                        <SelectItem value="false">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>
                            <br />
                            <label className="text-primary flex flex-col gap-2 text-sm dark:text-white">
                                Permissão do usuário:
                                <Select
                                    value={data.role}
                                    onValueChange={(value) => setData('role', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o perfil de acesso" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                        <SelectItem value="padrao">Padrão</SelectItem>
                                        <SelectItem value="visualizador">Visualizador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </label>
                        </div>
                    </div>
                    <Button type="submit">Salvar</Button>
                </Form>
            </DefaultLayout>
        </>
    );
}
