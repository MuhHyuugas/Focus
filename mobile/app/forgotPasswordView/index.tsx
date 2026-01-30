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
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
  useForgotPasswordViewModel,
} from "@/features/auth/presentation/viewmodels/useForgotPasswordViewModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "expo-router";
import { ArrowLeft, Mail } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_OPTIONS = {
  title: "Recuperar Senha",
  headerShown: true,
};

export default function ForgotPasswordView() {
  const { handleResetPassword, isLoading, isSuccess, goBack, error } =
    useForgotPasswordViewModel();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  if (isSuccess) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center p-4">
          <Card>
            <CardHeader>
              <CardTitle>E-mail enviado!</CardTitle>
              <CardDescription>
                Enviamos as instruções para recuperação de senha para o seu
                e-mail.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onPress={goBack}>
                <Text>Voltar para o login</Text>
              </Button>
            </CardFooter>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 16,
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recuperar Senha</CardTitle>
              <CardDescription>
                Digite seu e-mail cadastrado e enviaremos um link para você
                criar uma nova senha.
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-6">
              <View className="gap-3">
                <Label htmlFor="forgot-email">E-mail</Label>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                      <Input
                        leftIcon={Mail}
                        id="forgot-email"
                        placeholder="Seu e-mail"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        className={errors.email ? "border-destructive" : ""}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                      {errors.email && (
                        <Text className="mt-1 text-sm text-destructive">
                          {errors.email.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              {error && (
                <Text className="text-center text-destructive">{error}</Text>
              )}

              <TouchableOpacity
                onPress={goBack}
                className="flex-row items-center gap-2"
              >
                <ArrowLeft size={16} color="#168B8D" />
                <Text className="font-semibold text-[#168B8D]">
                  Voltar para o login
                </Text>
              </TouchableOpacity>
            </CardContent>
            <CardFooter>
              <Button
                onPress={handleSubmit(handleResetPassword)}
                disabled={isLoading}
              >
                <Text>{isLoading ? "Enviando..." : "Enviar link"}</Text>
              </Button>
            </CardFooter>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
