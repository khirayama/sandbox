import { Platform } from "react-native";
import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useColorScheme } from "../../lib/theme";
import Home from "./home";
import Settings from "./settings";

const Tab = createMaterialTopTabNavigator();

function NativeTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: isDark ? "#ffffff" : "#000000",
        tabBarInactiveTintColor: isDark ? "#888888" : "#cccccc",
        tabBarStyle: {
          backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
          borderBottomColor: isDark ? "#333333" : "#e0e0e0",
          borderBottomWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          textTransform: "none",
        },
        tabBarIndicatorStyle: {
          backgroundColor: isDark ? "#ffffff" : "#000000",
          height: 3,
        },
      }}
    >
      {[
        {
          name: "home",
          component: Home,
          options: {
            tabBarLabel: "Home",
          },
        },
        {
          name: "settings",
          component: Settings,
          options: {
            tabBarLabel: "Settings",
          },
        },
      ].map((screen) => {
        return (
          <Tab.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={screen.options}
          />
        );
      })}
    </Tab.Navigator>
  );
}

function WebTabLayout() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const containerRef = useRef<View>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const tabBarBackgroundColor = isDark ? "#1a1a1a" : "#ffffff";
  const tabBarBorderColor = isDark ? "#333333" : "#e0e0e0";
  const activeTabColor = isDark ? "#ffffff" : "#000000";
  const inactiveTabColor = isDark ? "#888888" : "#cccccc";

  const tabs = [
    { index: 0, label: "Home", component: <Home /> },
    { index: 1, label: "Settings", component: <Settings /> },
  ];

  useEffect(() => {
    const element = containerRef.current as unknown as HTMLElement;
    if (!element) {
      console.warn("Container element not found");
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      console.log("Wheel event detected:", {
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        target: e.target,
        currentTarget: e.currentTarget,
      });

      e.preventDefault();

      if (Math.abs(e.deltaX) > 10) {
        setActiveTabIndex((prevIndex) => {
          if (e.deltaX > 0 && prevIndex < tabs.length - 1) {
            console.log("Scrolling right, switching to next tab");
            return prevIndex + 1;
          } else if (e.deltaX < 0 && prevIndex > 0) {
            console.log("Scrolling left, switching to previous tab");
            return prevIndex - 1;
          }
          return prevIndex;
        });
      }
    };

    console.log("Registering wheel listener on container element");
    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      console.log("Removing wheel listener from container element");
      element.removeEventListener("wheel", handleWheel);
    };
  }, [tabs.length]);

  return (
    <View ref={containerRef} style={styles.container}>
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: tabBarBackgroundColor,
            borderBottomColor: tabBarBorderColor,
          },
        ]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.index}
            onPress={() => setActiveTabIndex(tab.index)}
            style={styles.tabButton}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  color:
                    activeTabIndex === tab.index
                      ? activeTabColor
                      : inactiveTabColor,
                  fontWeight: activeTabIndex === tab.index ? "600" : "400",
                },
              ]}
            >
              {tab.label}
            </Text>
            {activeTabIndex === tab.index && (
              <View
                style={[
                  styles.tabIndicator,
                  { backgroundColor: activeTabColor },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.content}>{tabs[activeTabIndex]?.component}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  tabIndicator: {
    width: "100%",
    height: 3,
  },
  content: {
    flex: 1,
  },
});

export default function TabLayout() {
  if (Platform.OS === "web") {
    return <WebTabLayout />;
  }
  return <NativeTabLayout />;
}
