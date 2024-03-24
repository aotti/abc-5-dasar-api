import express from 'express' 
import { Authorization } from '../middlewares/authorization'
import { WordController } from '../controllers/WordController'
import { ProfileController } from '../controllers/ProfileController'
import { RegisterController } from '../controllers/RegisterController'

const gameRouter = express.Router()
// middleware 
const authorization = new Authorization()
// game classes
const wordController = new WordController()
const profileController = new ProfileController()
const registerController = new RegisterController()

// get
gameRouter
    // word
    .get('/word/:category', wordController.getWords)
    // profile
    .get('/profile/:player_id', profileController.getProfile)

// post
gameRouter
    // word
    .post('/word', authorization.uuid, wordController.insertWords)
    // register
    .post('/register', registerController.player)

export { gameRouter }