import express from "express"
import * as db from "../../db/setup";
import { getUser, transformContent, transformContentArray } from "../helpers";

export const postRouter = express.Router();

postRouter.use((req, _, next) => {
  const user = getUser(req.get("token"))
  if (user) req.body.user = user;
  return next();
})

postRouter.get("/", async (req, res) => {
  const { user } = req.body;
  const posts = await db.Post.find().limit(20).select("-content").transform(transformContentArray(user))
  return res.json(posts)
})

// TODO fix that it can't find user
postRouter.get("/user/:username", async (req, res) => {
  const { username } = req.params
  const { user } = req.body;

  const posts = await db.Post.find({ authorUsername: username }).limit(10).select("-content").transform(transformContentArray(user))
  return res.json(posts)
})

postRouter.get("/post/:postId", async (req, res) => {
  const { postId } = req.params
  try {
    const post = await db.Post.find({ _id: postId }).transform(transformContentArray(req.body.user))
    if (post) {
      return res.json(post[0])
    }
  } catch {
    return res.status(404).json({
      error: "Post not found"
    })
  }
})
