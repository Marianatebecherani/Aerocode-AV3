import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { TokenService } from "../modules/auth/token.service";

const tokenService = new TokenService();

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!env.authTokenRequired) {
        next();
        return;
    }

    const authorization = req.header("Authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";

    if (!token) {
        res.status(401).json({ message: "Token de autenticacao nao informado." });
        return;
    }

    try {
        tokenService.verificarToken(token);
        next();
    } catch (error) {
        const message = error instanceof Error ? error.message : "Token de autenticacao invalido.";
        res.status(401).json({ message });
    }
}
