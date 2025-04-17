import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
    <StatusBar style="light" />
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff" },
        animation: "slide_from_right",
        header: () => null,
        navigationBarHidden: true, //hides bottom navigation bar in android
      }}
      >
    <Stack.Screen name="index" options={{ headerShown: false,}}/>
    <Stack.Screen name="medications/add" 
    options={{ 
      headerShown: false,
      headerBackTitle:"", 
      title:""
    }}/>
    </Stack>
    </>
  )
}
