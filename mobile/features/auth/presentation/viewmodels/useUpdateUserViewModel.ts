import { useState } from "react";
import { AuthRepositoryImpl } from "../../data/AuthRepositoryImpl";
import { User } from "../../domain/entities/User";
import { UpdateUserUseCase } from "../../domain/use-cases/UpdateUserUseCase";

const authRepository = new AuthRepositoryImpl();
const updateUserUseCase = new UpdateUserUseCase(authRepository);

export function useUpdateUserViewModel() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (updatedUser: User) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateUserUseCase.execute(updatedUser);
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user profile.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUser,
    isLoading,
    error,
  };
}
