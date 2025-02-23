
import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, FlatList, Text, Image } from 'react-native';
import axios from 'axios';
import CustomText from './CustomText';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigate } from 'react-router-native';
import API_ENDPOINTS from './api';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(''); // Holds selected category
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  // Function to handle search based on category
  const handleSearch = async () => {
    if (!searchQuery) {
      alert('Please enter a search query');
      return;
    }

    try {
      let response;

      if (category === 'game_code') {
        // Exact match search for game code
        response = await axios.get(API_ENDPOINTS.searchGameCodeExact, { params: { query: searchQuery } });
        setSearchResults(response.data);
      } else if (category === 'user') {
        // Partial match search for user
        response = await axios.get(API_ENDPOINTS.searchUser, { params: { query: searchQuery } });
        setSearchResults(response.data);
      } else if (category === 'game_name') {
        // Partial match search for game name
        response = await axios.get(API_ENDPOINTS.searchGameName, { params: { query: searchQuery } });
        setSearchResults(response.data);
      } else {
        // When "All" is selected, search in all APIs (user, game name, game code)
        const [userResults, gameNameResults, gameCodeResults] = await Promise.all([
          axios.get(API_ENDPOINTS.searchUser, { params: { query: searchQuery } }),
          axios.get(API_ENDPOINTS.searchGameName, { params: { query: searchQuery } }),
          axios.get(API_ENDPOINTS.searchGameCodeExact, { params: { query: searchQuery } }),
        ]);

        const allResults = [
          ...userResults.data,
          ...gameNameResults.data,
          ...gameCodeResults.data,
        ];

        setSearchResults(allResults);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleBackPress = () => {
    navigate('/home'); 
  };

  const renderSearchResult = ({ item }) => {
    return (
      <TouchableOpacity style={styles.resultContainer} onPress={() => navigate(`/game/${item.id}`)}>
        <CustomText style={styles.resultText}>
          {item.game_name ? item.game_name : item.username} - {item.game_code || 'No Code'}
        </CustomText>
      </TouchableOpacity>
    );
  };

  const getPlaceholderText = () => {
    switch (category) {
      case 'user':
        return '@';
      case 'game_name':
        return 'Search';
      case 'game_code':
        return '#';
      default:
        return 'Search';
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
    <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <CustomText style={styles.backButtonText}>&lt;</CustomText>
     </TouchableOpacity>
      {/* Category Selection */}
      <View style={styles.categoryContainer}>
      <TouchableOpacity
          style={[styles.categoryButton, category === '' && styles.selectedCategory]}
          onPress={() => setCategory('')}
        >
          <Text style={[styles.categoryText, category === '' && styles.selectedCategoryText]}>x</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, category === 'user' && styles.selectedCategory]}
          onPress={() => setCategory('user')}
        >
          <Text style={[styles.categoryText, category === 'user' && styles.selectedCategoryText]}>user</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, category === 'game_name' && styles.selectedCategory]}
          onPress={() => setCategory('game_name')}
        >
          <Text style={[styles.categoryText, category === 'game_name' && styles.selectedCategoryText]}>game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, category === 'game_code' && styles.selectedCategory]}
          onPress={() => setCategory('game_code')}
        >
          <Text style={[styles.categoryText, category === 'game_code' && styles.selectedCategoryText]}>code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder={getPlaceholderText()} 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="white"
      />

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Image source={require('./assets/search.png')} style={styles.searchIcon} />
      </TouchableOpacity>
      </View>


      {/* Display Search Results */}
    {searchResults.length === 0 ? (
    <Image source={require('./assets/treasure.gif')} style={styles.noResultsImage} />
    ) : (
    <FlatList
    data={searchResults}
    renderItem={renderSearchResult}
    keyExtractor={(item) => item.id.toString()}
    style={styles.resultsList}
    />
    )}

    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
    backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    width: 110,
    height: 110,
    borderRadius: 5,
    },
    backButtonText: {
    color: '#ffffff',
    fontSize: 35,

    },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 30,
  },
  categoryButton: {
    padding: 10,
    margin: 5,
  },
  selectedCategoryText: {
    color: '#CE55F2',
  },
  categoryText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Minecraft Regular',
  },
  searchInput: {
    fontFamily:"Minecraft Regular",
    width: '90%',
    padding: 10,
    backgroundColor: '#333333',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  searchButton: {
    marginLeft: 5,
    padding: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    width: 24, 
    height: 24, 
    tintColor: '#FFFFFF', 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    width: '100%',
  },
  noResultsImage: {
    width: 100, 
    height: 100, 
    resizeMode: 'contain',
    marginTop: 170,
    opacity: 0.5, 
  },
  resultContainer: {
    backgroundColor: '#444444',
    padding: 10,
    marginBottom: 10,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

