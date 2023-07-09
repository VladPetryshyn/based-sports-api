import express from "express";
import bcrypt from "bcryptjs"
import * as db from "../../db/setup";
import jwt from "jsonwebtoken"
import { RequestI } from "../types";
import { authScheme } from "../validation/auth";
import { ValidationError } from "yup";

export const authRouter = express.Router();

const SECRET = process.env.SECRET

interface authDataI {
  username: string;
  password: string;
}

authRouter.post("/login", async (req: RequestI<authDataI>, res) => {
  try {
    await authScheme.validate(req.body)
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

  const { username, password } = req.body
  const user = await db.User.findOne({ username })

  if (!user) return res.status(404).json({
    "error": "User not found"
  })

  if (!bcrypt.compareSync(password, user.hash)) {
    return res.status(500).json({
      password: "Password is incorrect"
    })
  }

  const token = jwt.sign({ username: user.username, _id: user._id }, String(SECRET), { expiresIn: "3d" })

  return res.status(200).json({
    token
  })
})

authRouter.post("/register", async (req: RequestI<authDataI>, res) => {
  try {
    await authScheme.validate(req.body)
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

  const { username, password } = req.body

  const user = await db.User.findOne({ username })
  if (user) {
    return res.status(500).json({
      username: "Username is already taken"
    })
  }

  const newUser = new db.User({
    username,
    hash: bcrypt.hashSync(password, 10)
  })

  await newUser.save();
  return res.status(200).json({
    message: "successfully created an user"
  })
})
