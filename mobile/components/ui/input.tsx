import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react-native";
import { Platform, TextInput, type TextInputProps, View } from "react-native";

type InputProps = TextInputProps &
  React.RefAttributes<TextInput> & {
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    iconSize?: number;
    containerClassName?: string;
  };

function Input({
  className,
  leftIcon,
  rightIcon,
  iconSize = 24,
  containerClassName,
  ...props
}: InputProps) {
  // Extract presentation logic for cleaner code
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon;
  const paddingClasses =
    hasLeftIcon && hasRightIcon
      ? "pl-14 pr-10"
      : hasLeftIcon
        ? "pl-14 pr-3"
        : hasRightIcon
          ? "pl-4 pr-10"
          : "pl-4 pr-3";

  return (
    <View className={cn("flex-row items-center", containerClassName)}>
      {hasLeftIcon && (
        <View className="absolute left-3 z-10 p-1">
          <Icon
            as={leftIcon}
            size={iconSize}
            className="text-muted-foreground"
          />
        </View>
      )}
      <TextInput
        className={cn(
          "flex h-14 w-full min-w-0 flex-row items-center rounded-full border border-input bg-background py-1 text-lg leading-5 text-foreground shadow-sm shadow-black/5 dark:bg-input/30 sm:h-9",
          paddingClasses,
          props.editable === false &&
            cn(
              "opacity-50",
              Platform.select({
                web: "disabled:pointer-events-none disabled:cursor-not-allowed",
              }),
            ),
          Platform.select({
            web: cn(
              "outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground md:text-sm",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            ),
            native: "placeholder:text-muted-foreground/50",
          }),
          className,
        )}
        {...props}
      />
      {hasRightIcon && (
        <View className="absolute right-3 z-10">
          <Icon
            as={rightIcon}
            size={iconSize}
            className="text-muted-foreground"
          />
        </View>
      )}
    </View>
  );
}

export { Input };
