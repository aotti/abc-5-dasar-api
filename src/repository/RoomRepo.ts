import { Request, Response } from "express";
import { DatabaseQueries } from "../lib/DatabaseQueries"
import { Respond } from "../lib/Respond";
import { IAuthClientReq, IQueryInsert, IRequestCreateRoom, IResponse } from "../lib/types";
import { RepoHelper } from "../lib/RepoHelper";

export class RoomRepo {
    private dq = new DatabaseQueries()
    private respond = new Respond()
    private repoHelper = new RepoHelper()

    async createRoom(req: Request, res: Response) {
        // var for return
        let returnObject: IResponse
        // destructure req.body
        const { action, payload }: IRequestCreateRoom = req.body
        // data for authentication
        const authData: IAuthClientReq = {
            reqMethod: req.method,
            authKey: 'create room',
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
            // query object for insert
            const queryObject: Omit<IQueryInsert, 'whereColumn' | 'whereValue'> = {
                table: 'abc_rooms',
                selectColumn: this.dq.queryColumnSelector('rooms', 1245),
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
                returnObject = this.respond.createObject(200, `success ${action}`, insertResponse.data) 
            }
            // return response
            // this var definitely will have value
            return returnObject!
        } catch (err: any) {
            console.log(`error RoomRepo createRoom`)
            console.log(err)
            // return response
            returnObject = this.respond.createObject(500, err.message, [])
            return returnObject
        }
    }
}