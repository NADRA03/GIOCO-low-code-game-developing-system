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
import { useNavigate } from 'react-router-native';
import API_ENDPOINTS from './api';
import { Image } from 'expo-image';

export default function ManageReports() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showUnseen, setShowUnseen] = useState(false); // To filter "Unseen" reports
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const endpoint = API_ENDPOINTS.adminSearch;
      let response;

      if (!searchQuery) {
        // No query means fetch all
        response = await axios.get(endpoint, { withCredentials: true });
        setSearchResults(response.data.reports || []);
      } else {
        response = await axios.get(endpoint, { params: { report: searchQuery } });
        setSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
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
    handleSearch(); // Load all reports initially
  }, []);

  const handleMarkAsSeen = async (id) => {
    try {
      const res = await axios.post(
        API_ENDPOINTS.adminSuspend,
        { type: 'report', id },
        { withCredentials: true }
      );
      Alert.alert(res.data.message);
      // Remove seen report from list
      setSearchResults(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to mark report as seen');
    }
  };

  // Filter reports to show only unseen ones if `showUnseen` is true
  const filteredResults = showUnseen
    ? searchResults.filter(item => !item.seen)
    : searchResults;

  return (
    <View style={styles.container}>
      {/* Filter Button for Unseen Reports */}
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={() => setShowUnseen(!showUnseen)}
      >
        <Text style={styles.filterText}>
          {showUnseen ? 'Show All' : 'Show Unseen'}
        </Text>
      </TouchableOpacity>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by problem"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="white"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Image source={require('./assets/search.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      {/* Results */}
      {filteredResults.length === 0 ? (
        <Image source={require('./assets/treasure.gif')} style={styles.noResultsImage} />
      ) : (
        <ScrollView
          style={styles.resultsList}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {filteredResults.map(item => (
            <View key={item.id.toString()} style={styles.resultContainer}>
              <Text style={styles.resultText}>
              {item.id}{"\n"}
  {item.problem}{"\n"}
  {item.answer || 'No Answer'}{"\n"}
  {item.seen ? 'Seen' : 'Unseen'}
              </Text>
              {!item.seen && (
                <TouchableOpacity
                  style={styles.seenButton}
                  onPress={() => handleMarkAsSeen(item.id)}
                >
                  <Text style={styles.seenButtonText}>Mark as Seen</Text>
                </TouchableOpacity>
              )}
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
  filterButton: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  filterText: {
    color: '#CE55F2',
    fontFamily: 'Minecraft Regular',
    fontSize: 16,
  },
  searchInput: {
    fontFamily: "Minecraft Regular",
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
    fontFamily: 'Minecraft Regular',
    textAlign: 'left', // Makes sure the text itself is left-aligned
    width: '100%', // Ensures text takes full width inside the container
  },
  resultsContent: {
    paddingBottom: 20,  // give a bit of bottom padding so last item isn't cut off
  },
  seenButton: {
    fontFamily: 'Minecraft Regular',
    backgroundColor: 'rgba(0, 255, 0, 0.7)', // Green for seen
    paddingVertical: 6,
    paddingHorizontal: 12,
    left: 100, 
    top: 20,
  },
  seenButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Minecraft Regular',
  },
});
