import { Request, Response } from "express";
import { DatabaseQueries } from "../lib/DatabaseQueries"
import { Respond } from "../lib/Respond";
import { IAuthClientReq, IQueryInsert, IQuerySelect, IQueryUpdate, IRequestCreateRoom, IRequestUpdateRoom, IResponse } from "../lib/types";
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
            const queryObject: IQueryInsert = {
                table: 'abc_rooms',
                selectColumn: this.dq.queryColumnSelector('rooms', 134567),
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

    async updateRoom(req: Request, res: Response) {
        // var for return
        let returnObject: IResponse
        // destructure req.body
        const { action, payload }: IRequestUpdateRoom = req.body
        // data for authentication
        const authData: IAuthClientReq = {
            reqMethod: req.method,
            authKey: 'update room',
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
            // query object for update
            const queryObject: IQueryUpdate = {
                table: 'abc_rooms',
                selectColumn: this.dq.queryColumnSelector('rooms', 123),
                whereColumn: 'id',
                whereValue: payload.id,
                get updateColumn() {
                    return payload
                }
            }
            // update data
            const updateResponse = await this.dq.update(queryObject)
            // failed to update data
            if(updateResponse.data === null) {
                returnObject = this.respond.createObject(500, updateResponse.error, []) 
            }
            // success to update data
            else if(updateResponse.error === null) {
                returnObject = this.respond.createObject(200, `success ${action}`, updateResponse.data) 
            }
            // return response
            // this var definitely will have value
            return returnObject!
        } catch (err: any) {
            console.log(`error RoomRepo updateRoom`)
            console.log(err)
            // return response
            returnObject = this.respond.createObject(500, err.message, [])
            return returnObject
        }
    }

    async joinRoom(req: Request, res: Response) {
        // var for return
        let returnObject: IResponse
        // handle promise
        try {
            // create query object for query execute
            const queryObject: Pick<IQuerySelect, 'function'> = {
                function: 'get_lastroom'
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
                returnObject = this.respond.createObject(200, `success get last room`, selectResponse.data)
            }
            // return response
            // this var definitely will have value
            return returnObject!
        } catch (err: any) {
            console.log(`error RoomRepo joinRoom`)
            console.log(err)
            // return response
            returnObject = this.respond.createObject(500, err.message, [])
            return returnObject
        }
    }
}