"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type Usuario = {
  id: string;
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
  criadoEm: string;
};

type DadosFormulario = Omit<Usuario, "id" | "criadoEm"> & { senha: string };

const formularioVazio: DadosFormulario = {
  nome: "", cpf: "", email: "", telefone: "", dataNascimento: "", cep: "",
  endereco: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", senha: "",
};

const camposPessoais = [
  { nome: "nome", rotulo: "Nome completo", tipo: "text", placeholder: "Ex.: Ana Martins", classe: "field-wide" },
  { nome: "cpf", rotulo: "CPF", tipo: "text", placeholder: "000.000.000-00" },
  { nome: "email", rotulo: "E-mail", tipo: "email", placeholder: "ana@email.com" },
  { nome: "telefone", rotulo: "Telefone", tipo: "tel", placeholder: "(00) 00000-0000" },
  { nome: "dataNascimento", rotulo: "Data de nascimento", tipo: "text", placeholder: "DD/MM/AAAA" },
] as const;

const camposEndereco = [
  { nome: "cep", rotulo: "CEP", placeholder: "00000-000" },
  { nome: "endereco", rotulo: "Rua / Avenida", placeholder: "Nome do logradouro", classe: "field-wide" },
  { nome: "numero", rotulo: "Número", placeholder: "Nº" },
  { nome: "complemento", rotulo: "Complemento", placeholder: "Apto, bloco...", opcional: true },
  { nome: "bairro", rotulo: "Bairro", placeholder: "Bairro" },
  { nome: "cidade", rotulo: "Cidade", placeholder: "Cidade" },
  { nome: "estado", rotulo: "UF", placeholder: "SP" },
] as const;

function mascarar(valor: string, campo: keyof DadosFormulario) {
  const numeros = valor.replace(/\D/g, "");
  if (campo === "cpf") return numeros.slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  if (campo === "telefone") {
    const telefone = numeros.slice(0, 11);
    if (telefone.length <= 2) return telefone ? `(${telefone}` : "";
    const digitosDoNumero = telefone.length > 10 ? 5 : 4;
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 2 + digitosDoNumero)}${telefone.length > 2 + digitosDoNumero ? `-${telefone.slice(2 + digitosDoNumero)}` : ""}`;
  }
  if (campo === "cep") return numeros.slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
  if (campo === "dataNascimento") return numeros.slice(0, 8).replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2");
  if (campo === "estado") return valor.slice(0, 2).toUpperCase();
  return valor;
}

function cpfValido(cpf: string) {
  const numeros = cpf.replace(/\D/g, "");
  if (numeros.length !== 11 || /^([0-9])\1+$/.test(numeros)) return false;
  const digito = (base: string, peso: number) => {
    const resto = [...base].reduce((soma, numero, indice) => soma + Number(numero) * (peso - indice), 0) * 10 % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(numeros.slice(0, 9), 10) === Number(numeros[9]) && digito(numeros.slice(0, 10), 11) === Number(numeros[10]);
}

function converterData(data: string) {
  const [dia, mes, ano] = data.split("/").map(Number);
  const nascimento = new Date(ano, mes - 1, dia);
  if (nascimento.getFullYear() !== ano || nascimento.getMonth() !== mes - 1 || nascimento.getDate() !== dia || nascimento > new Date()) return "";
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function dataExibida(data: string) {
  const [ano, mes, dia] = data.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
}

function erroDaResposta(resposta: Response, dados: { erro?: string }) {
  return dados.erro || `Não foi possível concluir a operação (${resposta.status}).`;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [dados, setDados] = useState<DadosFormulario>(formularioVazio);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregarUsuarios() {
    try {
      const resposta = await fetch("/api/usuarios", { cache: "no-store" });
      if (!resposta.ok) throw new Error("Não foi possível carregar os usuários.");
      setUsuarios(await resposta.json() as Usuario[]);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/usuarios", { cache: "no-store", signal: controller.signal })
      .then((resposta) => {
        if (!resposta.ok) throw new Error("Não foi possível carregar os usuários.");
        return resposta.json() as Promise<Usuario[]>;
      })
      .then(setUsuarios)
      .catch((falha: unknown) => {
        if (!controller.signal.aborted) setErro(falha instanceof Error ? falha.message : "Erro ao carregar os usuários.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregando(false);
      });
    return () => controller.abort();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return usuarios.filter((usuario) => `${usuario.nome} ${usuario.email} ${usuario.cpf}`.toLocaleLowerCase("pt-BR").includes(termo));
  }, [busca, usuarios]);

  function abrirCadastro(usuario?: Usuario) {
    setEditando(usuario ?? null);
    setErro("");
    setDados(usuario ? {
      nome: usuario.nome, cpf: usuario.cpf, email: usuario.email, telefone: usuario.telefone,
      dataNascimento: dataExibida(usuario.dataNascimento), cep: usuario.cep, endereco: usuario.endereco,
      numero: usuario.numero, complemento: usuario.complemento, bairro: usuario.bairro,
      cidade: usuario.cidade, estado: usuario.estado, senha: "",
    } : formularioVazio);
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;
    setModalAberto(false);
    setEditando(null);
  }

  function atualizarCampo(campo: keyof DadosFormulario, valor: string) {
    setDados((atuais) => ({ ...atuais, [campo]: mascarar(valor, campo) }));
  }

  async function salvarUsuario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    if (!cpfValido(dados.cpf)) {
      setErro("Informe um CPF válido.");
      return;
    }
    if (dados.telefone.replace(/\D/g, "").length < 10 || dados.cep.replace(/\D/g, "").length !== 8) {
      setErro("Confira o telefone e o CEP informados.");
      return;
    }
    const nascimento = converterData(dados.dataNascimento);
    if (!nascimento) {
      setErro("Informe uma data de nascimento válida, que não seja futura.");
      return;
    }
    if (!editando && dados.senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setSalvando(true);
    try {
      const resposta = await fetch(editando ? `/api/usuarios/${editando.id}` : "/api/usuarios", {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...dados, dataNascimento: nascimento, senha: dados.senha || undefined }),
      });
      if (!resposta.ok) {
        const retorno = await resposta.json() as { erro?: string };
        throw new Error(erroDaResposta(resposta, retorno));
      }
      await carregarUsuarios();
      setModalAberto(false);
      setEditando(null);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível salvar o usuário.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirUsuario(usuario: Usuario) {
    if (!window.confirm(`Excluir o cadastro de ${usuario.nome}? Esta ação não pode ser desfeita.`)) return;
    try {
      const resposta = await fetch(`/api/usuarios/${usuario.id}`, { method: "DELETE" });
      if (!resposta.ok) {
        const retorno = await resposta.json() as { erro?: string };
        throw new Error(erroDaResposta(resposta, retorno));
      }
      setUsuarios((atuais) => atuais.filter((item) => item.id !== usuario.id));
      setErro("");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível excluir o usuário.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard"><span className="brand-mark" aria-hidden="true">v.</span><span>Veletric</span></Link>
        <span className="nav-label">Menu principal</span>
        <nav className="side-nav" aria-label="Menu principal">
          <Link href="/dashboard">Visão geral</Link>
          <Link href="/produtos">Produtos</Link>
          <Link className="active" href="/usuarios">Usuários</Link>
        </nav>
        <Link className="logout-link" href="/login">Sair da conta</Link>
      </aside>

      <main className="main-area">
        <div className="topbar"><span>Minha conta</span><span className="avatar" aria-label="Usuário Ana Martins">AM</span></div>
        <header className="page-heading">
          <div><span className="eyebrow">Acessos e cadastros</span><h1>Usuários</h1><p>Gerencie os dados pessoais e de contato cadastrados.</p></div>
          <button className="primary-button" type="button" onClick={() => abrirCadastro()}>+ Novo usuário</button>
        </header>

        <section className="content-section users-section" aria-label="Lista de usuários">
          <div className="users-toolbar">
            <div><h2>Todos os usuários</h2><span className="users-count">{usuarios.length} {usuarios.length === 1 ? "cadastro" : "cadastros"}</span></div>
            <label className="search-field"><span className="sr-only">Buscar usuário</span><span aria-hidden="true">⌕</span><input value={busca} onChange={(evento) => setBusca(evento.target.value)} placeholder="Buscar por nome, e-mail ou CPF" /></label>
          </div>

          {erro && !modalAberto && <p className="form-error page-error" role="alert">{erro}</p>}
          <div className="table-wrap">
            <table className="product-table user-table">
              <thead><tr><th>Usuário</th><th>CPF</th><th>Telefone</th><th>Nascimento</th><th><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>
                {carregando ? <tr><td className="table-message" colSpan={5}>Carregando usuários...</td></tr>
                  : usuariosFiltrados.length === 0 ? <tr><td className="table-message" colSpan={5}>{usuarios.length ? "Nenhum usuário corresponde à busca." : "Nenhum usuário cadastrado. Comece adicionando o primeiro."}</td></tr>
                    : usuariosFiltrados.map((usuario) => (
                      <tr key={usuario.id}>
                        <td><span className="product-name">{usuario.nome}</span><span className="product-category">{usuario.email}</span></td>
                        <td>{usuario.cpf}</td><td>{usuario.telefone}</td><td>{dataExibida(usuario.dataNascimento)}</td>
                        <td><div className="row-actions"><button type="button" onClick={() => abrirCadastro(usuario)}>Editar</button><button className="delete-action" type="button" onClick={() => void excluirUsuario(usuario)}>Excluir</button></div></td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {modalAberto && (
        <div className="modal-backdrop" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) fecharModal(); }}>
          <section className="user-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <div className="modal-heading"><div><span className="eyebrow">Dados do cadastro</span><h2 id="user-modal-title">{editando ? "Editar usuário" : "Novo usuário"}</h2></div><button className="modal-close" type="button" aria-label="Fechar formulário" onClick={fecharModal} disabled={salvando}>×</button></div>
            <form onSubmit={salvarUsuario}>
              <fieldset className="form-group"><legend>Dados pessoais</legend><div className="form-grid">
                {camposPessoais.map((campo) => <label className={`form-field ${"classe" in campo ? campo.classe : ""}`} key={campo.nome}><span className="field-label">{campo.rotulo}</span><input type={campo.tipo} name={campo.nome} placeholder={campo.placeholder} autoComplete={campo.nome === "nome" ? "name" : campo.nome === "email" ? "email" : "off"} value={dados[campo.nome]} onChange={(evento) => atualizarCampo(campo.nome, evento.target.value)} required /></label>)}
              </div></fieldset>
              <fieldset className="form-group"><legend>Endereço</legend><div className="form-grid">
                {camposEndereco.map((campo) => <label className={`form-field ${"classe" in campo ? campo.classe : ""}`} key={campo.nome}><span className="field-label">{campo.rotulo}{"opcional" in campo && campo.opcional ? " (opcional)" : ""}</span><input type="text" name={campo.nome} placeholder={campo.placeholder} autoComplete="off" value={dados[campo.nome]} onChange={(evento) => atualizarCampo(campo.nome, evento.target.value)} required={!("opcional" in campo && campo.opcional)} /></label>)}
              </div></fieldset>
              <fieldset className="form-group password-group"><legend>Senha</legend><label className="form-field"><span className="field-label">{editando ? "Nova senha (opcional)" : "Senha"}</span><input type="password" name="senha" placeholder={editando ? "Deixe em branco para manter a atual" : "Mínimo de 8 caracteres"} autoComplete="new-password" minLength={8} required={!editando} value={dados.senha} onChange={(evento) => atualizarCampo("senha", evento.target.value)} /></label></fieldset>
              {erro && <p className="form-error" role="alert">{erro}</p>}
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={fecharModal} disabled={salvando}>Cancelar</button><button className="primary-button" type="submit" disabled={salvando}>{salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar usuário"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}