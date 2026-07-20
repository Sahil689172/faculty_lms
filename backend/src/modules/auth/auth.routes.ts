import { Router } from "express";
import { authController } from "./auth.controller.js";
import { loginSchema } from "./auth.validation.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorize } from "../../middleware/authorize.js";
import { Roles } from "../../constants/roles.js";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.get("/me", authenticate, authorize(Roles.FACULTY), authController.me);
