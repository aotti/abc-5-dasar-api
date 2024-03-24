import { Request, Response } from "express";
import { WordRepo } from "../repository/WordRepo"
import { Respond } from "../lib/Respond";

export class WordController {
    private wordRepo = new WordRepo()
    private respond = new Respond()

    getWords = (req: Request, res: Response) => {
        console.log(req.params);
        this.wordRepo.getWords(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }

    insertWords = (req: Request, res: Response) => {
        this.wordRepo.insertWords(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }
}