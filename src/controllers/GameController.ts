import { Request, Response } from "express";
import { WordsRepo } from "../repository/WordsRepo"

export class GameController {
    private wordsRepo = new WordsRepo()

    getWords = (req: Request, res: Response) => {
        this.wordsRepo.getWords(req, res)
            .then(result => {
                return res.status(result!.status).json({
                    status: result!.status,
                    message: result!.message,
                    data: result!.data
                })
            })
    }

    insertWords = (req: Request, res: Response) => {
        this.wordsRepo.insertWords(req, res)
            .then(result => {
                return res.status(result!.status).json({
                    status: result!.status,
                    message: result!.message,
                    data: result!.data
                })
            })
    }
}