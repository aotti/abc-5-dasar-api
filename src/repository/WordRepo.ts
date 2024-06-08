import { Request, Response } from "express";
import { DatabaseQueries } from "../lib/DatabaseQueries"
import { IQueryInsert, IQuerySelect, IParamsGetWords, IRequestInsertWord, IResponse, WordSelectResType, IAuthClientReq } from "../lib/types"
import { Respond } from "../lib/Respond";
import { RepoHelper } from "../lib/RepoHelper";

export class WordRepo {
    private dq = new DatabaseQueries()
    private respond = new Respond()
    private repoHelper = new RepoHelper()

    async getCategories(req: Request, res: Response) {
        // var for return
        let returnObject
        // handle promise
        try {
            // create query object for query execute
            const queryObject: Pick<IQuerySelect, 'function'> = {
                function: 'get_categories'
            }
            // select data from database
            const selectResponse = await this.dq.select(queryObject as IQuerySelect)
            // failed to retrieved data
            if(selectResponse.data === null) {
                returnObject = this.respond.createObject(500, selectResponse.error, []) 
            }
            // success to retrieved data
            else if(selectResponse.error === null) {
                // set response
                returnObject = this.respond.createObject(200, `success get categories`, selectResponse.data)
            }
            // return response
            // this var definitely will have value
            return returnObject as IResponse
        } catch (err: any) {
            console.log(`error WordRepo getCategories`)
            // return response
            returnObject = this.respond.createObject(500, err as string, [])
            return returnObject as IResponse
        }
    }

    async getWords(req: Request, res: Response) {
        // var for return
        let returnObject
        // destructure req.params
        // IParamsGetWords is extended from IRequest
        const params: IParamsGetWords = {
            column: Object.keys(req.params)[0],
            value: req.params.category
        }
        // handle promise
        try {
            // words container
            const wordsContainer: {id: number; word: string}[] = []
            // total limit to get data from db
            const baseLimit = 2000
            const baseLoop = baseLimit / 500
            // limit (100) data per fetch data (for loop)
            let [limitMin, limitMax]: [number, number] = [0, 0]
            // loop for limit
            for(let i=0; i<baseLoop; i++) {
                // 0 * 2000 > 0.1 * 2000 > 0.2 * 2000
                // 0 > 100 > 200
                limitMin = (i / baseLoop) * baseLimit
                // 0.1 * 1000 > 0.2 * 1000 > 0.3 * 1000
                // 100 > 200 > 300
                limitMax = ((i+1) / baseLoop) * baseLimit - 1
                // create query object for query execute
                const queryObject: IQuerySelect = {
                    table: 'abc_words',
                    selectColumn: this.dq.queryColumnSelector('words', 123),
                    whereColumn: params.column,
                    whereValue: params.value.replace('-', ' '),
                    limit: { min: limitMin, max: limitMax }
                }
                // select all data with selected category
                const selectResponse = await this.dq.select(queryObject)
                // failed to select data
                if(selectResponse.data === null) {
                    // response message
                    returnObject = this.respond.createObject(500, selectResponse.error, []) 
                    break
                }
                // success to select data
                else if(selectResponse.error === null) {
                    // push data to words container
                    const selectResData: {id: number; word: string}[] = selectResponse.data
                    for(let data of selectResData) {
                        wordsContainer.push(data)
                    }
                    // if retrieved data length < 100, break the loop
                    if(selectResData.length < limitMax) {
                        // response message
                        returnObject = this.respond.createObject(200, `success get words`, wordsContainer) 
                        break
                    }
                }
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
        const authData: IAuthClientReq = {
            reqMethod: req.method,
            authKey: 'insert words',
            clientInputs: req.body
        }
        // check payload
        const [authStatus, errorMessage] = this.repoHelper.checkClientInputs(authData) as [boolean, IResponse | null]
        if(authStatus) {
            // payload doesnt pass the authentication
            return returnObject = errorMessage as IResponse
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
            // match payload words with table words
            const matchWords = await this.matchWords(payload)
            // error found after matching words
            if((matchWords as IResponse).status) return matchWords as IResponse
            // filtered payload for insertColumn
            const insertPayload = matchWords as {category: string, word: string}[]
            // create query object for query execute
            // query object for insert
            const queryObject: IQueryInsert = {
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
                // send discord webhook
                const webhookContent = {
                    content: `category: ${payload[0].category}\n${successText}`
                }
                const webhookFetchOptions: RequestInit = {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(webhookContent)
                }
                const webhookFetch = await fetch(process.env['WEBHOOK_URL'], webhookFetchOptions)
                console.log(webhookFetch);
            }
            // return response
            // this var definitely will have value
            return returnObject!
        } catch (err: any) {
            console.log(`error WordRepo insertWords`)
            console.log(err)
            // return response
            returnObject = this.respond.createObject(500, err.message, [])
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
        const baseLimit = 2000
        const baseLoop = baseLimit / 500
        // limit (100) data per fetch data (for loop)
        let [limitMin, limitMax]: [number, number] = [0, 0]
        // loop for limit
        for(let i=0; i<baseLoop; i++) {
            limitMin = (i / baseLoop) * baseLimit
            limitMax = ((i+1) / baseLoop) * baseLimit - 1
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
            const selectResponse = await this.dq.select(queryObject) 
            // failed to select data
            if(selectResponse.data === null) {
                return {
                    status: 500,
                    message: selectResponse.error,
                    data: [] as any[]
                } as IResponse
            }
            // success to select data
            else if(selectResponse.error === null) {
                // loop payload
                for(let key of Object.keys(objPayload)) {
                    const selectRes: WordSelectResType[] = selectResponse.data
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
                if(selectResponse.data.length < limitMax) {
                    for(let key of Object.keys(objPayload)) {
                        // join each obj payload value
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