// App.tsx (create at project root)
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import RootEntry from './app/(tabs)/index'; // <- path to the file you previously edited

export default function App() {
  return (
    <NavigationContainer>
      <RootEntry />
    </NavigationContainer>
  );
}
