import { Prisma, TipoPeca as PrismaTipoPeca } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { Peca, PecaProps } from "./peca.entity";

type PecaRecord = {
    id: string;
    nome: string;
    tipo: string;
    fornecedor: string;
    aeronaveCodigo: string;
    statusTracker: unknown;
};

export class PecaRepository {
    async criar(peca: Peca): Promise<Peca> {
        const pecaCriada = await prisma.peca.create({
            data: this.toPrismaData(peca)
        });

        return this.hydrate(pecaCriada);
    }

    async listar(): Promise<Peca[]> {
        const pecas = await prisma.peca.findMany({
            orderBy: { id: "asc" }
        });

        return pecas.map((peca) => this.hydrate(peca));
    }

    async gerarProximoId(): Promise<string> {
        const pecas = await prisma.peca.findMany({
            select: { id: true }
        });

        const maiorId = pecas.reduce((maior, peca) => {
            const idNumerico = Number(peca.id);
            return Number.isInteger(idNumerico) && idNumerico > maior ? idNumerico : maior;
        }, 0);

        return String(maiorId + 1);
    }

    async buscarPorId(id: string): Promise<Peca | null> {
        const peca = await prisma.peca.findUnique({
            where: { id: id.trim() }
        });

        return peca ? this.hydrate(peca) : null;
    }

    async buscarPorNome(nome: string): Promise<Peca | null> {
        const peca = await prisma.peca.findFirst({
            where: { nome: nome.trim() }
        });

        return peca ? this.hydrate(peca) : null;
    }

    async atualizar(id: string, peca: Peca): Promise<Peca | null> {
        try {
            const pecaAtualizada = await prisma.peca.update({
                where: { id: id.trim() },
                data: this.toPrismaData(peca)
            });

            return this.hydrate(pecaAtualizada);
        } catch (error) {
            if (this.isRegistroNaoEncontrado(error)) {
                return null;
            }

            throw error;
        }
    }

    async deletar(id: string): Promise<boolean> {
        try {
            await prisma.peca.delete({
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

    private hydrate(data: PecaRecord): Peca {
        return new Peca({
            id: data.id,
            nome: data.nome,
            tipo: data.tipo,
            fornecedor: data.fornecedor,
            aeronaveCodigo: data.aeronaveCodigo,
            statusTracker: data.statusTracker as PecaProps["statusTracker"]
        });
    }

    private toPrismaData(peca: Peca) {
        return {
            id: peca.id,
            nome: peca.nome,
            tipo: peca.tipo as unknown as PrismaTipoPeca,
            fornecedor: peca.fornecedor,
            aeronaveCodigo: peca.aeronaveCodigo,
            statusTracker: this.toJson(peca.toResponse().statusTracker)
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
