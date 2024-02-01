export interface iCustomer {
    id: null | number;
    name: string;
    address: string | null;
    city: string | null;
    zip: number | null;
    country: string | null;
    billing_address: string | null;
    billing_city: string | null;
    billing_zip: number | null;
    billing_country: string | null;
    prefix: string | null;
}
