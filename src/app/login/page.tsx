"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/dashboard");
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <a className="brand" href="/login" aria-label="Veletric, início">
          <span className="brand-mark" aria-hidden="true">v.</span>
          <span>Veletric</span>
        </a>
        <div className="story-copy">
          <span className="story-kicker">Gestão sem complicação</span>
          <h1>Seu estoque, em equilíbrio.</h1>
          <p>Acompanhe produtos, níveis de estoque e movimentações em um só lugar.</p>
        </div>
        <span className="story-footer">Veletric · Painel de gestão</span>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Boas-vindas</h2>
          <p className="form-intro">Entre para acessar seu painel.</p>
          <label className="form-field">
            <span className="field-label">E-mail</span>
            <input
              type="email"
              name="email"
              placeholder="voce@empresa.com.br"
              autoComplete="email"
              required
            />
          </label>
          <label className="form-field">
            <span className="field-label">Senha</span>
            <input
              type="password"
              name="password"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="primary-button" type="submit">Entrar no painel</button>
        </form>
      </section>
    </main>
  );
}