import { NextFunction, Request, Response } from "express";
import { config } from 'dotenv'
import { resolve } from 'path'
import { DatabaseQueries } from "../lib/DatabaseQueries";
import { IQuerySelect } from "../lib/types";

// set the env file
const envFilePath = resolve(process.cwd(), '.env')
config({ path: envFilePath })

export class Authorization {
    private dq = new DatabaseQueries()

    uuid = (req: Request, res: Response, next: NextFunction) => {
        if(!req.headers.authorization) {
            // the authorization header is empty
            return res.status(403).json({ error: 'no credentials sent!' });
        }
        else if(req.headers.authorization !== process.env['UUID_V4']) {
            // the authorization header not empty
            // then check the uuid 
            return res.status(403).json({ error: `credentials doesn't match!` });
        }
        // if the uuid match, run the controller
        next()
    }

    // check if the player is registered
    auth = async (req: Request, res: Response, next: NextFunction) => {
        if(!req.headers.authorization) {
            // the authorization header is empty
            return res.status(403).json({ error: 'no credentials sent!' });
        }
        // the authorization header not empty
        const queryObject: IQuerySelect = {
            table: 'abc_players',
            selectColumn: this.dq.queryColumnSelector('players', 1),
            whereColumn: 'id',
            whereValue: req.headers.authorization
        }
        // run query
        const selectResponse = await this.dq.select(queryObject)
        // failed to get data
        if(selectResponse.data === null) {
            return res.status(500).json(selectResponse.error)
        }
        // success to get data
        else if(selectResponse.error === null) {
            // check if length === 0
            if(selectResponse.data.length === 0) {
                return res.status(200).json({ error: 'you are not registered.' })
            }
            // player found
            next()
        }
    }
}