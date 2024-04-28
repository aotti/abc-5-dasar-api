import { IQueryInsert, IResponse, WordAltDataType } from "../lib/types";
import { DatabaseQueries } from "../lib/DatabaseQueries";
import { Respond } from "../lib/Respond";

export class WordAltRepo {
    private dq = new DatabaseQueries()
    private respond = new Respond()

    // data is from insert method in round repo
    async insert(wordAltData: WordAltDataType[]) {
        let responseObject: IResponse | null = null
        const wordAltPayload = wordAltData.map(v => {
            return {
                player_id: v.player_id,
                room_id: v.room_id,
                word: v.word
            }
        })
        // check array length
        if(wordAltPayload.length === 0)
            return responseObject
        // create query object for query execute
        const queryObject: IQueryInsert = {
            table: 'abc_words_alt',
            selectColumn: '*',
            get insertColumn() {
                return wordAltPayload
            }
        }
        // insert data
        const insertResponse = await this.dq.insert(queryObject)
        // failed to insert data
        if(insertResponse.data === null) {
            responseObject = this.respond.createObject(500, insertResponse.error, []) 
        }
        // return result
        return responseObject
    }
}