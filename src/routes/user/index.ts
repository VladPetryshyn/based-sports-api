import express from "express"
import jwt from "jsonwebtoken"
import { createUserPost } from "../validation/user";
import { ValidationError } from "yup";
import * as db from "../../db/setup";
import { RequestI } from "../types";
import { User } from "../../db/types";

export const userRouter = express.Router();

interface userRouterI {
  user: User
}

userRouter.use((req, res, next) => {
  const token = req.get("token")
  if (!token) return res.status(400).json({ message: "Unauthenticated" })
  try {
    const user = jwt.verify(token, String(process.env.SECRET))
    if (user) {
      req.body.user = user
      return next()
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

const posts = express.Router()
userRouter.use("/post", posts)

const workouts = express.Router()
userRouter.use("/workout", workouts)

interface createPostI extends userRouterI {
  title: string;
  description: string;
  content: string;
}


posts.post("/", async (req: RequestI<createPostI>, res) => {
  try {
    await createUserPost.validate(req.body)
  } catch (err) {
    const error = err as ValidationError
    if (error.path) {
      return res.status(400).json({
        [error.path]: error.errors[0]
      })
    } else {
      return res.status(500).json({
        error: "Internal server error"
      })
    }
  }

  const post = new db.Post({
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    authorId: req.body.user._id,
    authorUsername: req.body.user.username,
  })

  await post.save()

  return res.send("Created successfully")
})

posts.put("/:postId", async (req, res) => {
  try {
    await createUserPost.validate(req.body)
  } catch (err) {
    const error = err as ValidationError
    if (error.path) {
      return res.status(400).json({
        [error.path]: error.errors[0]
      })
    } else {
      return res.status(500).json({
        error: "Internal server error"
      })
    }
  }

  const { postId } = req.params

  try {
    await db.Post.updateOne({ _id: postId }, {
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
    }, { upsert: true })
    return res.json({
      message: "Updated successfully"
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal server error"
    })
  }
})

posts.delete("/:postId", async (req, res) => {
  const { postId } = req.params
  try {
    const post = await db.Post.findById(postId).where("author", req.body.user.id)
    if (post) {
      post?.deleteOne()

      return res.status(200).json({
        message: "Post has been deleted"
      })
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

posts.put("/like/:postId", async (req, res) => {
  const { postId } = req.params
  try {
    const isAlreadyLiked = await db.Post.exists({ _id: postId, likedUsers: req.body.user._id })

    if (!isAlreadyLiked) {
      await db.Post.updateOne({ _id: postId }, { $push: { likedUsers: [req.body.user._id] }, $inc: { likes: 1 } })
      const isDisliked = await db.Post.exists({ _id: postId, dislikedUsers: req.body.user._id })

      if (isDisliked) await db.Post.updateOne({ _id: postId }, { $pull: { dislikedUsers: req.body.user._id }, $inc: { dislikes: -1 } })
      return res.json({
        message: "Post liked"
      })
    } else {
      await db.Post.updateOne({ _id: postId }, { $pull: { likedUsers: req.body.user._id }, $inc: { likes: -1 } })
      return res.json({
        message: "Post unliked"
      })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal server error"
    })
  }
})

posts.put("/dislike/:postId", async (req, res) => {
  const { postId } = req.params
  try {
    const isAlreadyDisliked = await db.Post.exists({ _id: postId, dislikedUsers: req.body.user._id })

    if (!isAlreadyDisliked) {
      await db.Post.updateOne({ _id: postId }, { $push: { dislikedUsers: req.body.user._id }, $inc: { dislikes: 1 } })

      const isLiked = await db.Post.exists({ _id: postId, likedUsers: req.body.user._id })

      if (isLiked) await db.Post.updateOne({ _id: postId }, { $pull: { likedUsers: req.body.user._id }, $inc: { likes: -1 } })
      return res.json({
        message: "Post disliked"
      })
    } else {
      await db.Post.updateOne({ _id: postId }, { $pull: { dislikedUsers: req.body.user._id }, $inc: { dislikes: -1 } })
      return res.json({
        message: "Post undisliked"
      })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal server error"
    })
  }
})

workouts.post("/", async (req, res) => {
  const user = await db.User.findOne({ username: req.body.user.username })

  const workout = new db.Workout({
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    authorUsername: user?.username,
    authorId: user?._id,
  })

  await workout.save()

  return res.send("Created successfully")
})

workouts.delete("/:workoutId", async (req, res) => {
  const { workoutId } = req.params
  try {
    const workout = await db.Workout.findById(workoutId).where("author", req.body.user.id)
    message: "Internal server error"
    if (workout) {
      workout?.deleteOne()

      return res.status(200).json({
        message: "Workout has been deleted"
      })
    }

    return res.status(404).json({
      error: "Workout not found"
    })
  } catch {
    return res.status(404).json({
      error: "Workout not found"
    })
  }
})

workouts.put("/:workoutId", async (req, res) => {
  const { workoutId } = req.params
  try {
    await db.Workout.updateOne({ _id: workoutId }, {
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
    }, { upsert: true })
    return res.json({
      message: "Updated successfully"
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal server error"
    })
  }
})


workouts.put("/like/:workoutId", async (req, res) => {
  const { workoutId } = req.params
  try {
    const isAlreadyLiked = await db.Workout.exists({ _id: workoutId, likedUsers: req.body.user._id })

    if (!isAlreadyLiked) {
      await db.Workout.updateOne({ _id: workoutId }, { $push: { likedUsers: [req.body.user._id] }, $inc: { likes: 1 } })
      const isDisliked = await db.Workout.exists({ _id: workoutId, dislikedUsers: req.body.user._id })

      if (isDisliked) await db.Workout.updateOne({ _id: workoutId }, { $pull: { dislikedUsers: req.body.user._id }, $inc: { dislikes: -1 } })
      return res.json({
        message: "Workout liked"
      })
    } else {
      await db.Workout.updateOne({ _id: workoutId }, { $pull: { likedUsers: req.body.user._id }, $inc: { likes: -1 } })
      return res.json({
        message: "Workout unliked"
      })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal server error"
    })
  }
})

workouts.put("/dislike/:workoutId", async (req, res) => {
  const { workoutId } = req.params
  try {
    const isAlreadyDisliked = await db.Workout.exists({ _id: workoutId, dislikedUsers: req.body.user._id })

    if (!isAlreadyDisliked) {
      await db.Workout.updateOne({ _id: workoutId }, { $push: { dislikedUsers: req.body.user._id }, $inc: { dislikes: 1 } })

      const isLiked = await db.Workout.exists({ _id: workoutId, likedUsers: req.body.user._id })

      if (isLiked) await db.Workout.updateOne({ _id: workoutId }, { $pull: { likedUsers: req.body.user._id }, $inc: { likes: -1 } })
      return res.json({
        message: "Workout disliked"
      })
    } else {
      await db.Workout.updateOne({ _id: workoutId }, { $pull: { dislikedUsers: req.body.user._id }, $inc: { dislikes: -1 } })
      return res.json({
        message: "Workout undisliked"
      })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "Internal server error"
    })
  }
})
