import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthRepositoryImpl } from "../../data/AuthRepositoryImpl";
import { RegisterUseCase } from "../../domain/use-cases/RegisterUseCase";
import { useAuthContext } from "../contexts/AuthContext";

const authRepository = new AuthRepositoryImpl();

// schema de validação do login
const loginSchema = z.object({
  id: z.string().min(1, "O email ou telefone é obrigatório."),
  password: z.string(),
});

type LoginFormData = z.infer<typeof loginSchema>; // tipagem do schema de login

// schema de validação do cadastro
const signUpSchema = z
  .object({
    name: z.string().min(1, "O nome é obrigatório."),
    email: z.email("Email inválido.").min(1, "O email é obrigatório."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(1, "A confirmação de senha é obrigatória."),
    phone: z.string().optional(),
    birthDate: z
      .string()
      .min(1, "Data de nascimento é obrigatória.")
      .regex(
        /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
        "Data inválida (dd/mm/aaaa)",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>; // tipagem do schema de cadastro

// função principal que controla o estado e as ações do authViewModel
export function useAuthViewModel() {
  const router = useRouter(); // hook para navegação
  const { checkAuthState } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"entrar" | "cadastrar">("entrar"); // estado do tab ativo
  const [isLoading, setIsLoading] = useState(false); // estado de carregamento
  const [error, setError] = useState<string | null>(null); // estado de erro

  // hooks de formulário
  const {
    control: signUpControl,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: signUpErrors },
    reset: resetSignUpForm,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      birthDate: "",
    },
  });

  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const registerUseCase = new RegisterUseCase(authRepository); // instância do caso de uso de cadastro

  // função que lida com o login
  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authRepository.login(data.id, data.password);
      await checkAuthState();
      router.replace("/(tabs)/dashboard");
      resetLoginForm();
    } catch (err: any) {
      setError(err.message || "Erro ao entrar");
    } finally {
      setIsLoading(false);
    }
  };

  // função que lida com o cadastro
  const handleRegister = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Tentar Registrar
      await registerUseCase.execute({
        name: data.name ?? "",
        email: data.email ?? "",
        password: data.password ?? "",
        phone: data.phone ?? "",
        birthDate: data.birthDate ?? "",
      });

    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar");
      setIsLoading(false);
      return; // Para aqui se o cadastro falhar
    }

    // 2. Tentar Auto-Login (Se falhar, redireciona para login manual)
    try {
      await authRepository.login(data.email, data.password);
      await checkAuthState();
      router.replace("/(tabs)/dashboard");
      resetSignUpForm();
    } catch (err: any) {
      console.log("Auto-login failed after register:", err);
      // Sucesso no cadastro, mas falha no login automático
      setActiveTab("entrar");
      setError("Cadastro realizado com sucesso! Faça login para continuar.");
      resetSignUpForm();
    } finally {
      setIsLoading(false);
    }
  };

  // retorna os estados e funções do authViewModel
  return {
    activeTab,
    setActiveTab,
    isLoading,
    error,

    loginControl,
    handleLogin: handleLoginSubmit(handleLogin),
    loginErrors,

    signUpControl,
    handleRegister: handleSignUpSubmit(handleRegister),
    signUpErrors,
  };
}
