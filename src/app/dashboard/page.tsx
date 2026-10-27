import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark" aria-hidden="true">v.</span>
          <span>Veletric</span>
        </Link>
        <span className="nav-label">Menu principal</span>
        <nav className="side-nav" aria-label="Menu principal">
          <Link className="active" href="/dashboard">Visão geral</Link>
          <Link href="/produtos">Produtos</Link>
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
            <span className="eyebrow">Segunda-feira, 19 de outubro</span>
            <h1>Visão geral</h1>
            <p>Acompanhe o que está acontecendo no seu estoque.</p>
          </div>
          <Link className="primary-button" href="/produtos">Ver produtos</Link>
        </header>

        <section className="stats-grid" aria-label="Resumo do estoque">
          <article className="stat-card">
            <div className="stat-topline"><span>Produtos cadastrados</span><span className="stat-icon" aria-hidden="true">▦</span></div>
            <strong className="stat-value">128</strong>
          </article>
          <article className="stat-card">
            <div className="stat-topline"><span>Itens em estoque</span><span className="stat-icon" aria-hidden="true">↗</span></div>
            <strong className="stat-value">2.460</strong>
          </article>
          <article className="stat-card">
            <div className="stat-topline"><span>Estoque baixo</span><span className="stat-icon" aria-hidden="true">!</span></div>
            <strong className="stat-value">6</strong>
          </article>
        </section>

        <div className="dashboard-bottom">
          <section className="content-section">
            <div className="section-heading">
              <h2>Movimentações recentes</h2>
              <Link href="/produtos">Ver lista</Link>
            </div>
            <div className="activity-list">
              <div className="activity-row"><span>Entrada de produtos</span><span>Hoje, 10:42 · 24 itens</span></div>
              <div className="activity-row"><span>Saída para pedido #1048</span><span>Hoje, 09:18 · 8 itens</span></div>
              <div className="activity-row"><span>Estoque atualizado</span><span>Ontem, 16:05 · 12 itens</span></div>
            </div>
          </section>

          <section className="content-section inventory-callout">
            <div className="section-heading"><h2>Fique de olho</h2><span className="stat-icon" aria-hidden="true">!</span></div>
            <p>6 produtos estão com poucas unidades. Confira a lista para planejar a reposição.</p>
            <Link className="text-link" href="/produtos">Conferir produtos →</Link>
          </section>
        </div>
      </main>
    </div>
  );
}