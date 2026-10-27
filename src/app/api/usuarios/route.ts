import { randomUUID } from "node:crypto";
import { criarHashSenha, lerUsuarios, salvarUsuarios, usuarioPublico, validarCpf, type UsuarioEntrada } from "../../../lib/usuarios";

export const runtime = "nodejs";

function entradaValida(body: Partial<UsuarioEntrada>) {
  const obrigatorios = ["nome", "cpf", "email", "telefone", "dataNascimento", "cep", "endereco", "numero", "bairro", "cidade", "estado"] as const;
  return obrigatorios.every((campo) => typeof body[campo] === "string" && body[campo]!.trim().length > 0)
    && validarCpf(body.cpf ?? "")
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email ?? "")
    && /^\d{4}-\d{2}-\d{2}$/.test(body.dataNascimento ?? "");
}

export async function GET() {
  const usuarios = await lerUsuarios();
  return Response.json(usuarios.map(usuarioPublico));
}

export async function POST(request: Request) {
  let body: Partial<UsuarioEntrada>;
  try {
    body = await request.json() as Partial<UsuarioEntrada>;
  } catch {
    return Response.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  if (!entradaValida(body) || typeof body.senha !== "string" || body.senha.length < 8) {
    return Response.json({ erro: "Confira os dados obrigatórios e use uma senha com pelo menos 8 caracteres." }, { status: 400 });
  }

  const usuarios = await lerUsuarios();
  if (usuarios.some((usuario) => usuario.cpf.replace(/\D/g, "") === body.cpf!.replace(/\D/g, ""))) {
    return Response.json({ erro: "Já existe um usuário cadastrado com este CPF." }, { status: 409 });
  }

  const usuario: UsuarioEntrada & { id: string; senhaHash: string; criadoEm: string } = {
    ...body as UsuarioEntrada,
    id: randomUUID(),
    senhaHash: criarHashSenha(body.senha),
    criadoEm: new Date().toISOString(),
  };
  delete (usuario as Partial<UsuarioEntrada>).senha;
  usuarios.push(usuario);
  await salvarUsuarios(usuarios);

  return Response.json(usuarioPublico(usuario), { status: 201 });
}