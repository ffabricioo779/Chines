import { criarHashSenha, lerUsuarios, salvarUsuarios, usuarioPublico, validarCpf, type UsuarioEntrada } from "../../../../lib/usuarios";

export const runtime = "nodejs";

export async function PUT(request: Request, context: RouteContext<"/api/usuarios/[id]">) {
  const { id } = await context.params;
  let body: Partial<UsuarioEntrada>;
  try {
    body = await request.json() as Partial<UsuarioEntrada>;
  } catch {
    return Response.json({ erro: "Corpo da requisição inválido." }, { status: 400 });
  }

  const obrigatorios = ["nome", "cpf", "email", "telefone", "dataNascimento", "cep", "endereco", "numero", "bairro", "cidade", "estado"] as const;
  if (!obrigatorios.every((campo) => typeof body[campo] === "string" && body[campo]!.trim().length > 0)
    || !validarCpf(body.cpf ?? "")
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email ?? "")
    || !/^\d{4}-\d{2}-\d{2}$/.test(body.dataNascimento ?? "")
    || (body.senha !== undefined && body.senha !== "" && body.senha.length < 8)) {
    return Response.json({ erro: "Confira os dados obrigatórios. A senha deve ter pelo menos 8 caracteres." }, { status: 400 });
  }

  const usuarios = await lerUsuarios();
  const indice = usuarios.findIndex((usuario) => usuario.id === id);
  if (indice < 0) return Response.json({ erro: "Usuário não encontrado." }, { status: 404 });
  if (usuarios.some((usuario) => usuario.id !== id && usuario.cpf.replace(/\D/g, "") === body.cpf!.replace(/\D/g, ""))) {
    return Response.json({ erro: "Já existe um usuário cadastrado com este CPF." }, { status: 409 });
  }

  const usuario = {
    ...usuarios[indice],
    ...body,
    senhaHash: body.senha ? criarHashSenha(body.senha) : usuarios[indice].senhaHash,
  };
  delete (usuario as Partial<UsuarioEntrada>).senha;
  usuarios[indice] = usuario;
  await salvarUsuarios(usuarios);
  return Response.json(usuarioPublico(usuario));
}

export async function DELETE(_request: Request, context: RouteContext<"/api/usuarios/[id]">) {
  const { id } = await context.params;
  const usuarios = await lerUsuarios();
  const restantes = usuarios.filter((usuario) => usuario.id !== id);
  if (restantes.length === usuarios.length) return Response.json({ erro: "Usuário não encontrado." }, { status: 404 });
  await salvarUsuarios(restantes);
  return new Response(null, { status: 204 });
}