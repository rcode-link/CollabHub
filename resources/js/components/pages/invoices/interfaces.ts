export interface iCustomer {
    id?: number;
    name: string;
    currency_id?: string;
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    billing_address?: string;
    billing_city?: string;
    billing_zip?: string;
    billing_country?: string;
    prefix?: string;
}
