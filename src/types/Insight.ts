import { Pagination } from "./Pagination";

export type Insight = {
    id?: string;
    category: string;
    video?: {
        title?: string;
        thumbnail?: string;
        url?: string;
        isExternal?: boolean;
    };
    article?: {
        title?: string;
        description?: string;
        thumbnail?: string;
        content?: string;
        time?: number;
    };
    pagination?: Pagination
};