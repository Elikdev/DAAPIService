import { Router } from "express";
import { authMiddleWare } from "./auth/auth";
import { UserController } from "./controller/user";

export const v1router = Router();

// Do auth filtering
v1router.use(authMiddleWare);

v1router.post("/signup", UserController.signUp);
v1router.post("/signin", UserController.signIn);