import { useState } from "react";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useAuthContext } from "../contexts/AuthContext";
import { AuthRepositoryImpl } from "../../data/AuthRepositoryImpl";
import { LoginUseCase } from "../../domain/use-cases/LoginUseCase";
import { RegisterUseCase } from "../../domain/use-cases/RegisterUseCase";
import { SyncCatalog } from "@/features/meds/domain/usecases/SyncCatalog";
import { SyncDailyMarks } from "@/features/report/domain/usecases/SyncDailyMarks";
import { MedicationRepositoryImpl } from "@/features/meds/data/MedicationRepositoryImpl";
import { ReportRepositoryImpl } from "@/features/report/data/repositories/ReportRepositoryImpl";

const authRepository = new AuthRepositoryImpl();
const medRepository = new MedicationRepositoryImpl();
const reportRepository = new ReportRepositoryImpl();

// Login Validation Schema
const loginSchema = z.object({
  id: z.string().min(1, "O email ou telefone é obrigatório."),
  password: z.string(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Sign Up Validation Schema
const signUpSchema = z
  .object({
    name: z.string().min(1, "O nome é obrigatório."),
    email: z.string().email("Email inválido.").min(1, "O email é obrigatório."),
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

type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * ViewModel responsável pela lógica de autenticação e registro.
 * Gerencia formulários, validações e fluxos de login/cadastro.
 */
export const useAuthViewModel = () => {
  const router = useRouter();
  const { checkAuthState } = useAuthContext();

  const [activeTab, setActiveTab] = useState<"entrar" | "cadastrar">("entrar");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const loginUseCase = new LoginUseCase(authRepository);
  const registerUseCase = new RegisterUseCase(authRepository);
  const syncCatalogUseCase = new SyncCatalog(medRepository);
  const syncDailyMarksUseCase = new SyncDailyMarks(reportRepository);

  const performFullSync = async () => {
    try {
      console.log("Performing full sync after login...");
      await Promise.allSettled([
        syncCatalogUseCase.execute(),
        syncDailyMarksUseCase.execute(),
      ]);
    } catch (e) {
      console.error("Full sync failed:", e);
    }
  };

  /**
   * Processa a solicitação de login.
   */
  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await loginUseCase.execute(data.id, data.password);
      await checkAuthState();

      // Trigger sync in background
      performFullSync();

      router.replace("/(tabs)/dashboard");
      resetLoginForm();
    } catch (err: any) {
      setError(err.message || "Erro ao entrar");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Processa o registro de um novo usuário e realiza auto-login.
   */
  const handleRegister = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
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
      return;
    }

    // Auto-Login after successful registration
    try {
      await loginUseCase.execute(data.email, data.password);
      await checkAuthState();

      // Trigger sync in background
      performFullSync();

      router.replace("/(tabs)/dashboard");
      resetSignUpForm();
    } catch (err: any) {
      console.log("Auto-login failed after register:", err);
      setActiveTab("entrar");
      setError("Cadastro realizado com sucesso! Faça login para continuar.");
      resetSignUpForm();
    } finally {
      setIsLoading(false);
    }
  };

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
};
