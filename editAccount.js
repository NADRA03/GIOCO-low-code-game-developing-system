import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigate } from 'react-router-native';

export default function EditAccount() {
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSaveEmail = () => {
    if (!email) {
      alert('Please enter a valid email.');
      return;
    }
    alert('Email updated successfully!');
    setEditingEmail(false);
  };

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert('New passwords do not match.');
      return;
    }

    alert('Password updated successfully!');
    setEditingPassword(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
         <TouchableOpacity style={styles.backButton} onPress={() => navigate(-1)}>
                 <Text style={styles.backButtonText}>&lt;</Text>
        </TouchableOpacity>
        <View style={styles.sections}>
        {/* Edit Email Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          {editingEmail ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter new email"
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEmail}>
                <Text style={styles.saveButtonText}>Submit</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setEditingEmail(true)}>
              <Text style={styles.editButtonText}>Edit Email</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Edit Password Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Password</Text>
          {editingPassword ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#777"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#777"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#777"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSavePassword}>
                <Text style={styles.saveButtonText}>Submit</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.editButton} onPress={() => setEditingPassword(true)}>
              <Text style={styles.editButtonText}>Edit Password</Text>
            </TouchableOpacity>
          )}
        </View>
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
    sections: {
        marginTop: 120,
    },
    backButton: {
        left: 20,
        top: 50,
        width: 110,
        height: 110,
        position: 'absolute',
      },
      backButtonText: {
            color: '#ffffff',
            fontSize: 35,
            fontFamily: 'Minecraft Regular',
      },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  section: {
    marginBottom: 30,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Minecraft Regular',
    marginBottom: 17,
  },
  input: {
    width: '100%',
    padding: 12,
    backgroundColor: '#222',
    color: '#FFF',
    marginBottom: 15,
    fontFamily: 'Minecraft Regular',
  },
  editButton: {
    backgroundColor: '#6441a5',
    padding: 12,
    alignItems: 'center',

  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Minecraft Regular',
  },
  saveButton: {
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#CE55F2',
    fontSize: 16,
    fontFamily: 'Minecraft Regular',
  },
});

