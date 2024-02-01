/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomerResource } from './CustomerResource';
import type { InvoiceItemResource } from './InvoiceItemResource';
export type InvoiceResource = {
    id: number;
    number: string;
    company_id: number;
    date: string;
    due_date: string;
    sent: boolean;
    note: string;
    total: string;
    discont: number;
    company?: CustomerResource;
    items?: Array<InvoiceItemResource>;
};

