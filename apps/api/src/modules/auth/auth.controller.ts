import { Router, Response } from "express";
import { registerSchema, loginSchema } from "@fixflow/contracts";
import { registerUserAndShop, loginUser, getCurrentUser } from "./auth.service";
import { authenticate, AuthRequest } from "../../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", async (req: AuthRequest, res: Response, next) => {
  try {
    const validated = registerSchema.parse(req.body);
    const result = await registerUserAndShop(validated, req.requestId);
    res.status(201).json({ data: result, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req: AuthRequest, res: Response, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await loginUser(validated, req.requestId);
    res.status(200).json({ data: result, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const result = getCurrentUser(req.user!.id, req.shopId);
    res.status(200).json({ data: result, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});
