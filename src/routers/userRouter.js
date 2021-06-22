import express from "express";
import { protectorMiddleware, publicOnlyMiddleware } from "../../middlewares";
import { getEdit, see, logout, startGithubLogin, finishGithubLogin, postEdit, getLogin } from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get(":/id", see);

export default userRouter;