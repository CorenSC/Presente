import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DefaultFormCadastro from '@/layouts/app/default-form-cadastro';
import { cn, formatCPF } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    if (!user || !domain) return email;

    if (user.length <= 2) {
        return user[0] + '***@' + domain;
    }

    return user[0] + '***' + user.slice(-1) + '@' + domain;
}

function OtpInput({ length, value, onChange }: { length: number; value: string; onChange: (otp: string) => void }) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const val = e.target.value.replace(/\D/g, '');

        if (!val) {
            const newOtp = value.split('');
            newOtp[idx] = '';
            onChange(newOtp.join(''));
            return;
        }

        const newOtp = value.split('');
        newOtp[idx] = val[0];
        onChange(newOtp.join(''));

        if (idx < length - 1 && val) {
            inputsRef.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === 'Backspace' && !value[idx] && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
    };

    return (
        <div className="flex justify-center gap-2">
            {Array(length)
                .fill(0)
                .map((_, idx) => (
                    <input
                        key={idx}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="text-primary h-12 w-12 rounded-lg border border-gray-300 text-center text-xl focus:border-blue-500 focus:ring focus:outline-none sm:h-14 sm:w-14 dark:border-gray-700 dark:bg-zinc-800 dark:text-white"
                        value={value[idx] || ''}
                        onChange={(e) => handleChange(e, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        // @ts-ignore
                        ref={(el) => (inputsRef.current[idx] = el)}
                        autoComplete="one-time-code"
                    />
                ))}
        </div>
    );
}

function Stepper({ step }: { step: number }) {
    const steps = ['CPF', 'Código'];

    return (
        <div className="relative mb-6 w-full max-w-md px-4 sm:px-0">
            <div className="flex items-center justify-between">
                {steps.map((label, index) => {
                    const isCompleted = step > index + 1;
                    const isActive = step === index + 1;

                    return (
                        <div key={label} className="relative flex flex-1 flex-col items-center">
                            <div
                                className={cn(
                                    'z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                                    isCompleted
                                        ? 'border-green-600 bg-green-600 text-white'
                                        : isActive
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-zinc-800',
                                )}
                            >
                                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                            </div>
                            <span
                                className={cn(
                                    'mt-2 text-center text-xs',
                                    isCompleted || isActive ? 'text-primary font-semibold dark:text-white' : 'text-gray-400',
                                )}
                            >
                                {label}
                            </span>

                            {index !== steps.length - 1 && (
                                <div className="absolute top-5 left-1/2 z-0 h-0.5 w-full bg-gray-300 dark:bg-gray-600">
                                    <div
                                        className="bg-primary h-full transition-all duration-500"
                                        style={{
                                            width: step > index + 1 ? '100%' : step === index + 1 ? '50%' : '0%',
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function Login() {
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [showResendSuccess, setShowResendSuccess] = useState(false);

    const cpfForm = useForm({ cpf: '' });
    const otpForm = useForm({ otp: '' });

    useEffect(() => {
        if (step === 2) {
            setResendTimer(60);
            setCanResend(false);

            const interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [step]);

    const handleCpfSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        cpfForm.post('/participante/login/cpf', {
            preserveScroll: true,
            onSuccess: (page) => {
                const emailFromResponse = page.props.participantEmail;
                if (emailFromResponse) {
                    // @ts-ignore
                    setUserEmail(emailFromResponse);
                }
                setStep(2);
            },
        });
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        otpForm.post('/participante/login/otp', {
            onSuccess: () => {
                // Redirecionamento ou qualquer outra ação pós-login
            },
        });
    };

    const handleResendCode = () => {
        if (!canResend) return;

        otpForm.post('/participante/login/resend-otp', {
            onSuccess: () => {
                setResendTimer(60);
                setCanResend(false);
                setShowResendSuccess(true);

                setTimeout(() => setShowResendSuccess(false), 4000);

                const interval = setInterval(() => {
                    setResendTimer((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            setCanResend(true);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            },
        });
    };

    return (
        <>
            <Head title="Login" />
            <DefaultFormCadastro className="flex flex-col items-center gap-6 px-4 py-8 sm:py-12">
                <h1 className="text-primary text-2xl font-bold dark:text-white">Login</h1>

                <Stepper step={step} />

                <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md transition-all sm:p-8 dark:bg-zinc-900">
                    {step === 1 && (
                        <form onSubmit={handleCpfSubmit} className="space-y-5">
                            <div>
                                <Input
                                    type="text"
                                    id="cpf"
                                    label="CPF (digite sem pontos e traços): *"
                                    required
                                    value={cpfForm.data.cpf}
                                    onChange={(e) => {
                                        const formatted = formatCPF(e.target.value);
                                        cpfForm.setData('cpf', formatted);
                                    }}
                                    autoComplete="off"
                                />
                                {cpfForm.errors.cpf && <p className="mt-1 text-sm text-red-500">{cpfForm.errors.cpf}</p>}
                            </div>
                            <Button type="submit" className="w-full flex justify-center items-center" disabled={cpfForm.processing}>
                                {cpfForm.processing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'Enviar código'
                                )}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleOtpSubmit} className="space-y-5">
                            <p className="mb-2 text-center text-sm text-gray-700 dark:text-gray-300">
                                Enviamos um código para o email <span className="font-semibold">{maskEmail(userEmail)}</span>
                            </p>

                            <p className="text-primary dark:text-primary-400 mb-6 text-center text-sm font-medium">Digite o código abaixo</p>

                            <OtpInput length={6} value={otpForm.data.otp} onChange={(otp) => otpForm.setData('otp', otp)} />

                            {otpForm.errors.otp && <p className="mt-1 text-sm text-red-500">{otpForm.errors.otp}</p>}

                            <div className="flex justify-between gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    disabled={otpForm.processing}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700"
                                >
                                    Voltar
                                </Button>
                                <Button type="submit" className="flex-1 flex justify-center items-center" disabled={otpForm.processing}>
                                    {otpForm.processing ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        'Entrar'
                                    )}
                                </Button>
                            </div>

                            <div className="mt-4 flex flex-col items-center justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={!canResend || otpForm.processing}
                                    onClick={handleResendCode}
                                    className="text-sm text-white disabled:text-gray-400 dark:disabled:text-gray-600 flex justify-center items-center"
                                >
                                    {otpForm.processing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : canResend ? (
                                        'Reenviar código'
                                    ) : (
                                        `Reenviar em ${resendTimer}s`
                                    )}
                                </Button>

                                {showResendSuccess && (
                                    <p className="text-sm text-green-600 transition-opacity duration-300 dark:text-green-400">
                                        Código reenviado com sucesso!
                                    </p>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </DefaultFormCadastro>
        </>
    );
}
