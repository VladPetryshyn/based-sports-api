export interface User {
  username: string;
  hash: string;
  _id: string;
}
export interface Content {
  likes: number;
  dislikes: number;
  dislikedUsers: string[] | undefined
  likedUsers: string[] | undefined
  isOwner?: boolean;
  isDisliked?: boolean;
  isLiked?: boolean;
  authorUsername: string;
  authorId: any;
}
export interface Post extends Content {
  title: string;
  description: string;
  content: string;
}
export interface Workout extends Content {
  title: string;
  description: string;
  content: { title: string; time: Date }[];
}
