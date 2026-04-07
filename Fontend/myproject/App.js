import Login from './screens/User/Login';
import Register from './screens/User/Register';
import Home from './screens/Home/Home';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const TabNavigatior = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} options={{tabBarIcon: () => <Icon size={20} source="home" /> }} />
      <Tab.Screen name="User" component={StackNavigator} options={{tabBarIcon: () => <Icon size={20} source="account" /> }} />
    </Tab.Navigator>
  );
}



const App = () => {
  return (
    <NavigationContainer>
      <TabNavigatior />
    </NavigationContainer>
  );
}

export default App;
