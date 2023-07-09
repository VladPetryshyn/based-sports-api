import express from "express"
import * as  db from "../../db/setup"
import { getUser, transformContent, transformContentArray } from "../helpers"

export const workoutRouter = express.Router()

workoutRouter.use((req, _, next) => {
  const user = getUser(req.get("token"))
  if (user) req.body.user = user;
  return next();
})

workoutRouter.get("/", async (req, res) => {
  const workouts = await db.Workout.find({}).limit(20).select("-content").transform(transformContentArray(req.body.user));
  return res.json(workouts)
})

workoutRouter.get("/workouts/:workoutId", async (req, res) => {
  const { workoutId } = req.params
  try {
    const workout = await db.Workout.find({ _id: workoutId }).transform(transformContentArray(req.body.user));
    if (workout) {
      return res.json(workout[0])
    }

    return res.status(404).json({
      error: "Post not found"
    })
  } catch {
    return res.status(404).json({
      error: "Post not found"
    })
  }
})

workoutRouter.get("/user/:username", async (req, res) => {
  const { username } = req.params
  const { user } = req.body;

  const posts = await db.Workout.find({ authorUsername: username }).limit(10).select("-content").transform(transformContentArray(user))

  return res.json(posts)
})
