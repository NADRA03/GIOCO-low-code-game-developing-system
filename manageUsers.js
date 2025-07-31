import React, { useState } from 'react';
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

export default function ManageUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery) {
      Alert.alert('Please enter a username');
      return;
    }
    try {
      const response = await axios.get(API_ENDPOINTS.adminSearch, {
        params: { username: searchQuery },
      });
      setSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      if (error.response?.status === 404) {
        setSearchResults([]);
      } else {
        console.error(error);
        Alert.alert('An error occurred. Check console for details.');
      }
    }
  };

  const handleSuspend = async (id) => {
    try {
      const res = await axios.post(
        API_ENDPOINTS.adminSuspend,
        { type: 'user', id },
        { withCredentials: true }
      );
      Alert.alert(res.data.message);
      setSearchResults(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to suspend user');
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username"
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
                {item.username}{"\n"}
                {item.email || 'No Email'}{"\n"}
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
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    fontFamily: 'Minecraft Regular',
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
  resultsList: {
    width: '100%',
    flex: 1, 
  },
  resultsContent: {
    paddingBottom: 20,
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
    marginRight: 100,
    marginBottom: 20,
    alignItems: 'flex-start',
    width: '100%',
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'left',
    width: '100%',
  },
  suspendButton: {
    fontFamily: 'Minecraft Regular',
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    top: 20,
    left: 130, 
  },
  suspendButtonText: { 
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Minecraft Regular',
  },
});
