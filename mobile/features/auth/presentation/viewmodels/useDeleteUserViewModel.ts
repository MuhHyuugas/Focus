import { DeleteUserUseCase } from "../../domain/use-cases/DeleteUserUseCase";
import { AuthRepositoryImpl } from "@/features/auth/data/AuthRepositoryImpl";
import { useAuthStateViewModel } from "@/features/auth/presentation/viewmodels/useAuthStateViewModel";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

const repository = new AuthRepositoryImpl();
const deleteUserUseCase = new DeleteUserUseCase(repository);

export const useDeleteUserViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, checkAuthState } = useAuthStateViewModel();
  const router = useRouter();

  const deleteUser = async () => {
    if (!user) return;

    Alert.alert(
      "Excluir Conta",
      "Tem certeza que deseja excluir sua conta? Esta ação é irreversível.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteUserUseCase.execute(user.id);
              await checkAuthState();
              router.replace("/authView");
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Erro", "Não foi possível excluir a conta.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  return { deleteUser, isLoading };
};
