import { object, string } from "yup";

export const createUserPost = object({
  title: string().required().min(8),
  description: string().required(),
  content: string().required()
})
