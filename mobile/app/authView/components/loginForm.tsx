import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useAuthViewModel } from "@/features/auth/presentation/viewmodels/useAuthViewModel";
import { Link } from "expo-router";
import { Eye, EyeOff, LockKeyhole, User } from "lucide-react-native";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";

export default function LoginForm() {
  const viewModel = useAuthViewModel();
  const [showPassword, setShowPassword] = useState(false);
  const { loginControl, handleLogin, loginErrors } = viewModel;

  return (
    <Card>
      <CardContent className="gap-6">
        <View className="gap-3">
          <Label htmlFor="tabs-login-id">Email ou telefone</Label>
          <Controller
            control={loginControl}
            name="id"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon={User}
                  id="tabs-login-id"
                  placeholder="Email ou telefone"
                  value={value}
                  className={loginErrors.id ? "border-destructive" : ""}
                />
                {loginErrors.id && (
                  <Text className="mt-1 text-sm text-destructive">
                    {loginErrors.id.message as string}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
        <View className="gap-3">
          <Label htmlFor="tabs-login-password">Senha</Label>
          <Controller
            control={loginControl}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View className="justify-center">
                  <Input
                    onChangeText={onChange}
                    onBlur={onBlur}
                    leftIcon={LockKeyhole}
                    id="tabs-login-password"
                    placeholder="Senha"
                    secureTextEntry={!showPassword}
                    value={value}
                    className={loginErrors.password ? "border-destructive" : ""}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 p-1"
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-muted-foreground" />
                    ) : (
                      <Eye size={20} className="text-muted-foreground" />
                    )}
                  </TouchableOpacity>
                </View>
                {loginErrors.password && (
                  <Text className="mt-1 text-sm text-destructive">
                    {loginErrors.password.message as string}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
        <View className="items-end">
          <Link href="/forgotPasswordView">
            <Text className="font-semibold text-[#168B8D]">
              Esqueceu a senha?
            </Text>
          </Link>
        </View>
      </CardContent>
      <CardFooter>
        <Button onPress={handleLogin} disabled={viewModel.isLoading}>
          <Text>{viewModel.isLoading ? "Entrando..." : "Entrar"}</Text>
        </Button>
      </CardFooter>
      {viewModel.error && (
        <Text className="mb-4 text-center text-destructive">
          {viewModel.error}
        </Text>
      )}
    </Card>
  );
}
