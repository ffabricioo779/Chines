
import Link from "next/link";

const produtos = [
  { nome: "Caderno pontilhado", categoria: "Papelaria", codigo: "PAP-001", quantidade: 42, preco: "R$ 28,90", baixo: false },
  { nome: "Caneta esferográfica", categoria: "Escrita", codigo: "ESC-014", quantidade: 8, preco: "R$ 6,50", baixo: true },
  { nome: "Organizador de mesa", categoria: "Acessórios", codigo: "ACE-032", quantidade: 19, preco: "R$ 45,00", baixo: false },
  { nome: "Bloco de notas A5", categoria: "Papelaria", codigo: "PAP-009", quantidade: 5, preco: "R$ 12,90", baixo: true },
  { nome: "Estojo de tecido", categoria: "Acessórios", codigo: "ACE-018", quantidade: 26, preco: "R$ 32,00", baixo: false },
];

export default function ProdutosPage() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark" aria-hidden="true">v.</span>
          <span>Veletric</span>
        </Link>
        <span className="nav-label">Menu principal</span>
        <nav className="side-nav" aria-label="Menu principal">
          <Link href="/dashboard">Visão geral</Link>
          <Link className="active" href="/produtos">Produtos</Link>
          <Link href="/usuarios">Usuários</Link>
        </nav>
        <Link className="logout-link" href="/login">Sair da conta</Link>
      </aside>

      <main className="main-area">
        <div className="topbar">
          <span>Minha conta</span>
          <span className="avatar" aria-label="Usuário Ana Martins">AM</span>
        </div>
        <header className="page-heading">
          <div>
            <span className="eyebrow">Estoque</span>
            <h1>Produtos</h1>
            <p>Consulte os itens cadastrados e acompanhe suas quantidades.</p>
          </div>
        </header>

        <section className="stats-grid" aria-label="Resumo de produtos">
          <article className="stat-card">
            <div className="stat-topline"><span>Total de produtos</span><span className="stat-icon" aria-hidden="true">▦</span></div>
            <strong className="stat-value">128</strong>
          </article>
          <article className="stat-card">
            <div className="stat-topline"><span>Em estoque</span><span className="stat-icon" aria-hidden="true">✓</span></div>
            <strong className="stat-value">122</strong>
          </article>
          <article className="stat-card">
            <div className="stat-topline"><span>Precisam de reposição</span><span className="stat-icon" aria-hidden="true">!</span></div>
            <strong className="stat-value">6</strong>
          </article>
        </section>

        <section className="content-section products-section">
          <div className="section-heading">
            <h2>Todos os produtos</h2>
            <span className="field-label">5 itens de exemplo</span>
          </div>
          <div className="table-wrap">
            <table className="product-table">
              <thead>
                <tr><th>Produto</th><th>Código</th><th>Quantidade</th><th>Preço</th><th>Status</th></tr>
              </thead>
              <tbody>
                {produtos.map((produto) => (
                  <tr key={produto.codigo}>
                    <td><span className="product-name">{produto.nome}</span><span className="product-category">{produto.categoria}</span></td>
                    <td>{produto.codigo}</td>
                    <td>{produto.quantidade} un.</td>
                    <td>{produto.preco}</td>
                    <td><span className={`status${produto.baixo ? " low" : ""}`}>{produto.baixo ? "Estoque baixo" : "Disponível"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
