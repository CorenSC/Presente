<?php

namespace App\Exports;

use App\Models\Participante;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use \PhpOffice\PhpSpreadsheet\Style\Border;
use \PhpOffice\PhpSpreadsheet\Style\Alignment;


class ParticipantesExport implements FromCollection, WithHeadings, WithStyles, WithColumnWidths, WithEvents
{
    protected $eventoId;
    protected $colunas;
    protected $sha256Token;

    public function __construct($eventoId, $colunas, $sha256Token)
    {
        $this->eventoId = $eventoId;
        $this->colunas = $colunas;
        $this->sha256Token = $sha256Token;
    }

    public function collection()
    {
        $participantes = Participante::whereHas('eventos', function ($query) {
            $query->where('evento_id', $this->eventoId);
        })
            ->with(['eventos' => function ($query) {
                $query->where('evento_id', $this->eventoId);
            }])
            ->get();

        return $participantes->map(function ($participante) {
            return collect($this->colunas)->map(function ($coluna) use ($participante) {
                if ($coluna === 'status') {
                    // Pega o status direto da tabela pivot
                    return $participante->eventos->first()->pivot->status ?? null;
                }
                if ($coluna === 'data_inscricao') {
                    // Pega o updated_at da tabela pivot e formata a data
                    $date = $participante->eventos->first()->pivot->updated_at ?? null;
                    return $date ? \Carbon\Carbon::parse($date)->format('d/m/Y H:i:s') : null;
                }
                // Para os demais campos, pega direto do participante
                return $participante->{$coluna};
            });
        });
    }


    public function headings(): array
    {
        return array_map(function ($coluna) {
            return ucwords(str_replace('_', ' ', $coluna));
        }, $this->colunas);
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF1E88E5'],
                ],
            ],
        ];
    }

    public function columnWidths(): array
    {
        $widths = [];
        foreach (range('A', 'Z') as $col) {
            $widths[$col] = 22;
        }
        return $widths;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $highestColumn = $sheet->getHighestColumn();
                $highestRow = $sheet->getHighestRow();
                $cellRange = "A1:{$highestColumn}{$highestRow}";

                // Estilo geral da tabela
                $sheet->getStyle($cellRange)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => 'FFAAAAAA'],
                        ],
                    ],
                    'alignment' => [
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'horizontal' => Alignment::HORIZONTAL_LEFT,
                    ],
                ]);

                // Zebra nas linhas
                for ($row = 2; $row <= $highestRow; $row++) {
                    if ($row % 2 === 0) {
                        $sheet->getStyle("A{$row}:{$highestColumn}{$row}")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setARGB('FFF7F7F7');
                    }
                }

                // Ajuste automático da altura
                for ($row = 1; $row <= $highestRow; $row++) {
                    $sheet->getRowDimension($row)->setRowHeight(-1);
                }

                // Filtro automático no cabeçalho
                $sheet->setAutoFilter("A1:{$highestColumn}1");

                // ✅ Adiciona a linha com o hash
                $hashRow = $highestRow + 2;
                $sheet->setCellValue("A{$hashRow}", "HASH DE CONTROLE:");
                $sheet->setCellValue("B{$hashRow}", $this->sha256Token);

                // Estilo para a linha do hash
                $sheet->getStyle("A{$hashRow}:B{$hashRow}")->applyFromArray([
                    'font' => ['bold' => true],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => 'FFEEEEEE'],
                    ],
                    'alignment' => [
                        'vertical' => 'center',
                        'horizontal' => 'left',
                    ],
                ]);
            },
        ];
    }
}
