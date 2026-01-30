import { images } from "@/assets/assets";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useAuthStateViewModel } from "@/features/auth/presentation/viewmodels/useAuthStateViewModel";
import { useDeleteUserViewModel } from "@/features/auth/presentation/viewmodels/useDeleteUserViewModel";
import { useLogoutViewModel } from "@/features/auth/presentation/viewmodels/useLogoutViewModel";
import { useUpdateUserViewModel } from "@/features/auth/presentation/viewmodels/useUpdateUserViewModel";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import {
  Calendar,
  Camera,
  Lock,
  LogOut,
  Mail,
  Phone,
  Settings,
  Trash2,
  User2,
} from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import UserItem from "./components/userItem";

const screenOptions = {
  headerShown: true,
  headerTitle: "Perfil",
  headerTitleStyle: {
    fontWeight: "600" as const,
  },
  headerStyle: {
    backgroundColor: "#ffffff",
  },
};
const User = () => {
  const { logout } = useLogoutViewModel();
  const { user, checkAuthState } = useAuthStateViewModel();
  const { updateUser, isLoading: isUpdating } = useUpdateUserViewModel();
  const { deleteUser, isLoading: isDeleting } = useDeleteUserViewModel();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && user) {
      await updateUser({ ...user, profilePicture: result.assets[0].uri });
      await checkAuthState();
    }
  };

  const imageSource = user?.profilePicture
    ? typeof user.profilePicture === "string"
      ? { uri: user.profilePicture }
      : user.profilePicture
    : images.profilePic;

  return (
    <>
      <Stack.Screen
        options={{
          ...screenOptions,
          //headerRight: () => <ProfileAvatar className="mr-4" />,
        }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="p-2 flex flex-col gap-2 items-center justify-start">
          <View className="relative m-4">
            <Avatar className="w-24 h-24" alt="Foto de perfil">
              <AvatarImage source={imageSource} />
              <AvatarFallback>
                <Text>US</Text>
              </AvatarFallback>
            </Avatar>
            <TouchableOpacity
              onPress={pickImage}
              disabled={isUpdating}
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 border border-gray-200"
            >
              <Camera size={20} color="#000" />
            </TouchableOpacity>
          </View>
          <UserItem info={user?.name || "Usuário"} Icon={User2} />
          <UserItem
            info={user?.birthDate || "Data de Nascimento"}
            Icon={Calendar}
          />
          <UserItem info={user?.email || "Email"} Icon={Mail} />
          <UserItem info={user?.phone || "Telefone"} Icon={Phone} />
          <UserItem info="********" Icon={Lock} />
          <Separator className="m-4 w-4/5" />
          <UserItem info="Configurações" Icon={Settings} type="option" />
          <UserItem info="Sair" Icon={LogOut} type="option" onPress={logout} />
          <Separator className="m-4 w-4/5" />
          <UserItem
            info={isDeleting ? "Excluindo..." : "Excluir Conta"}
            Icon={Trash2}
            type="danger"
            onPress={deleteUser}
          />
        </View>
      </ScrollView>
    </>
  );
};

export default User;
