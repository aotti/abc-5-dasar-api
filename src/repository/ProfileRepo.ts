import { Request, Response } from "express";
import { DatabaseQueries } from "../lib/DatabaseQueries";
import { IQuerySelect, IResponse, IProfileSelect, IAuthClientReq, IQueryUpdate, IRequestUpdateProfile } from "../lib/types";
import { Respond } from "../lib/Respond";
import { RepoHelper } from "../lib/RepoHelper";

export class ProfileRepo {
    private dq = new DatabaseQueries()
    private respond = new Respond()
    private repoHelper = new RepoHelper()

    async getProfile(req: Request, res: Response) {
        // var for return
        let returnObject: IResponse
        // destructure req.params
        const { player_id } = req.params
        // handle promise
        try {
            // create query object for query execute
            const queryObject: IQuerySelect = {
                table: 'abc_profiles',
                selectColumn: this.dq.queryColumnSelector('profiles', 1234),
                whereColumn: 'player_id',
                whereValue: player_id
            }
            // select data from database
            const selectResponse = await this.dq.select(queryObject)
            // failed to retrieve data
            if(selectResponse.data === null) {
                returnObject = this.respond.createObject(500, selectResponse.error, []) 
            }
            // success to retrieved data
            else if(selectResponse.error === null) {
                // data doesnt exist
                if(selectResponse.data.length === 0) {
                    // set response
                    returnObject = this.respond.createObject(200, 'player doesnt exist', [])
                }
                else {
                    // data exist
                    const selectData: IProfileSelect = selectResponse.data[0]
                    // new data for response
                    const newData: IProfileSelect = {
                        username: selectData.player_id?.username as string,
                        game_played: selectData.game_played,
                        words_correct: selectData.words_correct,
                        words_used: selectData.words_used
                    }
                    // set response
                    returnObject = this.respond.createObject(200, `success get profile`, [newData])
                }
            }
            // return response
            // this var definitely will have value
            return returnObject!
        } catch (err: any) {
            console.log(`error ProfileRepo getProfile`)
            console.log(err)
            // return response
            returnObject = this.respond.createObject(500, err.message, [])
            return returnObject
        }
    }

    async updateProfile(req: Request, res: Response) {
        // var for return
        let returnObject: IResponse
        // destructure req.params
        const { action, payload }: IRequestUpdateProfile = req.body
        // data for authentication
        const authData: IAuthClientReq = {
            reqMethod: req.method,
            authKey: 'update profile',
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
            req.params = { player_id: payload.player_id }
            const getProfile = await this.getProfile(req, res)
            // check status
            switch(getProfile.status) {
                case 200:
                    if(getProfile.data.length === 0) {
                        returnObject = this.respond.createObject(200, getProfile.message, [])
                    }
                    else {
                        type UpdatePayloadType = IRequestUpdateProfile['payload']
                        const getProfileData = (getProfile.data as UpdatePayloadType[])
                        // new profile payload
                        const updatePayload = {
                            game_played: getProfileData[0].game_played + payload.game_played,
                            words_correct: getProfileData[0].words_correct + payload.words_correct,
                            words_used: getProfileData[0].words_used + payload.words_used
                        }
                        // query object for insert
                        const queryObject: IQueryUpdate = {
                            table: 'abc_profiles',
                            selectColumn: this.dq.queryColumnSelector('profiles', 1234),
                            whereColumn: 'player_id',
                            whereValue: payload.player_id,
                            get updateColumn() {
                                return updatePayload
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
                    }
                    break
                case 400:
                    returnObject = this.respond.createObject(400, getProfile.message, [])
                    break
                case 500:
                    returnObject = this.respond.createObject(500, getProfile.message, [])
                    break
            }
            // return response
            // this var definitely will have value
            return returnObject!
        } catch (err: any) {
            console.log(`error ProfileRepo updateProfile`)
            console.log(err)
            // return response
            returnObject = this.respond.createObject(500, err.message, [])
            return returnObject
        }
    }
}