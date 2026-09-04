import { useMutation, usePaginatedQuery } from "convex/react";
import { FormEvent, useState } from "react";
import { api } from "../convex/_generated/api";

export function NotesPanel() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.notes.listMine,
    {},
    { initialNumItems: 20 },
  );
  const createNote = useMutation(api.notes.create);
  const removeNote = useMutation(api.notes.remove);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await createNote({ title, body });
      setTitle("");
      setBody("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Falha ao criar a nota",
      );
    }
  }

  return (
    <section className="panel">
      <h2>Notas de experimento</h2>
      <p>
        Cada pessoa só lê e edita as próprias notas. Use isto para registrar
        decisões de pipeline sem alterar o freeze público.
      </p>
      <form onSubmit={(event) => void handleCreate(event)}>
        <label>
          Título
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
          />
        </label>
        <label>
          Texto
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={8000}
            rows={4}
            required
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit">Guardar nota</button>
      </form>
      <ul className="note-list">
        {results.map((note) => (
          <li key={note._id}>
            <div>
              <strong>{note.title}</strong>
              <p>{note.body}</p>
            </div>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                void removeNote({ noteId: note._id }).catch((caught: unknown) => {
                  setError(
                    caught instanceof Error
                      ? caught.message
                      : "Falha ao apagar a nota",
                  );
                });
              }}
            >
              Apagar
            </button>
          </li>
        ))}
      </ul>
      {status === "CanLoadMore" ? (
        <button type="button" className="secondary" onClick={() => loadMore(20)}>
          Carregar mais
        </button>
      ) : null}
    </section>
  );
}
