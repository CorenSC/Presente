<?php

namespace App\Mail;

use App\Models\Evento;
use App\Models\Participante;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InscricaoRealizadaMail extends Mailable
{
    use Queueable, SerializesModels;

    public $participante;
    public $evento;

    /**
     * Create a new message instance.
     */
    public function __construct(
        Participante $participante,
        Evento $evento
    )
    {
        $this->participante = $participante;
        $this->evento = $evento;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Inscrição realizada!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.inscricao-realizada',
            with: [
                'participante' => $this->participante,
                'evento' => $this->evento,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
