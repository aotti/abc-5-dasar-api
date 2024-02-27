import express from 'express' 
import { GameController } from '../controllers/GameController'

const gameController = new GameController()
const gameRouter = express.Router()

// get
gameRouter
    .get('/words', gameController.getWords)

// post
gameRouter
    .post('/words', gameController.insertWord)

export { gameRouter }