import { Router } from "express";
import userRouter from "../modules/users/user.route";

// Example placeholder routes
const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// TODO: attach module routes here
router.use("/users", userRouter);
// router.use("/products", productRoutes);

export default router;
