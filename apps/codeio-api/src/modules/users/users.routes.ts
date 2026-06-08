import { Router } from "express";

import { validate } from "../../middleware/validate";
import { getUserSchema } from "./users.validation";
import { getSingleUser } from "./users.controller";

const router = Router();

router.get("/:id", validate(getUserSchema), getSingleUser);

export default router;
