import { Request, Response } from "express";
import { DatabaseQueries } from "../lib/DatabaseQueries"
import { IQueryInsert, IQuerySelect, IRequestGetWords, IRequestInsertWord, IResponse, selectResType } from "../lib/types"

export class WordsRepo {
    private dq = new DatabaseQueries()

    async getWords(req: Request, res: Response) {
        const { action, payload }: IRequestGetWords = req.body
        // check post action
        if(action !== 'get words') {
            return {
                status: 401,
                message: 'action is not allowed',
                data: [] as any[]
            }
        }
        // check if the payload is empty string
        if(payload.column === '' || payload.value === '') {
            return {
                status: 401,
                message: 'payload cannot be empty',
                data: [] as any[]
            }
        }
        // create query object for query execute
        const queryObject: IQuerySelect = {
            table: 'abc_words',
            selectColumn: this.dq.queryColumnSelector('words', 123),
            whereColumn: payload.column,
            whereValue: payload.value
        }
        // handle promise
        try {
            // select all data with selected category
            const selectAllResponse = await this.dq.selectAll(queryObject)
            // failed to select data
            if(selectAllResponse.data === null) {
                return {
                    status: 500,
                    message: selectAllResponse.error,
                    data: [] as any[]
                } as IResponse
            }
            // success to select data
            else if(selectAllResponse.error === null) {
                return {
                    status: 200,
                    message: `success ${action}`,
                    data: selectAllResponse.data
                } as IResponse
            }
        } catch (err) {
            console.log(`wordsRepo getWords: ${err}`)
        }
    }

    async insertWords(req: Request, res: Response) {
        const { action, payload }: IRequestInsertWord = req.body
        // check post action
        if(action !== 'insert words') {
            return {
                status: 401,
                message: 'action is not allowed',
                data: [] as any[]
            }
        }
        // prevent insert data if theres more than 1 category
        const countCategory = payload.map(v => { return v.category }).filter((v, i, arr) => { return arr.indexOf(v) === i })
        if(countCategory.length > 1) {
            return {
                status: 401,
                message: 'only 1 category is allowed per insert',
                data: [] as any[]
            }
        }
        // check for unique words
        const [unique, words] = this.checkUniqueWords(payload)
        if(unique === false) {
            return {
                status: 401,
                message: `the word(s) [${words}] has a duplicate!`,
                data: [] as any[]
            }
        }
        // handle promise
        try {
            type insertPayloadType = {
                category: string; 
                word: string;
            }
            const insertPayload: insertPayloadType[] = []
            // total limit to get data from db
            const baseLimit = 1000
            // limit (100) data per fetch data (for loop)
            let [limitMin, limitMax]: [number, number] = [0, 0]
            // loop for limit
            for(let i=0; i<10; i++) {
                limitMin = (i / 10) * baseLimit
                limitMax = ((i+1) / 10) * baseLimit - 1
                // query object for select all
                const queryObjectSelect: IQuerySelect = {
                    table: 'abc_words',
                    selectColumn: this.dq.queryColumnSelector('words', 23),
                    whereColumn: 'category',
                    whereValue: payload[0].category,
                    limit: { min: limitMin, max: limitMax }
                }
                // select data
                const selectAllResponse = await this.dq.selectAll(queryObjectSelect) 
                // failed to select data
                if(selectAllResponse.data === null) {
                    return {
                        status: 500,
                        message: selectAllResponse.error,
                        data: [] as any[]
                    } as IResponse
                }
                // success to select data
                else if(selectAllResponse.error === null) {
                    // loop payload
                    for(let p of payload) {
                        const selectRes: selectResType[] = selectAllResponse.data
                        // then match the string with payload.word
                        const matchSelectRes = () => { 
                            // split payload word
                            const pWords = p.word.split(', ')
                            return this.ignoreExistWords(selectRes, pWords)
                        }
                        // if the word still doesnt exist in 'the category'
                        if(matchSelectRes()) {
                            // override current payload.word
                            p.word = matchSelectRes() as string
                            // then insert to the new payload
                            insertPayload.push(p)
                        }
                    }
                    // if retrieved data length < 100, break the loop
                    if(selectAllResponse.data.length < limitMax) break
                }
            }
            // query object for insert
            const queryObjectInsert: Omit<IQueryInsert, 'whereColumn' | 'whereValue'> = {
                table: 'abc_words',
                selectColumn: this.dq.queryColumnSelector('words', 123),
                get insertColumn() {
                    return insertPayload
                }
            }
            // insert data
            const insertResponse = await this.dq.insert(queryObjectInsert)
            // failed to insert data
            if(insertResponse.data === null) {
                return {
                    status: 500,
                    message: insertResponse.error,
                    data: [] as any[]
                } as IResponse
            }
            // success to insert data
            else if(insertResponse.error === null) {
                return {
                    status: 200,
                    message: `success ${action} (${insertResponse.data.length} of ${payload.length} words)`,
                    data: insertResponse.data
                } as IResponse
            }
        } catch (err) {
            console.log(`wordsRepo insertWords: ${err}`)
        }
    }

    // ~~ utility methods ~~
    /**
     * @description ignore words that already exist in database
     * @param selectRes payload from SELECT query
     * @param words word from client 
     * @returns string or null
     */
    private ignoreExistWords(selectRes: selectResType[], words: string[]) {
        // main comparison
        // join all select response 'word' into string
        const selectResWords = selectRes.map(v => { return v.word }).join(', ')
        // match each word in array
        const matching = words.map(v => { 
            if(selectResWords.match(v) === null)
                return v
        }).filter(i=>i).join(', ')
        // check the length bfore return 
        return matching.length === 0 ? null : matching
    }

    /**
     * @description check if all the words are unique
     * @param payload payload from client
     * @returns tuple array [ boolean, string[] ]
     */
    private checkUniqueWords(payload: {category: string; word: string}[]): (boolean | string[])[] {
        const filterPayload = payload.map((val, idx, array) =>  {
            const words = val.word.split(', ')
            // filter if an array value have 2 similar word
            const arrayWord = words.filter((v, i, arr) => arr.indexOf(v) !== i)
            if(arrayWord.length !== 0) {
                return [false, arrayWord]
            }
            // filter the whole array
            else if(arrayWord.length === 0) { 
                // get all words and convert to array
                const arrayWords = array.map(v => { return v.word })
                // join the array and split it, so all words become an array element
                // then filter the array
                const filterArrayWords = arrayWords.join(', ').split(', ').filter((v, i, arr) => arr.indexOf(v) !== i)
                // if there's an element after the filter, return false
                return filterArrayWords.length === 0 ? [true, []] : [false, filterArrayWords]
            }
            return [true, []]
        }).filter(i => i)[0]
        // return filtered payload
        return filterPayload
    }
}