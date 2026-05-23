import { Prisma, TipoTeste as PrismaTipoTeste } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { Teste, TesteProps } from "./teste.entity";

type TesteRecord = {
    id: string;
    tipo: string;
    aeronaveCodigo: string;
    resultadoTracker: unknown;
};

export class TesteRepository {
    async criar(teste: Teste): Promise<Teste> {
        const testeCriado = await prisma.teste.create({
            data: this.toPrismaData(teste)
        });

        return this.hydrate(testeCriado);
    }

    async listar(): Promise<Teste[]> {
        const testes = await prisma.teste.findMany({
            orderBy: { id: "asc" }
        });

        return testes.map((teste) => this.hydrate(teste));
    }

    async gerarProximoId(): Promise<string> {
        const testes = await prisma.teste.findMany({
            select: { id: true }
        });

        const maiorId = testes.reduce((maior, teste) => {
            const idNumerico = Number(teste.id);
            return Number.isInteger(idNumerico) && idNumerico > maior ? idNumerico : maior;
        }, 0);

        return String(maiorId + 1);
    }

    async buscarPorId(id: string): Promise<Teste | null> {
        const teste = await prisma.teste.findUnique({
            where: { id: id.trim() }
        });

        return teste ? this.hydrate(teste) : null;
    }

    async atualizar(id: string, teste: Teste): Promise<Teste | null> {
        try {
            const testeAtualizado = await prisma.teste.update({
                where: { id: id.trim() },
                data: this.toPrismaData(teste)
            });

            return this.hydrate(testeAtualizado);
        } catch (error) {
            if (this.isRegistroNaoEncontrado(error)) {
                return null;
            }

            throw error;
        }
    }

    async deletar(id: string): Promise<boolean> {
        try {
            await prisma.teste.delete({
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

    private hydrate(data: TesteRecord): Teste {
        return new Teste({
            id: data.id,
            tipo: data.tipo,
            aeronaveCodigo: data.aeronaveCodigo,
            resultadoTracker: data.resultadoTracker as TesteProps["resultadoTracker"]
        });
    }

    private toPrismaData(teste: Teste) {
        return {
            id: teste.id,
            tipo: teste.tipo as unknown as PrismaTipoTeste,
            aeronaveCodigo: teste.aeronaveCodigo,
            resultadoTracker: this.toJson(teste.toResponse().resultadoTracker)
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
