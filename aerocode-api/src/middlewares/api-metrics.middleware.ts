import { performance } from "perf_hooks";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { prisma } from "../shared/prisma";

export function apiMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!env.apiMetricsEnabled) {
        next();
        return;
    }

    const inicio = performance.now();
    const iniciadoEm = new Date();

    res.on("finish", () => {
        const fim = performance.now();
        const finalizadoEm = new Date();
        const duracaoMs = Number((fim - inicio).toFixed(2));
        const rota = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.originalUrl;

        console.log(
            `[API Metrics] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duracaoMs} ms`
        );

        if (!env.apiMetricsPersist) {
            return;
        }

        prisma.apiMetric.create({
            data: {
                metodo: req.method,
                caminho: req.originalUrl,
                rota,
                statusCode: res.statusCode,
                duracaoMs,
                iniciadoEm,
                finalizadoEm,
                ip: req.ip,
                userAgent: req.header("user-agent")
            }
        }).catch((error) => {
            const message = error instanceof Error ? error.message : "Erro desconhecido.";
            console.error(`[API Metrics] Falha ao salvar metrica: ${message}`);
        });
    });

    next();
}
