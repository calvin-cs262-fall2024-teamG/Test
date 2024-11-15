import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import styles from '../style/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FavoritesScreen({ navigation, route }) {
  const [favorites, setFavorites] = React.useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    loadFavorites();
  }, [isFocused, route.params?.favoritesUpdated]); // Reload when screen is focused or favorites are updated

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const removeFromFavorites = async (propertyId) => {
    try {
      const updatedFavorites = favorites.filter(prop => prop.id !== propertyId);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
      
      // Update the favorites status in case PropertyDetails screen is open
      if (navigation.getParent()) {
        navigation.getParent().setParams({ favoritesUpdated: Date.now() });
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  return (
    <View style={styles.propertiesContainer}>
      <StatusBar backgroundColor="#8C2131" barStyle="light-content" />
      <View style={styles.titleBanner}>
        <Text style={styles.propertiesTitle}>Favorites</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {favorites.length === 0 ? (
          <Text style={[styles.propertyItem, { textAlign: 'center', marginTop: 20 }]}>
            No favorites yet
          </Text>
        ) : (
          favorites.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.propertyList}
              onPress={() => navigation.navigate('PropertyDetails', { 
                item: item,
                favoritesUpdated: Date.now() 
              })}
            >
              <View>
                <Text style={styles.propertyItem}>{item.address}</Text>
                <Text style={styles.propertyItem}>${item.estimated_cost}/month</Text>
                <TouchableOpacity 
                  style={styles.editFavoritesButton}
                  onPress={() => removeFromFavorites(item.id)}
                >
                  <Text style={styles.editFavoritesButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
