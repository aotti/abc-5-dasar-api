import { Request, Response } from "express";
import { Respond } from "../lib/Respond";
import { RoundRepo } from "../repository/RoundRepo";

export class RoundController {
    private respond = new Respond()
    private roundRepo = new RoundRepo()

    insert = (req: Request, res: Response) => {
        this.roundRepo.insert(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }

    update = (req: Request, res: Response) => {
        this.roundRepo.update(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }
}