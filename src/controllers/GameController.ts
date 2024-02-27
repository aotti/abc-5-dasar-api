import { WordsRepo } from "../repository/WordsRepo"

export class GameController {
    private wordsRepo = new WordsRepo()

    getWords = (req: any, res: any) => {
        // return res.status(200).json({
        //     status: 200,
        //     message: 'success',
        //     data: []
        // })
        return 'punten'
    }

    insertWord = (req: any, res: any) => {
        this.wordsRepo.insertWord(req, res)
            .then(result => {
                return res.status(200).json({
                    status: 200,
                    message: result
                })
            })
    }
}