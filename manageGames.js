import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Text, 
  Alert 
} from 'react-native';
import axios from 'axios';
import CustomText from './CustomText';
import { useNavigate } from 'react-router-native';
import API_ENDPOINTS from './api';
import { Image } from 'expo-image';

export default function ManageGames() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const endpoint = API_ENDPOINTS.adminSearch;
      let response;
  
      if (!searchQuery) {
        // No query means fetch all
        response = await axios.get(endpoint, { withCredentials: true });
        setSearchResults(response.data.games || []);
      } else if (category === 'game_code') {
        response = await axios.get(endpoint, { params: { code: searchQuery } });
        setSearchResults([response.data]);
      } else if (category === 'game_name') {
        response = await axios.get(endpoint, { params: { name: searchQuery } });
        setSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        Alert.alert('Please select a valid category');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setSearchResults([]);
      } else {
        console.error(error);
        Alert.alert('An error occurred. Check console for details.');
      }
    }
  };

  useEffect(() => {
    handleSearch(); // Load all games initially
  }, []);

  const handleSuspend = async (id) => {
    try {
      const res = await axios.post(
        API_ENDPOINTS.adminSuspend,
        { type: 'game', id },
        { withCredentials: true }
      );
      Alert.alert(res.data.message);
      // remove suspended game from list
      setSearchResults(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to suspend game');
    }
  };

  return (
    <View style={styles.container}>
      {/* Category Buttons */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, category === 'game_name' && styles.selectedCategory]}
          onPress={() => setCategory('game_name')}
        >
          <Text style={[styles.categoryText, category === 'game_name' && styles.selectedCategoryText]}>
            By name
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.categoryButton, category === 'game_code' && styles.selectedCategory]}
          onPress={() => setCategory('game_code')}
        >
          <Text style={[styles.categoryText, category === 'game_code' && styles.selectedCategoryText]}>
            By code
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={category === 'game_code' ? '#' : 'Search'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="white"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Image source={require('./assets/search.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      {/* Results */}
      {searchResults.length === 0 ? (
        <Image source={require('./assets/treasure.gif')} style={styles.noResultsImage} />
      ) : (
        <ScrollView
          style={styles.resultsList}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {searchResults.map(item => (
            <View key={item.id.toString()} style={styles.resultContainer}>
              <CustomText style={styles.resultText}>
              id\{item.id}{"\n"}
              {item.name}{"\n"}
              {item.description || 'No Description'}{"\n"}
              suspend\{item.suspend}
              </CustomText>
              <TouchableOpacity
                style={styles.suspendButton}
                onPress={() => handleSuspend(item.id)}
              >
                <Text style={styles.suspendButtonText}>Suspend</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  userContainer: {
    // Your styles for user container
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
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
    marginTop: 0,
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
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    width: '100%',
    flex: 1, 
  },
  noResultsImage: {
    width: 100, 
    height: 100, 
    resizeMode: 'contain',
    marginTop: 170,
    opacity: 0.5, 
  },
  resultContainer: {
    padding: 10,
    marginRight: 190,
    marginBottom: 20,
    alignItems: 'flex-start', // Aligns child (text) to the left
    width: '100%', // Ensures full-width container
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'left', // Makes sure the text itself is left-aligned
    width: '100%', // Ensures text takes full width inside the container
  },
  resultsContent: {
    paddingBottom: 20,  // give a bit of bottom padding so last item isn't cut off
  },
  suspendButton: {
    fontFamily: 'Minecraft Regular',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    top: 20,
    left: 120, 
  },
  suspendButtonText: { color: '#fff',
     fontSize: 14,
     fontFamily: 'Minecraft Regular',
     },
});

