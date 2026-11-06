import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa as tuas telas organizadas na pasta "telas"
import LoginScreen from './telas/Login';
import EstoqueScreen from './telas/Estoque';
import MovimentacaoScreen from './telas/Movimentação';
import AdicionarScreen from './telas/Adicionar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{ headerShown: false }} // Oculta o cabeçalho padrão para mantermos a nossa navbar bonita
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Estoque" component={EstoqueScreen} />
        <Stack.Screen name="Movimentacao" component={MovimentacaoScreen} />
        <Stack.Screen name="Adicionar" component={AdicionarScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}