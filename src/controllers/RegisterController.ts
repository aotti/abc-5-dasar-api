import { Request, Response } from "express"
import { RegisterRepo } from "../repository/RegisterRepo"
import { Respond } from "../lib/Respond"

export class RegisterController {
    private registerRepo = new RegisterRepo()
    private respond = new Respond()

    player = (req: Request, res: Response) => {
        this.registerRepo.player(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }
}