import { Request, Response } from "express";
import { DatabaseQueries } from "../lib/DatabaseQueries";
import { Respond } from "../lib/Respond";
import { AuthPayloadType, IQueryInsert, IRequestRegisterPlayer, IResponse } from "../lib/types";
import { RepoHelper } from "../lib/RepoHelper";

export class RegisterRepo {
    private dq = new DatabaseQueries()
    private respond = new Respond()
    private repoHelper = new RepoHelper()

    async player(req: Request, res: Response) {
        // var for return
        let returnObject: IResponse
        // destructure req.body
        const { action, payload }: IRequestRegisterPlayer = req.body
        // data for payload authentication
        const authData: AuthPayloadType = {
            clientAction: action,
            authAction: 'register player',
            payloadKeys: Object.keys(payload)
        }
        // check payload
        const [authStatus, errorMessage] = this.repoHelper.checkReqBody(authData)
        if(authStatus) {
            // payload doesnt pass the authentication
            returnObject = errorMessage as IResponse
        }
        // handle promise
        try {
            // query object for insert
            const queryObject: Omit<IQueryInsert, 'whereColumn' | 'whereValue'> = {
                table: 'abc_players',
                selectColumn: this.dq.queryColumnSelector('players', 12),
                get insertColumn() {
                    return payload
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
                returnObject = this.respond.createObject(200, 'success register player', insertResponse.data) 
            }
            // return response
            // this var definitely will have value
            return returnObject!
        } catch (err) {
            console.log(`error RegisterRepo player`)
            // return response
            returnObject = this.respond.createObject(500, err as string, [])
            return returnObject
        }
    }
}