import { PostgrestError } from "@supabase/supabase-js";

// ~~ RESPONSE TYPE ~~
interface IResponse {
    status: number;
    message: string | PostgrestError | null;
    data: any[];
}

// ~~ POSTGREST RETURN TYPE PROMISE ~~
type PG_PromiseType = Promise<{ data: any[] | null, error: PostgrestError | null }>

// ~~ DATABASE QUERIES ~~
// type qbMethodType = dbSelectType | dbInsertType | dbUpdateType

// insert / update column 
type IUWordsType = {
    category: string;
    word: string;
}

interface IQueryBuilder {
    table: string;
    selectColumn: string | number;
    whereColumn: string | null;
    whereValue: string | number | null;
}

interface IQuerySelect extends IQueryBuilder {
    whereColumn: string;
    whereValue: string | number;
    limit?: { min: number, max: number };
}

interface IQueryInsert extends IQueryBuilder {
    get insertColumn(): IUWordsType | IUWordsType[];
}

interface IQueryUpdate extends IQueryBuilder {
    whereColumn: string;
    whereValue: string | number;
    get updateColumn(): IUWordsType;
}

// ~~ WORDS REPO ~~
interface IRequest {
    action: string; 
}

interface IRequestGetWords extends IRequest {
    payload: {
        column: string;
        value: string | number;
    }
}

interface IRequestInsertWord extends IRequest {
    payload: [
        { category: string, word: string }
    ]
}

type selectResType = {
    id?: number;
    category?: number;
    word?: number;
}

export { 
    PG_PromiseType,
    IQueryBuilder,
    IQuerySelect,
    IQueryInsert,
    IQueryUpdate,
    IResponse,
    IRequest,
    IRequestGetWords,
    IRequestInsertWord,
    selectResType
}