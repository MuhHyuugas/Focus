import { useAuthContext } from "../contexts/AuthContext";

export function useAuthStateViewModel() {
  const { user, isAuthenticated, isLoading, checkAuthState } = useAuthContext();

  return {
    user,
    isAuthenticated,
    isLoading,
    checkAuthState,
  };
}
