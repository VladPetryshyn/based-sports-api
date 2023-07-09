import { object, string } from "yup"

export const authScheme = object({
  password: string().required().min(8),
  username: string().required().min(4).max(13)
})
