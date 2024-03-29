import { Request, Response } from "express";
import { DatabaseQueries } from "../lib/DatabaseQueries"
import { IQueryInsert, IQuerySelect, IRequestGetWords, IRequestInsertWord, IResponse, WordSelectResType } from "../lib/types"
import { Respond } from "../lib/Respond";
import { RepoHelper } from "../lib/RepoHelper";

export class WordRepo {
    private dq = new DatabaseQueries()
    private respond = new Respond()
    private repoHelper = new RepoHelper()

    async getWords(req: Request, res: Response) {
        // var for return
        let returnObject
        // destructure req.params
        const param: IRequestGetWords['payload'] = {
            column: Object.keys(req.params)[0],
            value: req.params.category
        }
        // handle promise
        try {
            // create query object for query execute
            const queryObject: IQuerySelect = {
                table: 'abc_words',
                selectColumn: this.dq.queryColumnSelector('words', 123),
                whereColumn: param.column,
                whereValue: (param.value as string).replace('-', ' ')
            }
            // select all data with selected category
            const selectAllResponse = await this.dq.select(queryObject)
            // failed to select data
            if(selectAllResponse.data === null) {
                returnObject = this.respond.createObject(500, selectAllResponse.error, []) 
            }
            // success to select data
            else if(selectAllResponse.error === null) {
                returnObject = this.respond.createObject(200, `success get words`, selectAllResponse.data) 
            }
            // return response
            return returnObject as IResponse
        } catch (err) {
            console.log(`error WordRepo getWords`)
            // return response
            returnObject = this.respond.createObject(500, err as string, [])
            return returnObject as IResponse
        }
    }

    async insertWords(req: Request, res: Response) {
        // var for return
        let returnObject: IResponse
        // destructure req.body
        const { action, payload }: IRequestInsertWord = req.body
        // data for authentication
        const authData = {
            clientAction: action,
            authAction: 'insert words',
            payloadKeys: payload.map(v => { return Object.keys(v) })[0]
        }
        // check payload
        const [authStatus, errorMessage] = this.repoHelper.checkReqBody(authData)
        if(authStatus) {
            // payload doesnt pass the authentication
            return errorMessage as IResponse
        }
        // prevent insert data if theres more than 1 category
        const countCategory = payload.map(v => { return v.category }).filter((v, i, arr) => { return arr.indexOf(v) === i })
        if(countCategory.length > 1) {
            return returnObject = this.respond.createObject(401, 'only 1 category is allowed per insert', []) 
        }
        // check for unique words
        const [unique, words] = this.checkUniqueWords(payload)
        if(unique === false) {
            return returnObject = this.respond.createObject(401, `the word(s) [${words}] has a duplicate!`, []) 
        }
        // handle promise
        try {
            // trying to connect db
            const matchWords = await this.matchWords(payload)
            // fail to connect db
            if((matchWords as IResponse).status) return matchWords as IResponse
            // filtered payload for insertColumn
            const insertPayload = matchWords as {category: string, word: string}[]
            // create query object for query execute
            // query object for insert
            const queryObject: Omit<IQueryInsert, 'whereColumn' | 'whereValue'> = {
                table: 'abc_words',
                selectColumn: this.dq.queryColumnSelector('words', 123),
                get insertColumn() {
                    // filter the array to prevent double elements 
                    // because the 'for loop' for selectAll
                    return insertPayload.filter((v, i, arr) => arr.indexOf(v) === i)
                }
            }
            // insert data
            const insertResponse = await this.dq.insert(queryObject)
            // failed to insert data
            if(insertResponse.data === null) {
                returnObject = this.respond.createObject(500, insertResponse.error, []) 
            }
            // success to insert data
            else if(insertResponse.error === null) {
                const successText = `success ${action} (${insertResponse.data.length} of ${payload.length} words)`
                // set response
                returnObject = this.respond.createObject(200, successText, insertResponse.data) 
            }
            // return response
            // this var definitely will have value
            return returnObject!
        } catch (err) {
            console.log(`error WordRepo insertWords`)
            // return response
            returnObject = this.respond.createObject(500, err as string, [])
            return returnObject
        }
    }

    // ~~ utility methods ~~
    /**
     * @description match words from client payload with words from database 
     * to make sure the word from client is all unique
     * @param payload payload from client
     * @returns error response | filtered payload (object)
     */
    private async matchWords(payload: {category: string, word: string}[]) {
        // object to make sure all word pass until last loop
        const objPayload: {[key: string]: string[] | string} = {}
        // loop payload
        for(let p of payload) {
            // fill obj payload
            objPayload[p.word] = []
        }
        // filtered payload for insertColumn
        const tempPayload: {category: string, word: string}[] = []
        // total limit to get data from db
        const baseLimit = 1000
        // limit (100) data per fetch data (for loop)
        let [limitMin, limitMax]: [number, number] = [0, 0]
        // loop for limit
        for(let i=0; i<10; i++) {
            limitMin = (i / 10) * baseLimit
            limitMax = ((i+1) / 10) * baseLimit - 1
            // create query object for query execute
            // query object for select all
            const queryObject: IQuerySelect = {
                table: 'abc_words',
                selectColumn: this.dq.queryColumnSelector('words', 23),
                whereColumn: 'category',
                whereValue: payload[0].category,
                limit: { min: limitMin, max: limitMax }
            }
            // select data
            const selectAllResponse = await this.dq.select(queryObject) 
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
                for(let key of Object.keys(objPayload)) {
                    const selectRes: WordSelectResType[] = selectAllResponse.data
                    // then match the string with payload.word
                    const matchSelectRes = () => { 
                        // split payload word
                        const keyWords = key.split(', ')
                        return this.ignoreExistWords(selectRes, keyWords)
                    }
                    // push number to obj payload 
                    matchSelectRes() 
                        // word doesnt exist push 0
                        ? (objPayload[key] as string[]).push('0') 
                        // word exist push 1
                        : (objPayload[key] as string[]).push('1')
                }
                // if retrieved data length < 100, break the loop
                if(selectAllResponse.data.length < limitMax) {
                    // join each obj payload value
                    for(let key of Object.keys(objPayload)) {
                        objPayload[key] = (objPayload[key] as string[]).join('')
                        // only push to temp payload if value === 0
                        // 0 means nothing match in database after all the loops
                        if(+objPayload[key] === 0) {
                            // then insert to the new payload
                            tempPayload.push({ category: payload[0].category, word: key })
                        }
                    } 
                    break
                }
            }
        }
        // return temp insert payload
        return tempPayload
    }

    /**
     * @description ignore words that already exist in database
     * @param selectRes payload from SELECT query
     * @param words word from client 
     * @returns string or null
     */
    private ignoreExistWords(selectRes: WordSelectResType[], words: string[]) {
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