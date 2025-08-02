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

type IUProfileType = {
    player_id: string;
    game_played: number;
    words_correct: number;
    words_used: number;
}

type IURegisterType = {
    id: string;
    username: string;
}

type IUCreateRoomType = {
    id: number;
    thread_id?: string;
    name: string;
    password?: string | null;
    num_players: number;
    max_players: number;
    rules: string;
    status: string;
}

type IURoundsType = {
    player_id: string;
    room_id: number;
    word_id: number;
    round_number: number;
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

interface IQueryInsert extends Omit<IQueryBuilder, 'whereColumn' | 'whereValue'> {
    get insertColumn(): 
        // word
        IUWordsType | IUWordsType[] | 
        // profile
        IUProfileType |
        // register
        IURegisterType |
        // room
        IUCreateRoomType |
        // rounds
        IURoundsType | IURoundsType[] |
        // word alt
        WordAltDataType[];
}

interface IQueryUpdate extends IQueryBuilder {
    whereColumn: string;
    whereValue: string | number;
    get updateColumn(): 
        // word
        IUWordsType | 
        // profile
        Omit<IUProfileType, 'player_id'> |
        // register
        IURegisterType |
        // room
        Pick<IUCreateRoomType, 'id' | 'thread_id' | 'num_players' | 'status'> |
        // rounds
        IURoundsType;
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
        payload: IRequestInsertWord['payload'] | 
                IRequestInsertRound['payload']|
                IRequestRegisterPlayer['payload'] |
                IRequestCreateRoom['payload'] |
                IRequestUpdateRoom['payload'] 
    };
}

// ~~ WORD REPO ~~
interface IParamsGetWords {
    column: string;
    value: string;
}

interface IRequestInsertWord extends IRequest {
    payload: [ IUWordsType ]
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
    words_correct: number;
    words_used: number;
}

interface IRequestUpdateProfile extends IRequest {
    payload: IUProfileType
}

// ~~ REGISTER REPO ~~
interface IRequestRegisterPlayer extends IRequest {
    payload: IURegisterType
}

// ~~ ROOM REPO ~~
interface IRequestCreateRoom extends IRequest {
    // id, thread_id, name, password, num_players, max_players, rules, status
    payload: IUCreateRoomType
}

interface IRequestUpdateRoom extends IRequest {
    payload: Pick<IUCreateRoomType, 'id' | 'thread_id' | 'num_players' | 'status'>;
}

// ~~ ROUND REPO ~~
interface IRequestInsertRound extends IRequest {
    payload: {
        // room_id, round_number, game_rounds, player_id, word_id, answer_points (words_correct)
        room_id: number;
        round_number: number;
        game_rounds: number;
        player_id: string;
        answer_id: number; // word_id
        answer_words: string; 
        answer_points: number; // words_correct
    }[]
}

interface IRequestUpdateRound extends IRequest {
    payload: {
        room_id: number;
        player_id: string;
        answer_id: number; // word_id
        round_number: number;
    }
}

// ~~ WORD ALT REPO ~~
type WordAltDataType = {
    player_id: string;
    room_id: number;
    word: string;
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
    IRequestUpdateProfile,
    // room
    IRequestCreateRoom,
    IRequestUpdateRoom,
    // round
    IRequestInsertRound,
    IRequestUpdateRound,
    // word alt
    WordAltDataType,
    // repo helper
    repoHelperInputsType
}