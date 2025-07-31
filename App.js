import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FontLoader from './FontLoader'; 
import { NativeRouter, Route, Routes } from 'react-router-native';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';
import Home from './Home'; 
import Craft from './Craft'; 
import Game from './game';
import Run from './run';
import PlayScreen  from './Play';
import SelectGameType from './selectGameType';
import Developer from './developer';
import Profile from './profile';
import Settings from './settings';
import Assets from './Assets';
import Folder from './Folder';
import Map from './Map';
import Search from './Search';
import RunGame from './runGame';
import DevGame from './devGame';
import EditProfile from './edit_profile';
import ReportProblem from './report';
import A_Profile from './a_profile';
import ErrorBoundary from './ErrorBoundary';
import EditAccount from './editAccount';
import Dashboard from './dashboard';
import GameServer from './gameServer';
import Admin from './admin';
import CraftPixelArt from './pixelArt';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NativeRouter>
      <FontLoader>
        {/* Wrap your Routes component with the ErrorBoundary */}
        <ErrorBoundary>
          <Routes>
          <Route path="/dashboard/*" element={<Dashboard />}>
            <Route path="gameServer/:id/:admin" element={<GameServer />} />
          </Route>
            <Route path="/" element={<SignInScreen />} />
            <Route path="/signUp" element={<SignUpScreen />} />
            <Route path="/home" element={<Home />} />
            <Route path="/craft" element={<Craft />} />
            <Route path="/run" element={<Run />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/runGame" element={<RunGame/>} />
            <Route path="/devGame" element={<DevGame/>} />
            <Route path="/game" element={<Game />} />
            <Route path="/play" element={<PlayScreen />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/a_profile/:id" element={<A_Profile />} />
            <Route path="/select" element={<SelectGameType />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/assets/:id" element={<Assets />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/folder/:id" element={<Folder />} />
            <Route path="/developer/:id" element={<Developer />} />
            <Route path="/Map/:id" element={<Map />} />
            <Route path="/Search" element={<Search />} />
            <Route path="/editProfile" element={<EditProfile />} />
            <Route path="/editAccount" element={<EditAccount />} />
            <Route path="/report" element={<ReportProblem />} />
            <Route path="/pixelart" element={<CraftPixelArt />} />
          </Routes>
        </ErrorBoundary>
      </FontLoader>
    </NativeRouter>
  );
}