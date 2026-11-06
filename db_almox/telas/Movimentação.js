import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';

export default function MovimentacaoScreen({ navigation }) {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Form State
  const [produtoId, setProdutoId] = useState(''); // O ideal é enviar o ID do produto
  const [tipo, setTipo] = useState('Entrada');
  const [quantidade, setQuantidade] = useState('');

  // Função para buscar o histórico da API
  const carregarHistorico = async () => {
    try {
      setCarregando(true);
      // ATENÇÃO: Se estiver a testar num telemóvel físico, substitua "localhost" pelo IP da sua máquina
      const resposta = await fetch('http://192.168.56.1:5000/movimentacao'); // Ou crie uma rota /api/historico se preferir JSON puro
      // Como a rota /movimentacao original retorna HTML, vamos usar a nossa rota de API ou endpoint dedicado.
      // Para o Expo, o ideal é consumir dados em JSON. Vamos ajustar para buscar da API de estoque/histórico.
    } catch (erro) {
      console.error(erro);
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarMovimentacao = async () => {
    if (!produtoId || !quantidade) {
      Alert.alert('Atenção', 'Informe o ID do produto e a quantidade.');
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch('http://localhost:5000/api/movimentacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_produto: produtoId,
          tipo: tipo,
          quantidade: parseInt(quantidade, 10),
          usuario: 'Aplicativo',
        }),
      });

      const resultado = await resposta.json();

      if (resposta.ok && resultado.status === 'sucesso') {
        Alert.alert('Sucesso', 'Movimentação registrada com sucesso!');
        setProdutoId('');
        setQuantidade('');
        setModalVisible(false);
      } else {
        Alert.alert('Erro', resultado.mensagem || 'Não foi possível registrar a movimentação.');
      }
    } catch (erro) {
      console.error(erro);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Flask.');
    } finally {
      setSalvando(false);
    }
  };

  const renderItem = ({ item }) => {
    const isEntrada = item.tipo === 'Entrada';

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardInfo}>
          <Text style={styles.productName}>{item.produto || item.nome_produto}</Text>
          <Text style={styles.dateText}>Data: {item.data || item.data_registro}</Text>
        </View>

        <View style={styles.cardActions}>
          <Text style={styles.quantityText}>{item.quantidade} un.</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: isEntrada ? '#28a745' : '#dc3545' },
            ]}
          >
            <Text style={styles.badgeText}>{item.tipo}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#192A6B" />

      {/* NAVBAR FIXA */}
      <View style={styles.navbar}>
        <View style={styles.navContainer}>
          <TouchableOpacity style={styles.brandContainer} activeOpacity={0.8}>
            <Image
              source={require('./assets/logo.png')}
              style={styles.logoNavbar}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.menuLinks}>
            <TouchableOpacity onPress={() => navigation?.navigate('Estoque')}>
              <Text style={styles.navLink}>Estoque</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.navLink, styles.navLinkActive]}>
                Movimentação
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.h2}>Movimentações</Text>
          <TouchableOpacity
            style={styles.btnWarning}
            activeOpacity={0.8}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.btnWarningText}>+ Nova Movimentação</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={movimentacoes}
          keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma movimentação recente registrada.</Text>
          }
        />
      </View>

      {/* MODAL DE CADASTRO DE MOVIMENTAÇÃO */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Movimentação</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>ID do Produto</Text>
              <TextInput
                style={styles.formControl}
                placeholder="Ex: 1"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={produtoId}
                onChangeText={setProdutoId}
              />

              <Text style={styles.label}>Tipo de Movimentação</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    tipo === 'Entrada' && styles.typeButtonActiveEntrada,
                  ]}
                  onPress={() => setTipo('Entrada')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      tipo === 'Entrada' && styles.typeButtonTextActive,
                    ]}
                  >
                    Entrada
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    tipo === 'Saida' && styles.typeButtonActiveSaida,
                  ]}
                  onPress={() => setTipo('Saida')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      tipo === 'Saida' && styles.typeButtonTextActive,
                    ]}
                  >
                    Saída
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Quantidade</Text>
              <TextInput
                style={styles.formControl}
                placeholder="Ex: 10"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={quantidade}
                onChangeText={setQuantidade}
              />

              <TouchableOpacity
                style={styles.btnPrimary}
                activeOpacity={0.8}
                onPress={handleSalvarMovimentacao}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Salvar Registro</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  navbar: {
    backgroundColor: '#192A6B',
    height: 55,
    justifyContent: 'center',
    paddingHorizontal: 15,
    zIndex: 9999,
    elevation: 5,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    position: 'relative',
  },
  brandContainer: {
    position: 'relative',
    height: '100%',
    minWidth: 100,
    justifyContent: 'center',
  },
  logoNavbar: {
    height: 65,
    width: 90,
    position: 'absolute',
    top: -5,
  },
  menuLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  navLink: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  navLinkActive: {
    color: '#F99203',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  h2: {
    color: '#192A6B',
    fontSize: 22,
    fontWeight: 'bold',
  },
  btnWarning: {
    backgroundColor: '#F99203',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnWarningText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnPrimary: {
    backgroundColor: '#192A6B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#192A6B',
  },
  dateText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  quantityText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    backgroundColor: '#192A6B',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeModalText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  formControl: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActiveEntrada: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  typeButtonActiveSaida: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  typeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 30,
    fontSize: 15,
  },
});