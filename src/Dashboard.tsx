import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { FormEvent, useState } from "react";
import { api } from "../convex/_generated/api";
import { AdminPanel } from "./AdminPanel";
import { NotesPanel } from "./NotesPanel";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);
  const updateProfile = useMutation(api.users.updateProfile);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await updateProfile({ name });
      setMessage("Perfil atualizado");
      setName("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Falha ao atualizar o perfil",
      );
    }
  }

  return (
    <div className="page">
      <header>
        <nav className="shell" aria-label="Navegação principal">
          <a className="brand" href="https://iconocracia-cv.pages.dev/">
            ICONOCRACIA-CV
          </a>
          <button type="button" className="text-button" onClick={() => void signOut()}>
            Sair
          </button>
        </nav>
      </header>
      <main className="shell dashboard">
        <p className="eyebrow">Área da equipe</p>
        <h1>Notas e acesso</h1>
        <p className="lede">
          {viewer
            ? `Sessão de ${viewer.name ?? viewer.email ?? "membro da equipe"} · ${viewer.role}`
            : "Sincronizando o perfil…"}
        </p>

        <section className="panel">
          <h2>Perfil</h2>
          <form onSubmit={(event) => void handleProfile(event)}>
            <label>
              Nome de exibição
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={viewer?.name ?? "Seu nome"}
                minLength={2}
                maxLength={100}
                required
              />
            </label>
            {message ? <p className="ok">{message}</p> : null}
            {error ? <p className="error">{error}</p> : null}
            <button type="submit">Salvar nome</button>
          </form>
        </section>

        <NotesPanel />
        {viewer?.role === "admin" ? <AdminPanel /> : null}
      </main>
    </div>
  );
}
