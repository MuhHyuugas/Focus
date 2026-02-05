import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useAuthViewModel } from "@/features/auth/presentation/viewmodels/useAuthViewModel";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  ImageStyle,
  KeyboardAvoidingView,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginForm from "./components/loginForm";
import SignUpForm from "./components/signUpForm";

const LOGO = require("@/assets/images/whitelogo.png");

const IMAGE_STYLE: ImageStyle = {
  height: 30,
  width: 30,
};

export default function AuthView() {
  const viewModel = useAuthViewModel();
  return (
    <>
      <LinearGradient
        colors={["#052933", "#228889"]}
        start={{ x: 0.1, y: 0.2 }}
        end={{ x: 0.9, y: 0.8 }}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 gap-8">
            <View className="flex flex-col gap-4 p-8">
              <View className="flex-row items-center gap-3">
                <Image source={LOGO} style={IMAGE_STYLE} />
                <Text className="text-xl font-semibold text-white">Focus</Text>
              </View>
              <Text className="text-4xl font-bold text-white">
                Comece agora
              </Text>
              <Text className="text-lg font-semibold text-white">
                Crie uma conta ou entre para continuar
              </Text>
            </View>
            <KeyboardAvoidingView
              className="flex-1 w-full items-center rounded-t-[24px] bg-white overflow-hidden"
              behavior="padding"
            >
              <ScrollView
                className="w-full flex-1"
                contentContainerStyle={{
                  flexGrow: 1,
                  paddingBottom: 40,
                  paddingHorizontal: 16,
                }}
                showsVerticalScrollIndicator={false}
              >
                <View className="flex w-full flex-col gap-6 bg-white p-2">
                  <Tabs
                    value={viewModel.activeTab}
                    onValueChange={(v) => viewModel.setActiveTab(v as any)}
                  >
                    <TabsList>
                      <TabsTrigger value="entrar">
                        <Text>Entre</Text>
                      </TabsTrigger>
                      <TabsTrigger value="cadastrar">
                        <Text>Cadastre-se</Text>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="entrar">
                      <LoginForm />
                    </TabsContent>

                    <TabsContent value="cadastrar">
                      <SignUpForm />
                    </TabsContent>
                  </Tabs>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}
