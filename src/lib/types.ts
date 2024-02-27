import { PostgrestError } from "@supabase/supabase-js";

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
}

interface IQueryInsert extends IQueryBuilder {
    get insertColumn(): IUWordsType | IUWordsType[];
}

interface IQueryUpdate extends IQueryBuilder {
    whereColumn: string;
    whereValue: string | number;
    get updateColumn(): IUWordsType;
}



export { 
    PG_PromiseType,
    IQueryBuilder,
    IQuerySelect,
    IQueryInsert,
    IQueryUpdate
}