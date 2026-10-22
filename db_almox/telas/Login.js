import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  return (
    <ImageBackground
      source={require('./assets/Design sem nome.jpg')} // certifique-se de que a imagem esteja na pasta assets
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Camada para dar o efeito de opacidade/overlay que você tinha no pseudo-elemento ::before */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Fotinho centralizada */}
          <View style={styles.logoContainer}>
            <Image
              source={require('./assets/fotinho.png')} // Substitua pelo caminho correto da sua logo
              style={styles.fotinho}
              resizeMode="contain"
            />
          </View>

          {/* Cartão de Login */}
          <View style={styles.card}>
            <Text style={styles.title}>Login</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
              />
            </View>

            <TouchableOpacity style={styles.button} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: '#0046B5', // Cor de fundo original
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 70, 181, 0.4)', // Ajuste a opacidade para casar com o seu ::before
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fotinho: {
    width: 140,
    height: 140,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Sombra para Android
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0046B5',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#000000',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#0046B5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
