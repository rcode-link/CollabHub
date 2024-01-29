interface Links {
    url: string | null;
    label: string;
    active: boolean;
}
export interface Pagination {
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: Links[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}
