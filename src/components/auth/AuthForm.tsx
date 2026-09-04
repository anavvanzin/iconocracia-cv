import { useAuthActions } from "@convex-dev/auth/react";
import { FormEvent, useState } from "react";

type AuthStep = "signIn" | "signUp";

export function AuthForm() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<AuthStep>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    try {
      await signIn("password", formData);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Falha ao autenticar",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page">
      <header>
        <nav className="shell" aria-label="Navegação principal">
          <a className="brand" href="https://iconocracia-cv.pages.dev/">
            ICONOCRACIA-CV
          </a>
          <a href="https://iconocracia-cv.pages.dev/">Página pública</a>
        </nav>
      </header>
      <main className="shell auth-main">
        <p className="eyebrow">Área da equipe</p>
        <h1>{step === "signIn" ? "Entrar" : "Criar conta"}</h1>
        <p className="lede">
          Autenticação da equipe do semestre. O corpus público continua
          acessível sem login.
        </p>
        <form className="panel" onSubmit={(event) => void handleSubmit(event)}>
          {step === "signUp" ? (
            <label>
              Nome
              <input name="name" type="text" autoComplete="name" />
            </label>
          ) : null}
          <label>
            E-mail
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              autoComplete={
                step === "signIn" ? "current-password" : "new-password"
              }
              required
              minLength={8}
            />
          </label>
          <input name="flow" type="hidden" value={step} />
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" disabled={pending}>
            {pending
              ? "Aguarde…"
              : step === "signIn"
                ? "Entrar"
                : "Criar conta"}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setError(null);
              setStep(step === "signIn" ? "signUp" : "signIn");
            }}
          >
            {step === "signIn" ? "Criar conta" : "Já tenho conta"}
          </button>
        </form>
      </main>
    </div>
  );
}
