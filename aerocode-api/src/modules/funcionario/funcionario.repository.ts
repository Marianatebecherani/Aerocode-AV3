import { NivelPermissao as PrismaNivelPermissao } from "@prisma/client";
import { prisma } from "../../shared/prisma";
import { Funcionario, FuncionarioProps } from "./funcionario.entity";

export class FuncionarioRepository {
    async criar(funcionario: Funcionario): Promise<Funcionario> {
        const funcionarioCriado = await prisma.funcionario.create({
            data: this.toPrismaData(funcionario)
        });

        return this.hydrate(funcionarioCriado);
    }

    async listar(): Promise<Funcionario[]> {
        const funcionarios = await prisma.funcionario.findMany({
            orderBy: { id: "asc" }
        });

        return funcionarios.map((funcionario) => this.hydrate(funcionario));
    }

    async gerarProximoId(): Promise<string> {
        const funcionarios = await prisma.funcionario.findMany({
            select: { id: true }
        });

        const maiorId = funcionarios.reduce((maior, funcionario) => {
            const idNumerico = Number(funcionario.id);
            return Number.isInteger(idNumerico) && idNumerico > maior ? idNumerico : maior;
        }, 0);

        return String(maiorId + 1);
    }

    async buscarPorId(id: string): Promise<Funcionario | null> {
        const funcionario = await prisma.funcionario.findUnique({
            where: { id: id.trim() }
        });

        return funcionario ? this.hydrate(funcionario) : null;
    }

    async buscarPorUsuario(usuario: string): Promise<Funcionario | null> {
        const funcionario = await prisma.funcionario.findFirst({
            where: { usuario: usuario.trim() }
        });

        return funcionario ? this.hydrate(funcionario) : null;
    }

    async atualizar(id: string, funcionario: Funcionario): Promise<Funcionario | null> {
        try {
            const funcionarioAtualizado = await prisma.funcionario.update({
                where: { id: id.trim() },
                data: this.toPrismaData(funcionario)
            });

            return this.hydrate(funcionarioAtualizado);
        } catch (error) {
            if (this.isRegistroNaoEncontrado(error)) {
                return null;
            }

            throw error;
        }
    }

    async deletar(id: string): Promise<boolean> {
        try {
            await prisma.funcionario.delete({
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

    private hydrate(data: FuncionarioProps): Funcionario {
        return new Funcionario(data);
    }

    private toPrismaData(funcionario: Funcionario) {
        return {
            id: funcionario.id,
            nome: funcionario.nome,
            telefone: funcionario.telefone,
            endereco: funcionario.endereco,
            usuario: funcionario.usuario,
            senha: funcionario.senha,
            nivelPermissao: funcionario.nivelPermissao as unknown as PrismaNivelPermissao
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
