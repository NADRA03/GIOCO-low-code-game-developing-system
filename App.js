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
import SelectGameType from './selectGameType';
import Developer from './developer';
import Profile from './profile';
import Settings from './settings';
import Assets from './Assets';
import Folder from './Folder';
import Map from './Map';
import ErrorBoundary from './ErrorBoundary';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NativeRouter>
      <FontLoader>
        {/* Wrap your Routes component with the ErrorBoundary */}
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<SignUpScreen />} />
            <Route path="/home" element={<Home />} />
            <Route path="/craft" element={<Craft />} />
            <Route path="/game" element={<Game />} />
            <Route path="/play" element={<PlayScreen />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/select" element={<SelectGameType />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/assets/:id" element={<Assets />} />
            <Route path="/folder/:id" element={<Folder />} />
            <Route path="/developer/:id" element={<Developer />} />
            <Route path="/Map/:id" element={<Map />} />
          </Routes>
        </ErrorBoundary>
      </FontLoader>
    </NativeRouter>
  );
}