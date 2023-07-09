import { Request } from "express";

export type RequestI<K> = Request<{}, {}, K>
