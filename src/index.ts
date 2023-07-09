import 'dotenv/config'
import express from "express"
import { authRouter } from "./routes/auth"
import bodyParser from 'body-parser';
import { postRouter } from "./routes/posts";
import { userRouter } from "./routes/user";
import { workoutRouter } from './routes/workouts';
import cors from "cors"

export const app = express()

app.use(bodyParser.json())
app.use(cors())


app.use("/auth", authRouter)
app.use("/posts", postRouter)
app.use("/user", userRouter)
app.use("/workouts", workoutRouter)

app.listen(8000)
