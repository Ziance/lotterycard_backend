import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";
import Template from "../response/index";

export const checkAccessTokenValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = <string>req.headers["auth"];

  if (token) {
    jwt.verify(token, config.jwtSecret || "", (error, decoded) => {
      if (!error) {
        res.locals.jwt = decoded;
        next();
      } else {
        Template.unauthorized(res);
      }
    });
  } else {
    return Template.tokenEmpty(res).status(401);
  }
};
