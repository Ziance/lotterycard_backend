import { Router } from "express";
import user from "./user";
import auth from "./auth";
import card from "./card";


const routes = Router();
routes.use("/", auth);
routes.use("/users", user);
routes.use("/card",card)

export { routes };
