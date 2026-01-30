import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useAuthViewModel } from "@/features/auth/presentation/viewmodels/useAuthViewModel";
import {
  Calendar,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  User,
} from "lucide-react-native";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";

export default function SignUpForm() {
  const viewModel = useAuthViewModel();
  const { signUpControl, handleRegister, signUpErrors } = viewModel;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro</CardTitle>
        <CardDescription>
          Preencha os campos para completar a criação de sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6">
        <View className="gap-3">
          <Label htmlFor="cadastro-nome">Nome</Label>
          <Controller
            control={signUpControl}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  id="cadastro-nome"
                  leftIcon={User}
                  placeholder="Nome"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={signUpErrors.name ? "border-destructive" : ""}
                />
                {signUpErrors.name && (
                  <Text className="mt-1 text-sm text-destructive">
                    {signUpErrors.name.message as string}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
        <View className="gap-3">
          <Label htmlFor="cadastro-email">Email</Label>
          <Controller
            control={signUpControl}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  id="cadastro-email"
                  leftIcon={Mail}
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={signUpErrors.email ? "border-destructive" : ""}
                />
                {signUpErrors.email && (
                  <Text className="mt-1 text-sm text-destructive">
                    {signUpErrors.email.message as string}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
        <View className="gap-3">
          <Label htmlFor="cadastro-senha">Senha</Label>
          <Controller
            control={signUpControl}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View className="justify-center">
                  <Input
                    onChangeText={onChange}
                    value={value}
                    onBlur={onBlur}
                    className={
                      signUpErrors.password ? "border-destructive" : ""
                    }
                    id="cadastro-senha"
                    leftIcon={LockKeyhole}
                    placeholder="Senha"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 p-1"
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="gray" />
                    ) : (
                      <Eye size={20} color="gray" />
                    )}
                  </TouchableOpacity>
                </View>
                {signUpErrors.password && (
                  <Text className="mt-1 text-sm text-destructive">
                    {signUpErrors.password.message as string}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
        <View className="gap-3">
          <Label htmlFor="cadastro-confirma-senha">
            Digite sua senha novamente
          </Label>
          <Controller
            control={signUpControl}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View className="justify-center">
                  <Input
                    onChangeText={onChange}
                    value={value}
                    onBlur={onBlur}
                    className={
                      signUpErrors.confirmPassword ? "border-destructive" : ""
                    }
                    id="cadastro-confirma-senha"
                    leftIcon={LockKeyhole}
                    placeholder="Repita sua senha"
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="gray" />
                    ) : (
                      <Eye size={20} color="gray" />
                    )}
                  </TouchableOpacity>
                </View>
                {signUpErrors.confirmPassword && (
                  <Text className="mt-1 text-sm text-destructive">
                    {signUpErrors.confirmPassword.message as string}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
        <View className="gap-3">
          <Label htmlFor="cadastro-telefone">Telefone</Label>
          <Controller
            control={signUpControl}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  onChangeText={onChange}
                  value={value}
                  onBlur={onBlur}
                  className={signUpErrors.phone ? "border-destructive" : ""}
                  id="cadastro-telefone"
                  leftIcon={Phone}
                  placeholder="Telefone"
                />
                {signUpErrors.phone && (
                  <Text className="mt-1 text-sm text-destructive">
                    {signUpErrors.phone.message as string}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
        <View className="gap-3">
          <Label htmlFor="cadastro-data-nascimento">Data de nascimento</Label>
          <Controller
            control={signUpControl}
            name="birthDate"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  onChangeText={(text) => {
                    // Máscara dd/mm/aaaa
                    const cleaned = text.replace(/\D/g, "");
                    let formatted = cleaned;
                    if (cleaned.length > 2) {
                      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
                    }
                    if (cleaned.length > 4) {
                      formatted = `${formatted.slice(0, 5)}/${cleaned.slice(
                        4,
                        8,
                      )}`;
                    }
                    onChange(formatted);
                  }}
                  value={value}
                  onBlur={onBlur}
                  className={signUpErrors.birthDate ? "border-destructive" : ""}
                  id="cadastro-data-nascimento"
                  leftIcon={Calendar}
                  placeholder="Data de nascimento (dd/mm/aaaa)"
                  keyboardType="numeric"
                  maxLength={10}
                />
                {signUpErrors.birthDate && (
                  <Text className="mt-1 text-sm text-destructive">
                    {signUpErrors.birthDate.message as string}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      </CardContent>
      <CardFooter>
        <Button onPress={handleRegister}>
          <Text>Cadastrar</Text>
        </Button>
      </CardFooter>
    </Card>
  );
}
