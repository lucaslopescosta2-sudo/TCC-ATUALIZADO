import React, { useState } from 'react';
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
} from 'react-native';

const historicoInicial = [
  {
    id: '1',
    produto: 'Item Exemplo 1',
    tipo: 'Entrada',
    quantidade: 20,
    data: '22/10/2026',
  },
  {
    id: '2',
    produto: 'Item Exemplo 2',
    tipo: 'Saída',
    quantidade: 5,
    data: '21/10/2026',
  },
];

export default function MovimentacaoScreen({ navigation }) {
  const [movimentacoes, setMovimentacoes] = useState(historicoInicial);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [produto, setProduto] = useState('');
  const [tipo, setTipo] = useState('Entrada');
  const [quantidade, setQuantidade] = useState('');

  const handleSalvarMovimentacao = () => {
    if (!produto || !quantidade) return;

    const novaMovimentacao = {
      id: Date.now().toString(),
      produto,
      tipo,
      quantidade: parseInt(quantidade, 10),
      data: new Date().toLocaleDateString('pt-BR'),
    };

    setMovimentacoes([novaMovimentacao, ...movimentacoes]);
    setProduto('');
    setQuantidade('');
    setModalVisible(false);
  };

  const renderItem = ({ item }) => {
    const isEntrada = item.tipo === 'Entrada';

    return (
      <View style={styles.cardItem}>
        <View style={styles.cardInfo}>
          <Text style={styles.productName}>{item.produto}</Text>
          <Text style={styles.dateText}>Data: {item.data}</Text>
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
        {/* TÍTULO & BOTÃO DE NOVA MOVIMENTAÇÃO */}
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

        {/* LISTA DE HISTÓRICO (Substitui a Tabela HTML) */}
        <FlatList
          data={movimentacoes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Movimentação</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Produto</Text>
              <TextInput
                style={styles.formControl}
                placeholder="Nome do produto"
                placeholderTextColor="#888"
                value={produto}
                onChangeText={setProduto}
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
                    tipo === 'Saída' && styles.typeButtonActiveSaida,
                  ]}
                  onPress={() => setTipo('Saída')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      tipo === 'Saída' && styles.typeButtonTextActive,
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

              {/* Botão Salvar */}
              <TouchableOpacity
                style={styles.btnPrimary}
                activeOpacity={0.8}
                onPress={handleSalvarMovimentacao}
              >
                <Text style={styles.btnPrimaryText}>Salvar Registro</Text>
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

  /* NAVBAR */
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

  /* CONTEÚDO */
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

  /* BOTÕES */
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

  /* CARDS / LISTA */
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
    // Sombra equivalente ao CSS box-shadow: 0px 3px 10px rgba(0,0,0,0.1)
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

  /* MODAL ESTILOS */
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
});