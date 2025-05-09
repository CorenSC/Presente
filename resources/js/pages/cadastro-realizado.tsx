import { Head } from '@inertiajs/react';
import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Participante = {
    nome: string
};

interface ParticipanteProps {
    participante: Participante;
}
export default function CadastroRealizado({participante}: ParticipanteProps) {
    return (
        <>
            <Head title='Cadastro realizado'/>
            <DefaultFormCadastro>
                <Alert>
                    <AlertTitle>Cadastro realizado!</AlertTitle>
                    <AlertDescription>Parabéns: {participante.nome}, seu cadastro foi realizado com sucesso!</AlertDescription>
                </Alert>

            </DefaultFormCadastro>
        </>
    );
}
