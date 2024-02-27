import { DatabaseQueries } from "../lib/DatabaseQueries"
import { IQueryInsert } from "../lib/types"

export class WordsRepo {
    private dq = new DatabaseQueries()

    async getWords(req: any, res: any) {
        
    }

    async insertWord(req: any, res: any) {
        // create query object for query execute
        const queryObject: Omit<IQueryInsert, 'whereColumn' | 'whereValue'> = {
            table: 'abc_words',
            selectColumn: this.dq.queryColumnSelector('words', 123),
            get insertColumn() {
                return req.body.payload
            }
        }
        // insert data
        this.dq.insert(res, queryObject)
            .then(result => {
                console.log(result);
                
            })
            .catch(err => console.log(`wordsRepo insertWord: ${err}`))
    }
}