import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { Etapa, EtapaProps } from "./etapa.entity";

type EtapaRecord = {
    id: string;
    nome: string;
    prazoConclusao: Date | string;
    prioridade: number;
    aeronaveCodigo: string;
    statusTracker: unknown;
    funcionarios?: { id: string }[];
};

export class EtapaRepository {
    async criar(etapa: Etapa): Promise<Etapa> {
        const etapaCriada = await prisma.etapa.create({
            data: this.toPrismaCreateData(etapa),
            include: this.includeFuncionarios()
        });

        return this.hydrate(etapaCriada);
    }

    async listar(): Promise<Etapa[]> {
        const etapas = await prisma.etapa.findMany({
            include: this.includeFuncionarios(),
            orderBy: [{ aeronaveCodigo: "asc" }, { prazoConclusao: "asc" }, { prioridade: "asc" }, { id: "asc" }]
        });

        return etapas.map((etapa) => this.hydrate(etapa));
    }

    async gerarProximoId(): Promise<string> {
        const etapas = await prisma.etapa.findMany({
            select: { id: true }
        });

        const maiorId = etapas.reduce((maior, etapa) => {
            const idNumerico = Number(etapa.id);
            return Number.isInteger(idNumerico) && idNumerico > maior ? idNumerico : maior;
        }, 0);

        return String(maiorId + 1);
    }

    async buscarPorId(id: string): Promise<Etapa | null> {
        const etapa = await prisma.etapa.findUnique({
            where: { id: id.trim() },
            include: this.includeFuncionarios()
        });

        return etapa ? this.hydrate(etapa) : null;
    }

    async buscarPorNomeEAeronave(
        nome: string,
        aeronaveCodigo: string,
        ignorarId?: string
    ): Promise<Etapa | null> {
        const etapa = await prisma.etapa.findFirst({
            where: {
                nome: nome.trim(),
                aeronaveCodigo: aeronaveCodigo.trim().toUpperCase(),
                ...(ignorarId ? { id: { not: ignorarId.trim() } } : {})
            },
            include: this.includeFuncionarios()
        });

        return etapa ? this.hydrate(etapa) : null;
    }

    async atualizar(id: string, etapa: Etapa): Promise<Etapa | null> {
        try {
            const etapaAtualizada = await prisma.etapa.update({
                where: { id: id.trim() },
                data: this.toPrismaUpdateData(etapa),
                include: this.includeFuncionarios()
            });

            return this.hydrate(etapaAtualizada);
        } catch (error) {
            if (this.isRegistroNaoEncontrado(error)) {
                return null;
            }

            throw error;
        }
    }

    async deletar(id: string): Promise<boolean> {
        try {
            await prisma.etapa.delete({
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

    private hydrate(data: EtapaRecord): Etapa {
        return new Etapa({
            id: data.id,
            nome: data.nome,
            prazoConclusao: new Date(data.prazoConclusao).toISOString(),
            prioridade: data.prioridade,
            aeronaveCodigo: data.aeronaveCodigo,
            funcionariosIds: data.funcionarios?.map((funcionario) => funcionario.id) ?? [],
            statusTracker: data.statusTracker as EtapaProps["statusTracker"]
        });
    }

    private toPrismaCreateData(etapa: Etapa): Prisma.EtapaCreateInput {
        return {
            id: etapa.id,
            nome: etapa.nome,
            prazoConclusao: new Date(etapa.prazoConclusao),
            prioridade: etapa.prioridade,
            statusTracker: this.toJson(etapa.toResponse().statusTracker),
            aeronave: {
                connect: { codigo: etapa.aeronaveCodigo }
            },
            funcionarios: {
                connect: etapa.funcionariosIds.map((id) => ({ id }))
            }
        };
    }

    private toPrismaUpdateData(etapa: Etapa): Prisma.EtapaUpdateInput {
        return {
            nome: etapa.nome,
            prazoConclusao: new Date(etapa.prazoConclusao),
            prioridade: etapa.prioridade,
            statusTracker: this.toJson(etapa.toResponse().statusTracker),
            aeronave: {
                connect: { codigo: etapa.aeronaveCodigo }
            },
            funcionarios: {
                set: etapa.funcionariosIds.map((id) => ({ id }))
            }
        };
    }

    private includeFuncionarios() {
        return {
            funcionarios: {
                select: { id: true }
            }
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
