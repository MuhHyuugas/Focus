import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const UserItem = ({
  info,
  Icon,
  type,
  style,
  onPress,
}: {
  info: string;
  Icon: LucideIcon;
  type?: string;
  style?: string;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex flex-row items-center gap-2 border rounded-full p-2 w-4/5 ${style}`}
    >
      <Icon color={type === "danger" ? "red" : "#179A9B"} className="m-2" />
      <Text
        className={`text-xl ${type === "danger" ? "text-red-500" : type === "option" ? "text-primary" : "text-gray-400"}`}
      >
        {info}
      </Text>
    </TouchableOpacity>
  );
};

export default UserItem;
