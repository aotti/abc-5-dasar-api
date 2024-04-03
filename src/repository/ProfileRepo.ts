import { Request, Response } from "express";
import { DatabaseQueries } from "../lib/DatabaseQueries";
import { IQuerySelect, IResponse, IProfileSelect } from "../lib/types";
import { Respond } from "../lib/Respond";

export class ProfileRepo {
    private dq = new DatabaseQueries()
    private respond = new Respond()

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
                selectColumn: this.dq.queryColumnSelector('profiles', 123),
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
                    const selectOneRes: IProfileSelect = selectResponse.data[0]
                    // new data for response
                    const newData: IProfileSelect = {
                        username: selectOneRes.player_id?.username as string,
                        game_played: selectOneRes.game_played,
                        words_used: selectOneRes.words_used
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
}