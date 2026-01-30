import { images } from "@/assets/assets";
import { Text } from "@/components/ui/text";
import { useDashboardViewModel } from "@/features/dashboard/presentation/viewmodels/useDashboardViewModel";
import { Link, useRouter } from "expo-router";
import {
  Bell,
  CalendarDays,
  FastForward,
  PillBottle,
  Plus,
  Share,
} from "lucide-react-native";
import { ImageBackground, ScrollView, View } from "react-native";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import DashboardButton from "./components/dashButton";
import DashCard from "./components/dashCard";

const ICON_SIZE = 36;

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
    adherenceRate,
    topSideEffect,
    totalDoses,
    bestTime,
  } = useDashboardViewModel();

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <View className="flex flex-row items-center justify-between p-4 m-2">
            <Text className="text-2xl font-normal text-foreground">
              {greeting}, {userName}!
            </Text>
            <View className="flex flex-row gap-2 align-center justify-center">
              <Link href="/reportView">
                <CalendarDays size={ICON_SIZE} color="black" />
              </Link>
              <Link href="/notificationsView">
                <Bell size={ICON_SIZE} color="black" />
              </Link>
              <ProfileAvatar className="w-[10vw] h-[10vw]" withLink />
            </View>
          </View>
          <View className="gap-4 p-2">
            <View className="gap-2">
              <DashboardButton
                text={
                  hasMedications
                    ? "Meus medicamentos"
                    : "Adicionar novo medicamento"
                }
                icon={hasMedications ? PillBottle : Plus}
                iconClassName="w-[12vw] h-[12vw]"
                onPress={() => router.push("/myMedsView")}
              />
              <DashboardButton
                text="Registrar novo efeito colateral"
                icon={Plus}
                iconClassName="w-[12vw] h-[12vw]"
                onPress={() => router.push("/newEffectView")}
              />
            </View>
            {hasMedications && (
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
            )}
            <View className="p-2">
              <View className="flex flex-row items-center justify-between p-2 pt-4">
                <Text className="text-2xl font-semibold">Estatísticas</Text>
                <Share color="black" className="w-[7vw] h-[7vw]" />
              </View>

              <View className="flex-row flex-wrap justify-center pb-4">
                <DashCard
                  title="Dias de sucesso"
                  counter={streakDays}
                  counterDescription="Seguidos"
                  backgroundImage={ELIPSE}
                />
                <DashCard
                  title="Aderência 7d"
                  counter={adherenceRate}
                  counterDescription="%"
                  backgroundImage={ELIPSE_FLIP}
                />
                <DashCard
                  title="Doses Totais"
                  counter={totalDoses}
                  counterDescription="Doses"
                  backgroundImage={ELIPSE}
                />
                <DashCard
                  title="Melhor horário"
                  counter={bestTime}
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
    </>
  );
}
