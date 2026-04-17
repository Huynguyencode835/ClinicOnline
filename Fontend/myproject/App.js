import Login from './screens/User/Login';
import Register from './screens/User/Register';
import Home from './screens/Home/Home';
import DoctorDetail from './screens/User/DoctorDetail';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { View } from 'react-native';
import Scheduler from './screens/User/Schedule';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StackUserNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

const StackHomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="DoctorDetail" component={DoctorDetail} />
    </Stack.Navigator>
  );
}

const TabNavigatior = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={StackHomeNavigator} options={{tabBarIcon: () => <Icon size={20} source="home" /> }} />
      <Tab.Screen name="User" component={StackUserNavigator} options={{tabBarIcon: () => <Icon size={20} source="account" /> }} />
    </Tab.Navigator>
  );
}



const App = () => {
  return (
    <NavigationContainer>
      <TabNavigatior />
    </NavigationContainer>
    // <View>
    //   <Scheduler/>
    // </View>
  );
}

export default App;
