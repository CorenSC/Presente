<?php

namespace App\Http\Controllers;

use App\Mail\OtpCodeMail;
use App\Models\OtpCode;
use App\Models\Participante;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class ParticipanteAuthController extends Controller
{
    public function showLogin()
    {
        return inertia('participante/login');
    }

    public function checkCpf(Request $request)
    {
        $request->validate([
            'cpf' => 'required|string|size:14',
        ]);

        $participant = Participante::where('cpf', $request->cpf)->first();

        if (!$participant) {
            return back()->withErrors(['cpf' => 'CPF não encontrado.']);
        }

        // Gerar novo OTP
        $otp = rand(100000, 999999);

        // Criar um novo registro de OTP
        OtpCode::create([
            'participante_id' => $participant->id,
            'code' => $otp,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($participant->email)->send(new OtpCodeMail($otp));

        // Salva ID do participante na sessão para o próximo passo
        Session::put('participant_id', $participant->id);

        return Inertia::render('participante/login', [
            'participantEmail' => $participant->email,
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|digits:6',
        ]);

        $participantId = Session::get('participant_id');

        $otp = OtpCode::where('participante_id', $participantId)
            ->where('code', $request->otp)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$otp) {
            return redirect()
                ->route('participanteLogin')
                ->withErrors(['otp' => 'Código inválido ou expirado.']);
        }

        // Marcar como usado
        $otp->update(['used_at' => now()]);

        $participant = Participante::find($participantId);
        Auth::guard('participante')->login($participant);

        return redirect()->route('participanteEventos'); // Crie essa rota conforme necessário
    }

    public function resendOtp(Request $request)
    {
        $participantId = Session::get('participant_id');

        if (!$participantId) {
            return redirect()->route('participanteLogin')->withErrors(['otp' => 'Sessão expirada. Faça login novamente.']);
        }

        $participant = Participante::find($participantId);

        if (!$participant) {
            return redirect()->route('participanteLogin')->withErrors(['otp' => 'Participante não encontrado.']);
        }

        $otp = rand(100000, 999999);

        OtpCode::create([
            'participante_id' => $participant->id,
            'code' => $otp,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($participant->email)->send(new OtpCodeMail($otp));

        return redirect()->route('participanteLogin')->with([
            'status' => 'Código reenviado com sucesso.',
            'participantEmail' => $participant->email,
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('participante')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->intended('showLogin');
    }


}
