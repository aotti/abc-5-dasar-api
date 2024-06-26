import { supabase } from "./database";
import { IQueryBuilder, IQueryInsert, IQuerySelect, IQueryUpdate, PG_PromiseType } from "./types";

export class DatabaseQueries {

    select(queryObject: IQuerySelect): PG_PromiseType {
        // select data
        const selectAllDataFromDB = async () => {
            // default limit
            let [rangeMin, rangeMax]: [number, number] = [0, 50]
            // if there's limit property in query object
            if(queryObject.limit) {
                const { min, max } = queryObject.limit
                // update rangeMin and rangeMax
                rangeMin = min; rangeMax = max
            }
            // run query 
            if(queryObject.function) {
                // run function
                const {data, error} = await supabase.rpc(queryObject.function) 
                return {data: data, error: error}
            }
            else if(queryObject.whereColumn) {
                // where condition
                const {data, error} = await supabase.from(queryObject.table)
                                    .select(queryObject.selectColumn as string) // select columns
                                    .eq(queryObject.whereColumn as string, queryObject.whereValue) // where condition
                                    .range(rangeMin, rangeMax) // limit, how many data will be retrieved
                                    .order('id', {ascending: true}) // order data by..
                return {data: data, error: error}
            }
            else {
                const {data, error} = await supabase.from(queryObject.table)
                                    .select(queryObject.selectColumn as string) // select columns
                                    .range(rangeMin, rangeMax) // limit, how many data will be retrieved
                                    .order('id', {ascending: true}) // order data by..
                return {data: data, error: error}
            }
        }
        return selectAllDataFromDB()
    }

    insert(queryObject: Omit<IQueryInsert, 'whereColumn' | 'whereValue'>): PG_PromiseType {
        // insert data 
        const insertDataToDB = async () => {
            // run query
            const {data, error} = await supabase.from(queryObject.table)
                                .insert(queryObject.insertColumn)
                                .select(queryObject.selectColumn as string)
            return {data: data, error: error}
        }
        return insertDataToDB()
    }

    update(queryObject: IQueryUpdate): PG_PromiseType {
        // update data
        const updateDataToDB = async () => {
            // run query
            const {data, error} = await supabase.from(queryObject.table)
                                .update(queryObject.updateColumn)
                                .eq(queryObject.whereColumn, queryObject.whereValue)
                                .select(queryObject.selectColumn as string)
            return {data: data, error: error}
        }
        return updateDataToDB()
    }

    /**
     * 
     * @param type table name without prefix, ex: abc_words > words
     * @param columns choose columns by numbers, each type has different columns
     * @returns selected columns 
     * @description example: 
     * 
     * - table words = select 'id, category, word' = 123; select 'id, word' = 13;
     * 
     * list of column:
     * - players - id | username
     * - profiles - player_id | game_played | words_used
     * - words - id | category | word
     * - rooms - id | thread_id | name | password | num_players | max_players | rules | status
     * - rounds - id | player_id | room_id | word_id | round_number
     */
    queryColumnSelector(type: string, columns: number) {
        // to save selected column 
        const selectedColumns = []
        // for players table
        if(type === 'players') {
            const pickerList: string[] = ['id', 'username']
            selectedColumns.push(columnPicker(pickerList))
        }
        // for profiles table
        else if(type === 'profiles') {
            const pickerList: string[] = ['player_id(id, username)', 'game_played', 'words_correct', 'words_used']
            selectedColumns.push(columnPicker(pickerList))
        }
        // for words table
        else if(type === 'words') {
            const pickerList: string[] = ['id', 'category', 'word']
            selectedColumns.push(columnPicker(pickerList))
        }
        // for rooms table
        else if(type === 'rooms') {
            const pickerList: string[] = ['id', 'thread_id', 'name', 'password', 'num_players', 'max_players', 'rules', 'status']
            selectedColumns.push(columnPicker(pickerList))
        }
        // for rounds table
        else if(type === 'rounds') {
            const pickerList: string[] = ['id', 'player_id', 'room_id', 'word_id', 'round_number']
            selectedColumns.push(columnPicker(pickerList))
        }
        // return selected columns
        return selectedColumns.join(', ')

        // looping columns
        function columnPicker(pickerList: string[]) {
            // temp col container
            const colsPicked = []
            // convert number to string for looping to work
            const cols = columns.toString()
            for(let col of cols) {
                // push selected column to container
                colsPicked.push(pickerList[+col - 1])
            }
            return colsPicked
        }
    }
}