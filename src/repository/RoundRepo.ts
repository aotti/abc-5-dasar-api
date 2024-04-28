import { Request, Response } from "express";
import { IAuthClientReq, IQueryInsert, IRequestInsertRound, IResponse } from "../lib/types";
import { Respond } from "../lib/Respond";
import { DatabaseQueries } from "../lib/DatabaseQueries";
import { RepoHelper } from "../lib/RepoHelper";

export class RoundRepo {
    private dq = new DatabaseQueries()
    private respond = new Respond()
    private repoHelper = new RepoHelper()

    async insert(req: Request, res: Response) {
        // var for return
        let returnObject: IResponse
        // destructure req.body
        const { action, payload }: IRequestInsertRound = req.body
        // data for authentication
        const authData: IAuthClientReq = {
            reqMethod: req.method,
            authKey: 'insert rounds',
            clientInputs: req.body
        }
        // check payload
        const [authStatus, errorMessage] = this.repoHelper.checkClientInputs(authData) as [boolean, IResponse | null]
        if(authStatus) {
            // payload doesnt pass the authentication
            return returnObject = errorMessage as IResponse
        }
        // handle promise
        try {
            // new payload
            const newPayload = payload.map(v => {
                return {
                    player_id: v.player_id,
                    room_id: v.room_id,
                    word_id: v.answer_id,
                    round_number: v.round_number
                }
            })
            // query object for insert
            const queryObject: Omit<IQueryInsert, 'whereColumn' | 'whereValue'> = {
                table: 'abc_rounds',
                selectColumn: this.dq.queryColumnSelector('rounds', 2345),
                get insertColumn() {
                    return newPayload
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
                returnObject = this.respond.createObject(200, `success ${action}`, insertResponse.data) 
            }
            // return response
            // this var definitely will have value
            return returnObject!
        } catch (err: any) {
            console.log(`error RoundRepo insert`)
            console.log(err)
            // return response
            returnObject = this.respond.createObject(500, err.message, [])
            return returnObject
        }
    }
}