import Login from './screens/User/Login';
import Register from './screens/User/Register';
import Home from './screens/Home/Home';
import DoctorDetail from './screens/User/DoctorDetail';
import UserProfile from './screens/User/UserProfile';
import Booking from './screens/Appointment/Booking';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { View } from 'react-native';
import Scheduler from './screens/User/Schedule';
import { MyUserContext } from './utils/contexts/MyUserContext';
import { useContext, useEffect, useReducer, useState } from 'react';
import MyUserReducer from './utils/reducers/MyUserReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StackUserNavigator = () => {
  // thông tin user toàn cục
  const { user } = useContext(MyUserContext);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserProfile" component={UserProfile} />
      {user ? (
        <>
          <Stack.Screen name="Schedule"    component={Scheduler} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login"        component={Login} />
          <Stack.Screen name="Register"     component={Register} />
        </>
      )}
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

const BookingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Booking" component={Booking} />
    </Stack.Navigator>
  );
}

const TabNavigatior = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={StackHomeNavigator} options={{tabBarIcon: () => <Icon size={20} source="home" /> } } />
      <Tab.Screen name="Booking" component={BookingNavigator} options={{tabBarIcon: () => <Icon size={20} source="calendar" /> }} />
      <Tab.Screen name="User" component={StackUserNavigator} options={{tabBarIcon: () => <Icon size={20} source="account" /> }} />
    </Tab.Navigator>
  );
}



const App = () => {
  const saved = SecureStore.getItem("user");
  const [user, dispatch] = useReducer(MyUserReducer, saved ? JSON.parse(saved) : null);
  return (
    <MyUserContext.Provider value={{ user, dispatch }}>
      <NavigationContainer>
        <TabNavigatior />
      </NavigationContainer>
    </MyUserContext.Provider>
  );
}

export default App;
