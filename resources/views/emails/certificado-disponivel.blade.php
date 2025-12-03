{{-- resources/views/emails/inscricao-realizada.blade.php --}}
@extends('emails.base')

@section('content')
    <h2>Certificado disponivel!</h2>

    <p>Olá {{ $participante->nome }},</p>

    <p>O seu certificado do evento <strong>{{ $evento->nome }}</strong> já está disponível!</p>

    <p>Você pode baixar seu certificado clicando no botão abaixo:</p>

    <a
        href="{{ config('app.url') }}/participante/login"
        style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #4F46E5;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-weight: 600;
        font-family: Arial, sans-serif;
    "
    >
        Conferir inscrição
    </a>


    <p>Esperamos você lá 👋</p>
@endsection
