import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { logger } from "../logger.js";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Missing fields" });
      }
      const result = await AuthService.register(email, password, name);
      res.status(201).json(result);
    } catch (error: any) {
      logger.error(
        { err: error, route: "POST /api/auth/register" },
        "Registration failed",
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(result);
    } catch (error) {
      logger.error(
        { err: error, route: "POST /api/auth/login" },
        "Login failed",
      );
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
