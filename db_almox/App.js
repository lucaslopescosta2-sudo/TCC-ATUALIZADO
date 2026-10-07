import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert 
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function App() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [valorQrCode, setValorQrCode] = useState('http://192.168.1.100:5000'); // IP do servidor Flask / Dados do item

  const handleLogin = async () => {
    if (!usuario || !senha) {
      Alert.alert('Atenção', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.100:5000/controle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          usuario: usuario,
          senha: senha,
        }).toString(),
      });

      if (response.ok) {
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
      } else {
        Alert.alert('Erro', 'E-mail ou senha inválidos!');
      }
    } catch (error) {
      console.error('Erro ao conectar ao servidor:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor Flask.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Logótipo SENAI via URL (evita erro de arquivo local ausente) */}
      <Image
        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/SENAI_Logo.png' }}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Card de Login e QR Code */}
      <View style={styles.card}>
        <Text style={styles.title}>Entrar</Text>

        {/* Campo E-mail */}
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          placeholderTextColor="#aaa"
          value={usuario}
          onChangeText={setUsuario}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Campo Senha */}
        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Sua senha"
          placeholderTextColor="#aaa"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {/* Botão Acessar */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Acessar</Text>
        </TouchableOpacity>

        {/* Seção Gerador de QR Code */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>QR Code do Sistema</Text>
          <View style={styles.qrContainer}>
            {valorQrCode ? (
              <QRCode
                value={valorQrCode}
                size={150}
                color="#000000"
                backgroundColor="#ffffff"
              />
            ) : (
              <Text style={styles.placeholderText}>Insira os dados</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0046B5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#192A6B',
    borderRadius: 15,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    color: '#000000',
  },
  button: {
    backgroundColor: '#0d6efd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qrSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 15,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  qrContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
  },
});