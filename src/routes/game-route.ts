import express from 'express' 
import { Authorization } from '../middlewares/authorization'
import { WordController } from '../controllers/WordController'
import { ProfileController } from '../controllers/ProfileController'
import { RegisterController } from '../controllers/RegisterController'
import { RoomController } from '../controllers/RoomController'

const gameRouter = express.Router()
// middleware 
const authorization = new Authorization()
// game classes
const wordController = new WordController()
const profileController = new ProfileController()
const registerController = new RegisterController()
const roomController = new RoomController()

// get
gameRouter
    // word
    .get('/word/categories', wordController.getCategories)
    .get('/word/:category', wordController.getWords)
    // profile
    .get('/profile/:player_id', profileController.getProfile)

// post
gameRouter
    // word
    .post('/word/insert', authorization.uuid, wordController.insertWords)
    // register
    .post('/register/player', authorization.uuid, registerController.player)
    // room
    .post('/room/create', authorization.auth, roomController.createRoom)

export { gameRouter }