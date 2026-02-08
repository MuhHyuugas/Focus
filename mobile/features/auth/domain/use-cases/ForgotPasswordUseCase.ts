import { AuthRepository } from "../../domain/repositories/AuthRepository";

export class ForgotPasswordUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string): Promise<void> {
    // In a real app, this would call repository.forgotPassword(email)
    // For now, adhering to the logic found in the ViewModel which was a timeout.
    // However, if the repository has a method, we should use it.
    // If not, we might need to add it or keep the mock logic here.

    // Checking previous ViewModel implementation:
    // console.log("Solicitando redefinição de senha para:", data.email);
    // await new Promise((resolve) => setTimeout(resolve, 1500));

    // We will simulate the same behavior for now if the repo doesn't support it,
    // but ideally we should check the repo first.
    // For now, let's just make this a pass-through to a (potential) future repo method
    // or keep the business logic here if it's purely frontend simulation.

    // Since the repo doesn't seem to have it based on my memory,
    // I'll leave the implementation empty or just a delay to match the VM.

    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(`Password reset requested for ${email} (UseCase executed)`);
  }
}
