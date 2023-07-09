import jwt from "jsonwebtoken"
import { Content, User } from "../db/types"
import { Document } from "mongoose";

export const getUser = (token?: string): User | undefined => {
  if (!token) return;
  try {
    return jwt.verify(token, String(process.env.SECRET)) as User
  } catch {
    return;
  }
}

export const transformContentArray = (user: any) => (res: (Document<unknown, {}, Content> & Omit<Content & {}, never>)[]) => res.map((itm) => {
  if (user) {
    itm.isLiked = itm.likedUsers?.includes(user?._id)
    itm.isDisliked = itm.dislikedUsers?.includes(user?._id)
  }
  itm.isOwner = itm.authorUsername === user?.username
  itm.likedUsers = undefined
  itm.dislikedUsers = undefined
  return itm
})

export const transformContent = (user: any) => (itm: (Document<unknown, {}, Content> & Omit<Content & {}, never>) | null) => {
  if (itm) {
    itm.isLiked = !!itm.likedUsers?.includes(user?._id)
    itm.isDisliked = !!itm.dislikedUsers?.includes(user?._id)
    itm.isOwner = itm.authorUsername === user?.username
    return itm;
  }

  return null;
}
