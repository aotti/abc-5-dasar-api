import express from 'express' 
import { config } from 'dotenv'
import { resolve } from 'path'
import { gameRouter } from './routes/game-route'

// set the env file
const envFilePath = resolve(process.cwd(), '.env')
config({ path: envFilePath })

const app = express()
const port = 3000

app.use(express.json());
app.get('/', (req, res) => {
    return res.send('<h1> typescript lancau </h1>')
})
app.use('/api', gameRouter)

app.listen(port, () => {console.log(`listening to port ${port}`)})

export default app