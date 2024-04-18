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

// insert / update column 
type IUWordsType = {
    category: string;
    word: string;
}

type IUPlayersType = {
    id: string;
    username: string;
}

type IURoomType = {
    name: string;
    password?: string | null;
    num_players: number;
    max_players: number;
    rules: string;
}

// queries
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
    function?: string;
}

interface IQueryInsert extends IQueryBuilder {
    get insertColumn(): 
        // word
        IUWordsType | IUWordsType[] | 
        // player
        IUPlayersType |
        // room
        IURoomType;
}

interface IQueryUpdate extends IQueryBuilder {
    whereColumn: string;
    whereValue: string | number;
    get updateColumn(): 
        // word
        IUWordsType | IUWordsType[] | 
        // player
        IUPlayersType |
        // room
        IURoomType;
}

// ~~ REQUEST ~~
interface IRequest {
    action: string; 
}

interface IAuthClientInputs {
    reqMethod: string;
    /**
     * @property authKey used to compare action value (req.body) / params key
     */
    authKey: string;
}

interface IAuthClientReq extends IAuthClientInputs {
    clientInputs: {
        action: string;
        payload: IRequestInsertWord['payload'] | IRequestRegisterPlayer['payload']
    };
}

// ~~ WORD REPO ~~
interface IParamsGetWords {
    column: string;
    value: string | number;
}

interface IRequestInsertWord extends IRequest {
    payload: [
        { 
            category: string, 
            word: string 
        }
    ]
}

type WordSelectResType = {
    id?: number;
    category?: number;
    word?: number;
}

// ~~ PROFILE REPO ~~
interface IProfile {
    player_id?: {
        id: number;
        username: string;
    }
}

interface IProfileSelect extends IProfile {
    id?: number;
    username: string;
    game_played: number;
    words_used: number;
}

// ~~ REGISTER REPO ~~
interface IRequestRegisterPlayer extends IRequest {
    payload: {
        id: string;
        username: string;
    }
}

// ~~ ROOM REPO ~~
interface IRequestCreateRoom extends IRequest {
    payload: {
        // name, password, num_players, max_players, rules
        name: string;
        password: string | null;
        num_players: number;
        max_players: number;
        rules: string;
    }
}

// ~~ REPO HELPER ~~
type repoHelperInputsType = [boolean, IResponse | null]

export { 
    // response
    IResponse,
    // query
    PG_PromiseType,
    IQueryBuilder,
    IQuerySelect,
    IQueryInsert,
    IQueryUpdate,
    // request
    IRequest,
    IAuthClientReq,
    // word repo
    IParamsGetWords,
    IRequestInsertWord,
    WordSelectResType,
    // profile
    IProfileSelect,
    IRequestRegisterPlayer,
    // room
    IRequestCreateRoom,
    // repo helper
    repoHelperInputsType
}