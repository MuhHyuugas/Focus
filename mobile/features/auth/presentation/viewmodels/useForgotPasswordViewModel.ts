import { useRouter } from "expo-router";
import { useState } from "react";
import { z } from "zod";

// schema de validação do esqueci minha senha
export const forgotPasswordSchema = z.object({
  email: z.email("Insira um e-mail válido."),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>; // tipagem do schema de esqueci minha senha

// função principal que controla o estado e as ações do forgotPasswordViewModel
export function useForgotPasswordViewModel() {
  const router = useRouter(); // hook para navegação
  const [isLoading, setIsLoading] = useState(false); // estado de carregamento
  const [error, setError] = useState<string | null>(null); // estado de erro
  const [isSuccess, setIsSuccess] = useState(false); // estado de sucesso

  // função que lida com o esqueci minha senha
  const handleResetPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Solicitando redefinição de senha para:", data.email);
      // Aqui chamaria um Use Case: await forgotPasswordUseCase.execute(data.email);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao processar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  // leva de volta para a tela anterior
  const goBack = () => {
    router.back();
  };

  // retorna o estado de carregamento, o estado de erro, o estado de sucesso e a função de redefinição de senha
  return {
    handleResetPassword,
    isLoading,
    error,
    isSuccess,
    goBack,
  };
}
