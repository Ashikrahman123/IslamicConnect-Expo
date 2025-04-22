import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlert } from '../../context/AlertContext';
import axios from 'axios';
import { API_URL } from '../../constants/api';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { showError, showSuccess } = useAlert();

  const handleResetPassword = async () => {
    if (!email) {
      showError('Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // API call would go here in a real implementation
      // await axios.post(`${API_URL}/api/reset-password`, { email });
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Password reset instructions sent to your email!');
      setResetSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
      showError('Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#00ACC1" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reset Password</Text>
            <View style={styles.placeholder} />
          </View>

          {!resetSent ? (
            <View style={styles.formContainer}>
              <Image 
                source={require('../../assets/forgot-password.png')} 
                style={styles.image}
                resizeMode="contain"
              />
              
              <Text style={styles.description}>
                Enter your email address below and we'll send you instructions to reset your password.
              </Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#00ACC1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#A0AEC0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#43A047" />
              
              <Text style={styles.successTitle}>Check Your Email</Text>
              
              <Text style={styles.successMessage}>
                We've sent password reset instructions to {email}
              </Text>
              
              <TouchableOpacity
                style={styles.returnButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.returnButtonText}>Return to Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 120,
    marginBottom: 20,
  },
  description: {
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    color: '#2C3E50',
  },
  resetButton: {
    backgroundColor: '#00ACC1',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginVertical: 20,
  },
  successMessage: {
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 30,
    lineHeight: 22,
  },
  returnButton: {
    backgroundColor: '#00ACC1',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;