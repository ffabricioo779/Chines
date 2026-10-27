import { randomBytes, scryptSync } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type UsuarioEntrada = {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  senha?: string;
};

export type Usuario = Omit<UsuarioEntrada, "senha"> & {
  id: string;
  senhaHash: string;
  criadoEm: string;
};

const arquivoUsuarios = path.join(process.cwd(), "data", "usuarios.json");

export async function lerUsuarios(): Promise<Usuario[]> {
  try {
    return JSON.parse(await readFile(arquivoUsuarios, "utf8")) as Usuario[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function salvarUsuarios(usuarios: Usuario[]) {
  await mkdir(path.dirname(arquivoUsuarios), { recursive: true });
  await writeFile(arquivoUsuarios, JSON.stringify(usuarios, null, 2), "utf8");
}

export function validarCpf(cpf: string) {
  const numeros = cpf.replace(/\D/g, "");
  if (numeros.length !== 11 || /^([0-9])\1+$/.test(numeros)) return false;

  const calcularDigito = (base: string, pesoInicial: number) => {
    const soma = [...base].reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(numeros.slice(0, 9), 10) === Number(numeros[9])
    && calcularDigito(numeros.slice(0, 10), 11) === Number(numeros[10]);
}

export function criarHashSenha(senha: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(senha, salt, 64).toString("hex")}`;
}

export function usuarioPublico(usuario: Usuario): Omit<Usuario, "senhaHash"> {
  return Object.fromEntries(Object.entries(usuario).filter(([chave]) => chave !== "senhaHash")) as Omit<Usuario, "senhaHash">;
}