import { useSyncExternalStore } from "react";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "../lib/theme";
import { appStore } from "../lib/store";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const user = useSyncExternalStore(
    appStore.subscribe,
    () => appStore.getState().user,
  );
  const settings = useSyncExternalStore(
    appStore.subscribe,
    () => appStore.getState().settings,
  );

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
        },
        headerTintColor: isDark ? "#ffffff" : "#000000",
        headerTitleStyle: {
          fontWeight: "600",
        },
        drawerStyle: {
          backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
        },
        drawerLabelStyle: {
          color: isDark ? "#ffffff" : "#000000",
        },
        drawerActiveTintColor: isDark ? "#ffffff" : "#000000",
        drawerInactiveTintColor: isDark ? "#888888" : "#cccccc",
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Home",
          title: "Lightlist",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
