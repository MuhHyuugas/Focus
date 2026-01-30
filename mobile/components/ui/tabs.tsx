import { TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@rn-primitives/tabs";
import { Platform } from "react-native";

function Tabs({
  className,
  ...props
}: TabsPrimitive.RootProps & React.RefAttributes<TabsPrimitive.RootRef>) {
  // Changed gap-2 to gap-6
  return (
    <TabsPrimitive.Root
      className={cn("flex flex-col gap-6 p-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.ListProps & React.RefAttributes<TabsPrimitive.ListRef>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "flex h-12 flex-row items-center justify-center rounded-full bg-muted p-[3px]",
        Platform.select({
          web: "mx-auto inline-flex w-fit",
          native: "mx-auto",
        }), // Changed from mr-auto to mx-auto
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.TriggerProps & React.RefAttributes<TabsPrimitive.TriggerRef>) {
  const { value } = TabsPrimitive.useRootContext();
  return (
    <TextClassContext.Provider
      value={cn(
        "text-foreground dark:text-muted-foreground text-md text-center font-medium w-full",
        value === props.value && "dark:text-foreground",
      )}
    >
      <TabsPrimitive.Trigger
        className={cn(
          "flex h-[calc(100%-1px)] flex-1 flex-row items-center justify-center gap-1.5 rounded-full border border-transparent px-2 py-2 shadow-none shadow-black/5", // Added flex-1
          Platform.select({
            web: "cursor-default whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0", // Removed inline-flex
          }),
          props.disabled && "opacity-50",
          props.value === value &&
            "bg-background dark:border-foreground/10 dark:bg-input/30",
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.ContentProps & React.RefAttributes<TabsPrimitive.ContentRef>) {
  return (
    <TabsPrimitive.Content
      className={cn(Platform.select({ web: "flex-1 outline-none" }), className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
