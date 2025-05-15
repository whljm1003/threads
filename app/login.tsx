import { Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function Login() {
  const isLoggedIn = false;
  if (isLoggedIn) {
    return <Redirect href="/(Tabs)" />;
  }

  return (
    <View>
      <Text>Login</Text>
    </View>
  );
}
