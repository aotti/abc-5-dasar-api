import { NextFunction, Request, Response } from "express";
import { config } from 'dotenv'
import { resolve } from 'path'

// set the env file
const envFilePath = resolve(process.cwd(), '.env')
config({ path: envFilePath })

export class Authorization {

    uuid = (req: Request, res: Response, next: NextFunction) => {
        if(!req.headers.authorization) {
            // the authorization is empty
            return res.status(403).json({ error: 'no credentials sent!' });
        }
        else if(req.headers.authorization !== process.env['UUID_V4']) {
            // the authorization not empty
            // then check the uuid 
            return res.status(403).json({ error: `credentials doesn't match!` });
        }
        // if the uuid match, run the controller
        next()
    }

    // ### TAMBAH MIDDLEWARE UNTUK CEK APAKAH PLAYER SUDAH REGISTER?
    // ### JIKA BLM REGISTER, BATASI HAK AKSES KE API
    // ### UNTUK START & JOIN ROUTES
    auth = (req: Request, res: Response, next: NextFunction) => {
        
    }
}