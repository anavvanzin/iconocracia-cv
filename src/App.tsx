import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
} from "convex/react";
import { useEffect } from "react";
import { api } from "../convex/_generated/api";
import { AuthForm } from "./AuthForm";
import { Dashboard } from "./Dashboard";

function StoreUser() {
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    void storeUser();
  }, [storeUser]);

  return <Dashboard />;
}

export function App() {
  return (
    <>
      <AuthLoading>
        <p className="status">Carregando sessão…</p>
      </AuthLoading>
      <Unauthenticated>
        <AuthForm />
      </Unauthenticated>
      <Authenticated>
        <StoreUser />
      </Authenticated>
    </>
  );
}
