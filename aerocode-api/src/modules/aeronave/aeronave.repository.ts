import { TipoAeronave as PrismaTipoAeronave } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { Aeronave, AeronaveProps } from "./aeronave.entity";

export class AeronaveRepository {
    async criar(aeronave: Aeronave): Promise<Aeronave> {
        const aeronaveCriada = await prisma.aeronave.create({
            data: this.toPrismaData(aeronave)
        });

        return this.hydrate(aeronaveCriada);
    }

    async listar(): Promise<Aeronave[]> {
        const aeronaves = await prisma.aeronave.findMany({
            orderBy: { codigo: "asc" }
        });

        return aeronaves.map((aeronave) => this.hydrate(aeronave));
    }

    async gerarProximoCodigo(): Promise<string> {
        const aeronaves = await prisma.aeronave.findMany({
            select: { codigo: true },
            where: {
                codigo: {
                    startsWith: "AER-"
                }
            }
        });

        const maiorCodigo = aeronaves.reduce((maior, aeronave) => {
            const match = aeronave.codigo.match(/^AER-(\d{4})$/);
            if (!match) {
                return maior;
            }

            const codigoNumerico = Number(match[1]);
            return codigoNumerico > maior ? codigoNumerico : maior;
        }, 0);

        return `AER-${String(maiorCodigo + 1).padStart(4, "0")}`;
    }

    async buscarPorCodigo(codigo: string): Promise<Aeronave | null> {
        const aeronave = await prisma.aeronave.findUnique({
            where: { codigo: codigo.trim() }
        });

        return aeronave ? this.hydrate(aeronave) : null;
    }

    async atualizar(codigo: string, aeronave: Aeronave): Promise<Aeronave | null> {
        try {
            const aeronaveAtualizada = await prisma.aeronave.update({
                where: { codigo: codigo.trim() },
                data: this.toPrismaData(aeronave)
            });

            return this.hydrate(aeronaveAtualizada);
        } catch (error) {
            if (this.isRegistroNaoEncontrado(error)) {
                return null;
            }

            throw error;
        }
    }

    async deletar(codigo: string): Promise<boolean> {
        try {
            await prisma.aeronave.delete({
                where: { codigo: codigo.trim() }
            });

            return true;
        } catch (error) {
            if (this.isRegistroNaoEncontrado(error)) {
                return false;
            }

            throw error;
        }
    }

    private hydrate(data: AeronaveProps): Aeronave {
        return new Aeronave(data);
    }

    private toPrismaData(aeronave: Aeronave) {
        return {
            codigo: aeronave.codigo,
            modelo: aeronave.modelo,
            tipo: aeronave.tipo as unknown as PrismaTipoAeronave,
            capacidade: aeronave.capacidade,
            alcance: aeronave.alcance
        };
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
