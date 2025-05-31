{{-- resources/views/emails/inscricao-realizada.blade.php --}}
@extends('emails.base')

@section('content')
    <h2>Inscrição realizada!</h2>

    <p>Olá {{ $participante->nome }},</p>

    <p>Sua inscrição foi realizada no evento <strong>{{ $evento->nome }}</strong>.</p>

    <p><strong>Data do Evento:</strong> {{ \Carbon\Carbon::parse($evento->data_inicio)->format('d/m/Y') }}</p>

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
