import jwt = require("jsonwebtoken");
import { env } from "../../config/env";
import { FuncionarioResponseDTO } from "../funcionario";

type TokenPayload = {
    sub: string;
    usuario: string;
    nome: string;
    nivelPermissao: string;
};

export class TokenService {
    gerarToken(funcionario: FuncionarioResponseDTO): string {
        return jwt.sign({
            sub: funcionario.id,
            usuario: funcionario.usuario,
            nome: funcionario.nome,
            nivelPermissao: funcionario.nivelPermissao
        }, env.authTokenSecret, {
            algorithm: "HS256",
            expiresIn: env.authTokenExpiresInSeconds
        });
    }

    verificarToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, env.authTokenSecret) as TokenPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error("Token expirado.");
            }

            throw new Error("Token invalido.");
        }
    }
}
