import express from 'express' 
import { GameController } from '../controllers/GameController'
import { Authorization } from '../middlewares/authorization'

const gameController = new GameController()
const gameRouter = express.Router()
const authorization = new Authorization()

// get
gameRouter
    .get('/words', gameController.getWords)

// post
gameRouter
    .post('/words', authorization.uuid, gameController.insertWords)

export { gameRouter }