import express from 'express'
import cors from 'cors'
import AppRoutes from './routes/index.js'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
dotenv.config()

let app=express()
const PORT = process.env.PORT;

app.use(cors())
app.use(express.json());
app.use('/', AppRoutes)
app.use(cookieParser());

app.listen(PORT,()=>{console.log(`App is Listening to ${PORT}`);})