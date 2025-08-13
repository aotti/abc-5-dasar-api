import { Request, Response } from "express";
import { WordRepo } from "../repository/WordRepo"
import { Respond } from "../lib/Respond";

export class WordController {
    private wordRepo = new WordRepo()
    private respond = new Respond()

    getCategories = (req: Request, res: Response) => {
        this.wordRepo.getCategories(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }

    getWords = (req: Request, res: Response) => {
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

    insertWordAlt = (req: Request, res: Response) => {
        this.wordRepo.insertWordAlt(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }
}