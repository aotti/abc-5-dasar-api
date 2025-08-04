import express from 'express' 
import { Authorization } from '../middlewares/authorization'
import { WordController } from '../controllers/WordController'
import { ProfileController } from '../controllers/ProfileController'
import { RegisterController } from '../controllers/RegisterController'
import { RoomController } from '../controllers/RoomController'
import { RoundController } from '../controllers/RoundController'

const gameRouter = express.Router()
// cors
const cors = require('cors')
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'user-id'],
}
// middleware 
const authorization = new Authorization()
// game classes
const wordController = new WordController()
const profileController = new ProfileController()
const registerController = new RegisterController()
const roomController = new RoomController()
const roundController = new RoundController()

// get
gameRouter
    // word
    .get('/word/categories', cors(corsOptions), wordController.getCategories)
    .get('/word/:category', wordController.getWords)
    // profile
    .get('/profile/:player_id', profileController.getProfile)
    // room
    .get('/room/join', authorization.uuid, authorization.auth, roomController.joinRoom)

// post
gameRouter
    // word
    .post('/word/insert', authorization.uuid, wordController.insertWords)
    // register
    .post('/register/player', authorization.uuid, registerController.player)
    // room
    .post('/room/create', authorization.uuid, authorization.auth, roomController.createRoom)
    // rounds
    .post('/round/insert', authorization.uuid, authorization.auth, roundController.insert)

// patch
gameRouter
    // profile
    .patch('/profile/update', authorization.uuid, authorization.auth, profileController.updateProfile)
    // room
    .patch('/room/update', authorization.uuid, authorization.auth, roomController.updateRoom)
    // round
    .patch('/round/update', authorization.uuid, authorization.auth, roundController.update)

export { gameRouter }