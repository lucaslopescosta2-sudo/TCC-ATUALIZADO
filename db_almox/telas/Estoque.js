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
  ActivityIndicator,
  Alert,
} from 'react-native';

export default function EstoqueScreen({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Função para buscar os produtos na API do Flask
  const carregarEstoque = async () => {
    try {
      setCarregando(true);
      // ATENÇÃO: Se estiver a testar num telemóvel físico via Expo Go, 
      // substitua "localhost" pelo IP da sua máquina (ex: "http://192.168.1.15:5000/api/estoque")
      const resposta = await fetch('http://192.168.56.1:5000/api/estoque');
      const dados = await resposta.json();

      if (resposta.ok && dados.status === 'sucesso') {
        setProdutos(dados.produtos);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os produtos do estoque.');
      }
    } catch (erro) {
      console.error(erro);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor Flask.');
    } finally {
      setCarregando(false);
    }
  };

  // Carrega o estoque sempre que a tela for aberta ou focada
  useEffect(() => {
    carregarEstoque();
  }, []);

  // Filtro de pesquisa rápida por nome ou categoria
  const produtosFiltrados = produtos.filter(item =>
    item.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (item.categoria && item.categoria.toLowerCase().includes(busca.toLowerCase()))
  );

  const renderItem = ({ item }) => {
    // Definir cor da badge baseada na quantidade disponível
    let badgeBg = '#28a745'; // Verde
    if (item.quantidade_disponivel <= 0) badgeBg = '#dc3545'; // Vermelho
    else if (item.quantidade_disponivel <= (item.quantidade_minima || 2)) badgeBg = '#ffc107'; // Amarelo

    // Tratamento da imagem (se vier URL padrão ou vazia)
    const imagemUri = item.imagem && item.imagem.startsWith('http') 
      ? item.imagem 
      : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1lD3czkr0cNGlMHlhaDziIT-ITO4Nm79glIl185Ew&s=10';

    return (
      <View style={styles.cardItem}>
        <Image
          source={{ uri: imagemUri }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.nome}</Text>
          <Text style={styles.productCode}>Categoria: {item.categoria || 'Geral'}</Text>
          <Text style={styles.productPrice}>R$ {Number(item.preco).toFixed(2)}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Text style={styles.badgeText}>{item.quantidade_disponivel} un.</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#192A6B" />

      {/* 1. NAVBAR FIXA COM LOGO */}
      <View style={styles.navbar}>
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.brandContainer}
            activeOpacity={0.8}
            onPress={() => carregarEstoque()}
          >
            <Image
              source={require('./assets/logo.png')}
              style={styles.logoNavbar}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Atalhos do Menu */}
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
        <View style={styles.cardHeader}>
          <Text style={styles.titulo}>Controle de Estoque</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou categoria..."
            placeholderTextColor="#888"
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#192A6B" />
            <Text style={styles.loadingText}>A carregar estoque...</Text>
          </View>
        ) : (
          <FlatList
            data={produtosFiltrados}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum produto encontrado no estoque.</Text>
            }
          />
        )}
      </View>
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
    elevation: 3,
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
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#28a745',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 30,
    fontSize: 15,
  },
});