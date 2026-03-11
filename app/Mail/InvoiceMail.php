<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Invoice $invoice,
        public string $emailSubject,
        public ?string $emailMessage = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->emailSubject,
        );
    }

    public function content(): Content
    {
        $company = Company::whereIsCostumerCompany(false)->first();

        return new Content(
            markdown: 'mail.invoices.send',
            with: [
                'messageBody' => $this->emailMessage,
                'invoiceNumber' => $this->invoice->number,
                'companyName' => $company?->name ?? config('app.name'),
            ],
        );
    }

    public function attachments(): array
    {
        $this->invoice->load('items', 'items.billingItem', 'company', 'company.currency');
        $company = Company::whereIsCostumerCompany(false)->firstOrFail();

        $locale = $this->invoice->company?->invoice_locale ?? 'en';
        $previousLocale = app()->getLocale();
        app()->setLocale($locale);

        $pdf = Pdf::loadView('pdf.invoice', [
            'model' => $this->invoice,
            'company' => $company,
        ]);

        app()->setLocale($previousLocale);

        return [
            Attachment::fromData(fn () => $pdf->output(), $this->invoice->number . '.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
