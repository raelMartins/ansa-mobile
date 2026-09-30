import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SignInScreen } from "../../identity/screens/SignInScreen";
import { SignUpScreen } from "../../identity/screens/SignUpScreen";
import { colors } from "../ui/theme";
import type { AuthStackParamList } from "./types";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
