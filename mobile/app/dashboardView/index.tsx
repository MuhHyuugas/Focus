import { images } from "@/assets/assets";
import { Text } from "@/components/ui/text";
import { useDashboardViewModel } from "@/features/dashboard/presentation/viewmodels/useDashboardViewModel";
import { Link, useRouter } from "expo-router";
import {
  Bell,
  FastForward,
  PillBottle,
  Plus,
  Share,
} from "lucide-react-native";
import {
  ImageBackground,
  ScrollView,
  View,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import DashboardButton from "./components/dashButton";
import DashCard from "./components/dashCard";

const ELIPSE = images.elipse;
const ELIPSE_FLIP = images.elipseFlip;

export default function DashboardView() {
  const router = useRouter();
  const {
    hasMedications,
    greeting,
    userName,
    nextMedication,
    timeUntilNext,
    confirmEarlyDose,
    streakDays,
    topSideEffect,
    hasUnreadNotifications,
  } = useDashboardViewModel();

  return (
    <SafeAreaView className="flex-1 bg-[#179A9B]" edges={["top"]}>
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2 flex-1">
          <View className="flex flex-row items-center justify-between px-6 py-4 bg-[#179A9B] shadow-xl z-50">
            <View className="flex-row items-center gap-3">
              <Image source={images.whitelogo} className="w-[8vw] h-[8vw]" />
              <Text className="text-2xl font-bold text-white">Focus</Text>
            </View>
            <View className="flex flex-row gap-2 justify-end p-2">
              <Link href="/notificationsView" asChild>
                <TouchableOpacity className="relative bg-white/20 p-2 rounded-full">
                  <Bell size={24} color="white" />
                  {hasUnreadNotifications && (
                    <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#179A9B]" />
                  )}
                </TouchableOpacity>
              </Link>
            </View>
          </View>
          <View className="gap-4 p-4">
            <View className="gap-2">
              <View className="flex flex-row items-center justify-start gap-2 p-2">
                <ProfileAvatar className="w-[20vw] h-[20vw]" withLink />
                <Text className="text-2xl font-normal text-foreground">
                  {greeting}, {userName}!
                </Text>
              </View>
              <DashboardButton
                text="Adicionar novo medicamento"
                icon={Plus}
                iconClassName="w-[12vw] h-[12vw]"
                onPress={() => router.push("/mymeds")}
              />
              <DashboardButton
                text="Registrar novo efeito colateral"
                icon={Plus}
                iconClassName="w-[12vw] h-[12vw]"
                onPress={() => router.push("/newEffect")}
              />
            </View>
            {hasMedications ? (
              <View className="m-2 flex flex-col justify-between rounded-[24px] bg-[#179A9B] p-4 overflow-hidden relative">
                <ImageBackground
                  source={images.bgMoons}
                  resizeMode="cover"
                  className="absolute right-[-50] top-[-50] w-[300px] h-[300px] opacity-50"
                ></ImageBackground>
                <View className="flex flex-row items-center justify-between z-10">
                  <Text className="p-2 text-xl font-semibold text-primary-foreground flex-1">
                    {nextMedication
                      ? `Próxima medicação: ${nextMedication.name}`
                      : "Todas as doses de hoje tomadas!\nNos vemos amanhã!"}
                  </Text>

                  <View className="items-center justify-center rounded-full p-2">
                    <FastForward className="w-[12vw] h-[12vw]" color="white" />
                  </View>
                </View>
                {nextMedication && (
                  <>
                    <View className="justify-between p-4 text-xl z-10">
                      <View className="pt-8">
                        <Text className="text-lg text-primary-foreground">
                          {timeUntilNext === "Agora"
                            ? "Hora de tomar"
                            : "Faltam"}
                        </Text>
                        <Text className="text-4xl font-bold text-primary-foreground">
                          {timeUntilNext}
                        </Text>
                      </View>
                    </View>

                    <DashboardButton
                      text="Confirmar dose antecipada"
                      icon={FastForward}
                      iconClassName="w-[8vw] h-[8vw]"
                      onPress={confirmEarlyDose}
                    />
                  </>
                )}
              </View>
            ) : (
              <View className="m-2 flex flex-col justify-between rounded-[24px] bg-[#179A9B] p-4 overflow-hidden relative">
                <ImageBackground
                  source={images.bgMoons}
                  resizeMode="cover"
                  className="absolute right-[-50] top-[-50] w-[300px] h-[300px] opacity-50"
                ></ImageBackground>
                <View className="flex flex-row items-center justify-between z-10">
                  <Text className="p-2 text-xl font-semibold text-primary-foreground flex-1">
                    Seu calendário de medicação está vazio!
                  </Text>
                </View>
              </View>
            )}
            <View className="p-2">
              <View className="flex flex-row items-center justify-between p-2 pt-4">
                <Text className="text-2xl font-semibold">Estatísticas</Text>
              </View>
              <View className="flex flex-row items-center justify-between">
                <DashCard
                  title="Dias de sucesso"
                  counter={streakDays}
                  counterDescription="Seguidos"
                  backgroundImage={ELIPSE}
                />
                <DashCard
                  title="Efeito comum"
                  counterDescription={topSideEffect}
                  backgroundImage={ELIPSE_FLIP}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
