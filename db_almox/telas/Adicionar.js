import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';

export default function Adicionar({ navigation }) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('EPIs');
  const [quantidade, setQuantidade] = useState('');
  const [minimo, setMinimo] = useState('2');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSalvar = async () => {
    if (!nome || !quantidade) {
      Alert.alert('Erro', 'Por favor, preencha o Nome e a Quantidade.');
      return;
    }

    setCarregando(true);

    try {
      // ATENÇÃO: Se estiver a testar num telemóvel físico via Expo Go, 
      // substitua "localhost" pelo IP da sua máquina na rede (ex: "http://192.168.1.15:5000/api/adicionar")
      const resposta = await fetch('http://192.168.56.1:5000/api/adicionar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome,
          categoria: categoria,
          quantidade: parseInt(quantidade),
          quantidade_minima: parseInt(minimo || 0),
          preco: preco.replace(',', '.'),
          descricao: descricao,
        }),
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
        // Limpar campos ou voltar para a tela de estoque
        setNome('');
        setQuantidade('');
        setPreco('');
        setDescricao('');
        if (navigation) {
          navigation.goBack();
        }
      } else {
        Alert.alert('Erro', resultado.mensagem || 'Não foi possível adicionar o produto.');
      }
    } catch (erro) {
      console.error(erro);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Flask.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Adicionar Itens</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Nome do Item *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Luva de Raspa"
            placeholderTextColor="#888"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Categoria</Text>
          <View style={styles.categoriaContainer}>
            <TouchableOpacity
              style={[styles.catBtn, categoria === 'EPIs' && styles.catBtnAtivo]}
              onPress={() => setCategoria('EPIs')}
            >
              <Text style={[styles.catTxt, categoria === 'EPIs' && styles.catTxtAtivo]}>EPIs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catBtn, categoria === 'ferramenta' && styles.catBtnAtivo]}
              onPress={() => setCategoria('ferramenta')}
            >
              <Text style={[styles.catTxt, categoria === 'ferramenta' && styles.catTxtAtivo]}>Ferramentas</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Quantidade *</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={quantidade}
            onChangeText={setQuantidade}
          />

          <Text style={styles.label}>Mínimo em Estoque</Text>
          <TextInput
            style={styles.input}
            placeholder="2"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={minimo}
            onChangeText={setMinimo}
          />

          <Text style={styles.label}>Valor Unitário (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={preco}
            onChangeText={setPreco}
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detalhes adicionais do item..."
            placeholderTextColor="#888"
            multiline={true}
            numberOfLines={4}
            value={descricao}
            onChangeText={setDescricao}
          />

          <View style={styles.botoesContainer}>
            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={() => navigation && navigation.goBack()}
            >
              <Text style={styles.btnCancelarTxt}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSalvar}
              onPress={handleSalvar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnSalvarTxt}>Salvar Item</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f4f4f4',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  header: {
    backgroundColor: '#192A6B',
    padding: 18,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  body: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriaContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  catBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#192A6B',
    borderRadius: 6,
    alignItems: 'center',
  },
  catBtnAtivo: {
    backgroundColor: '#192A6B',
  },
  catTxt: {
    color: '#192A6B',
    fontWeight: '600',
  },
  catTxtAtivo: {
    color: '#fff',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  btnCancelar: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  btnCancelarTxt: {
    color: '#fff',
    fontWeight: '600',
  },
  btnSalvar: {
    backgroundColor: '#198754',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  btnSalvarTxt: {
    color: '#fff',
    fontWeight: '600',
  },
});