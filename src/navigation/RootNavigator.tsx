import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from '../constants';
import type {RootStackParamList} from './types';

import HomeScreen from '../screens/HomeScreen';
import TimerScreen from '../screens/TimerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {backgroundColor: Colors.black},
        headerTintColor: Colors.white,
        headerTitleStyle: {fontWeight: '700'},
        contentStyle: {backgroundColor: Colors.black},
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Timer"
        component={TimerScreen}
        options={{title: '', headerTransparent: true}}
      />

    </Stack.Navigator>
  );
}
