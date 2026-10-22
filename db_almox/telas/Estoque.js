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
} from 'react-native';

// Exemplo de dados de produtos no estoque
const dadosEstoqueInicial = [
  {
    id: '1',
    nome: 'Item Exemplo 1',
    codigo: 'COD-001',
    quantidade: 45,
    imagem: 'https://via.placeholder.com/65',
    status: 'Em Estoque',
  },
  {
    id: '2',
    nome: 'Item Exemplo 2',
    codigo: 'COD-002',
    quantidade: 5,
    imagem: 'https://via.placeholder.com/65',
    status: 'Baixo Estoque',
  },
  {
    id: '3',
    nome: 'Item Exemplo 3',
    codigo: 'COD-003',
    quantidade: 0,
    imagem: 'https://via.placeholder.com/65',
    status: 'Esgotado',
  },
];

export default function EstoqueScreen({ navigation }) {
  const [produtos, setProdutos] = useState(dadosEstoqueInicial);
  const [busca, setBusca] = useState('');

  // Filtro de pesquisa rápida
  const produtosFiltrados = produtos.filter(item =>
    item.nome.toLowerCase().includes(busca.toLowerCase()) ||
    item.codigo.toLowerCase().includes(busca.toLowerCase())
  );

  const renderItem = ({ item }) => {
    // Definir cor da badge baseada no status/quantidade
    let badgeBg = '#28a745'; // Verde
    if (item.quantidade <= 0) badgeBg = '#dc3545'; // Vermelho
    else if (item.quantidade <= 10) badgeBg = '#ffc107'; // Amarelo

    return (
      <View style={styles.cardItem}>
        <Image
          source={{ uri: item.imagem }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.nome}</Text>
          <Text style={styles.productCode}>Cód: {item.codigo}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Text style={styles.badgeText}>{item.quantidade} un.</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#192A6B" />

      {/* 1. NAVBAR FIXA COM LOGO SOBRESSALENTE */}
      <View style={styles.navbar}>
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.brandContainer}
            activeOpacity={0.8}
            onPress={() => {}}
          >
            <Image
              source={require('./assets/logo.png')} // Substitua pela sua logo em assets
              style={styles.logoNavbar}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Atalhos do Menu (Estoque / Movimentação) */}
          <View style={styles.menuLinks}>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.navLink, styles.navLinkActive]}>Estoque</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation?.navigate('Movimentacao')}>
              <Text style={styles.navLink}>Movimentação</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.content}>
        {/* Card Header com Título */}
        <View style={styles.cardHeader}>
          <Text style={styles.titulo}>Controle de Estoque</Text>
        </View>

        {/* Input de Busca */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou código..."
            placeholderTextColor="#888"
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* Lista de Produtos (Substitui a Tabela HTML) */}
        <FlatList
          data={produtosFiltrados}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },

  /* 1. NAVBAR */
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
  /* 2. LOGO FLUTUANTE (Supera a altura da navbar de 55px) */
  logoNavbar: {
    height: 65,
    width: 90,
    position: 'absolute',
    top: -5, // Faz a logo flutuar levemente para fora
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
    color: '#F99203', // Cor destaque ao passar o mouse/selecionado
    fontWeight: 'bold',
  },

  /* CONTEÚDO E CARD DE ESTOQUE */
  content: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    backgroundColor: '#192A6B',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: '#333',
  },

  /* LISTA DE ITENS */
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Sombra Android
  },
  productImage: {
    width: 65,
    height: 65,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#192A6B',
    marginBottom: 2,
  },
  productCode: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});