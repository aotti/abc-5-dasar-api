import { supabase } from "./database";
import { IQueryBuilder, IQueryInsert, PG_PromiseType } from "./types";

export class DatabaseQueries {

    selectAll(res: any, queryObject: IQueryBuilder): PG_PromiseType {
        if(supabase == null)
            return res.status(500).send('cannot connect to database')
        const selectAllDataFromDB = async () => {
            const {data, error} = await supabase.from(queryObject.table)
                                .select()
                                .order('id', {ascending: true})
            return {data: data, error: error}
        }
        return selectAllDataFromDB()
    }

    insert(res: any, queryObject: Omit<IQueryInsert, 'whereColumn' | 'whereValue'>): PG_PromiseType {
        if(supabase == null)
            return res.status(500).send('cannot connect to database')
        const insertDataToDB = async () => {
            // insert player data who joined the game
            const {data, error} = await supabase.from(queryObject.table)
                                .insert(queryObject.insertColumn)
                                .select(queryObject.selectColumn as string)
            return {data: data, error: error}
        }
        return insertDataToDB()
    }

    // column selector for display column when execute select query
    queryColumnSelector(type: string, columns: number) {
        // to save selected column 
        const selectedColumns = []
        // for players table
        if(type === 'players') {

        }
        // for profiles table
        else if(type === 'profiles') {
            
        }
        // for words table
        else if(type === 'words') {
            const pickerList: string[] = ['id', 'category', 'word']
            selectedColumns.push(columnPicker(pickerList))
        }
        // for rooms table
        else if(type === 'rooms') {
            
        }
        // for rounds table
        else if(type === 'rounds') {
            
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