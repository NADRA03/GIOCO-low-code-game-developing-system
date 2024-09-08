import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FontLoader from './FontLoader'; 
import { NativeRouter, Route, Routes } from 'react-router-native';
import SignUpScreen from './SignUpScreen';
import Home from './Home'; 
import Craft from './Craft'; 
import Game from './Game';
import PlayScreen  from './Play';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NativeRouter>
      <FontLoader>
        <Routes>
          <Route path="/f" element={<SignUpScreen />} />
          <Route path="/home" element={<Home />} />
          <Route path="/craft" element={<Craft />} />
          <Route path="/game" element={<Game />} />
          <Route path="/" element={<PlayScreen />} />
        </Routes>
      </FontLoader>
     </NativeRouter>
  );
}

