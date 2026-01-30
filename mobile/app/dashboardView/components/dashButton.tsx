import { Button as UIButton } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface DashboardButtonProps {
  text: string;
  onPress?: () => void;
  icon?: React.ComponentType<{
    color: string;
    size: number;
    className?: string;
  }>;
  className?: string;
  textColor?: string;
  iconColor?: string;
  iconSize?: number;
  iconClassName?: string;
}

export default function DashboardButton({
  text,
  onPress,
  icon: Icon,
  className,
  textColor = "white",
  iconColor = "white",
  iconSize = 36,
  iconClassName,
}: DashboardButtonProps) {
  return (
    <UIButton className={`bg-[#13203F] ${className}`} onPress={onPress}>
      {Icon && (
        <Icon color={iconColor} size={iconSize} className={iconClassName} />
      )}
      <Text className={`text-center text-lg ${textColor}`}>{text}</Text>
    </UIButton>
  );
}
