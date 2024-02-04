export interface iData {
    val: any;
    title?: string;
}

export interface iInvoiceData {
    type: "note" | "unit";
    data: iData;
    id?: number;
}
