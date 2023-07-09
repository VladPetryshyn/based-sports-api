import mongoose from "mongoose"
import { Post as PostI, User as UserI, Workout as WorkoutI } from "./types"

const MONGO = process.env.MONGODB_URL

const Schema = mongoose.Schema

mongoose.connect(String(MONGO))
mongoose.Promise = global.Promise


export const userSchema = new Schema<UserI>({
  username: { type: String, unique: true, required: true },
  hash: { type: String, required: true }
})

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    delete ret.hash;
  }
})

export const User = mongoose.model<UserI>("User", userSchema)

// Post
export const postSchema = new Schema<PostI>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  authorUsername: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, required: true, },
  likes: Number,
  dislikes: Number,
  dislikedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  likedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isOwner: { type: Boolean },
  isLiked: { type: Boolean },
  isDisliked: { type: Boolean }
}, { timestamps: true });


postSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    delete ret._id
    delete ret.createdAt
    delete ret.__v
    delete ret.authorId
  },
})

postSchema.pre('save', function(next) {
  if (!this.likes) {
    this.likes = 0;
    this.dislikes = 0;
    this.likedUsers = [];
    this.dislikedUsers = [];
  }

  next();
})

export const Post = mongoose.model<PostI>("Post", postSchema)

// Workout
export const workoutSchema = new Schema<WorkoutI>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: [{ title: String, time: Date }],
  likes: Number,
  authorUsername: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, required: true, },
  dislikes: Number,
  dislikedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  likedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isOwner: { type: Boolean },
  isLiked: { type: Boolean },
  isDisliked: { type: Boolean }
}, { timestamps: true });

workoutSchema.pre('save', function(next) {
  if (!this.likes) {
    this.likes = 0;
    this.dislikes = 0;
    this.likedUsers = [];
    this.dislikedUsers = [];
  }


  next();
})

workoutSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(_, ret) {
    delete ret._id
    delete ret.createdAt
    delete ret.__v
    delete ret.authorId
  },
})


export const Workout = mongoose.model<WorkoutI>("Workout", workoutSchema)
