import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function AdminPanel() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.users.listUsers,
    {},
    { initialNumItems: 20 },
  );
  const setUserRole = useMutation(api.users.setUserRole);

  return (
    <section className="panel">
      <h2>Membros</h2>
      <p>Somente administradoras e administradores veem esta lista.</p>
      <ul className="user-list">
        {results.map((user) => (
          <li key={user._id}>
            <div>
              <strong>{user.name ?? user.email ?? user._id}</strong>
              <span>{user.role}</span>
            </div>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                void setUserRole({
                  userId: user._id,
                  role: user.role === "admin" ? "user" : "admin",
                });
              }}
            >
              {user.role === "admin" ? "Tornar membro" : "Tornar admin"}
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
