import { Prisma, StatusRelatorio as PrismaStatusRelatorio } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { Relatorio, RelatorioProps } from "./relatorio.entity";

type RelatorioRecord = {
    id: string;
    aeronaveCodigo: string;
    dataEmissao: Date | string;
    status: string;
    detalhes: unknown;
};

export class RelatorioRepository {
    async criar(relatorio: Relatorio): Promise<Relatorio> {
        const relatorioCriado = await prisma.relatorio.create({
            data: this.toPrismaData(relatorio)
        });

        return this.hydrate(relatorioCriado);
    }

    async listar(): Promise<Relatorio[]> {
        const relatorios = await prisma.relatorio.findMany({
            orderBy: { dataEmissao: "desc" }
        });

        return relatorios.map((relatorio) => this.hydrate(relatorio));
    }

    async gerarProximoId(): Promise<string> {
        const relatorios = await prisma.relatorio.findMany({
            select: { id: true }
        });

        const maiorId = relatorios.reduce((maior, relatorio) => {
            const idNumerico = Number(relatorio.id);
            return Number.isInteger(idNumerico) && idNumerico > maior ? idNumerico : maior;
        }, 0);

        return String(maiorId + 1);
    }

    async buscarPorId(id: string): Promise<Relatorio | null> {
        const relatorio = await prisma.relatorio.findUnique({
            where: { id: id.trim() }
        });

        return relatorio ? this.hydrate(relatorio) : null;
    }

    async deletar(id: string): Promise<boolean> {
        try {
            await prisma.relatorio.delete({
                where: { id: id.trim() }
            });

            return true;
        } catch (error) {
            if (this.isRegistroNaoEncontrado(error)) {
                return false;
            }

            throw error;
        }
    }

    private hydrate(data: RelatorioRecord): Relatorio {
        return new Relatorio({
            id: data.id,
            aeronaveCodigo: data.aeronaveCodigo,
            dataEmissao: new Date(data.dataEmissao).toISOString(),
            status: data.status,
            detalhes: data.detalhes as RelatorioProps["detalhes"]
        });
    }

    private toPrismaData(relatorio: Relatorio) {
        return {
            id: relatorio.id,
            aeronaveCodigo: relatorio.aeronaveCodigo,
            dataEmissao: new Date(relatorio.dataEmissao),
            status: relatorio.status as unknown as PrismaStatusRelatorio,
            detalhes: this.toJson(relatorio.detalhes)
        };
    }

    private toJson(value: unknown): Prisma.InputJsonValue {
        return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
    }

    private isRegistroNaoEncontrado(error: unknown): boolean {
        return (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2025"
        );
    }
}
