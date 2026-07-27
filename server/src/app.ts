import express from 'express'
import cookieParser from 'cookie-parser'
import { db } from './config/mysql.config'

const app = express()

// EXPRESS GLOBAL MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// HEALTH STATUS CHECKUP
app.get('/api/health', async (req, res, next) => {
    try {
        //testing the mysql connection
        await db.execute('SELECT 1')

        // health data
        const healthData = {
            server: "UP",
            mysql: "Connected",
            timestamp: new Date().toISOString()
        }

        res
        .status(200)
        .json(healthData)

    } catch(error) {
        next(error)
    }
})

export { app }