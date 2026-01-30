import { images } from "@/assets/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import { useAuthStateViewModel } from "@/features/auth/presentation/viewmodels/useAuthStateViewModel";
import { Link } from "expo-router";
import { TouchableOpacity } from "react-native";

interface ProfileAvatarProps {
  className?: string;
  fallbackText?: string;
  withLink?: boolean;
}

export function ProfileAvatar({
  className,
  fallbackText = "",
  withLink = true,
}: ProfileAvatarProps) {
  const { user } = useAuthStateViewModel();

  const imageSource = user?.profilePicture
    ? typeof user.profilePicture === "string"
      ? { uri: user.profilePicture }
      : user.profilePicture
    : images.profilePic;

  const AvatarComponent = (
    <Avatar className={className} alt="User Avatar">
      <AvatarImage source={imageSource} />
      <AvatarFallback>
        <Text>{fallbackText}</Text>
      </AvatarFallback>
    </Avatar>
  );

  if (withLink) {
    return (
      <Link href="/profile" asChild>
        <TouchableOpacity>{AvatarComponent}</TouchableOpacity>
      </Link>
    );
  }

  return AvatarComponent;
}
