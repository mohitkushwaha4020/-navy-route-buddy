import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../lib/supabase';

export default function LoginScreen({ navigation }: any) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'driver' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t } = useSettings();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (role === 'student') {
        // Student login - check approved_students table by email
        const { data: student } = await supabase
          .from('approved_students')
          .select('*')
          .eq('email', identifier)
          .eq('is_approved', true)
          .single();

        if (!student) {
          Alert.alert('Login Failed', 'Email not found or not approved. Contact admin.');
          setLoading(false);
          return;
        }

        if (student.password !== password) {
          Alert.alert('Login Failed', 'Invalid Email or Password');
          setLoading(false);
          return;
        }

        // Student validated - just use signIn (don't create new account)
        // The password from approved_students table should match Supabase auth password
        try {
          await signIn(identifier, password);
        } catch (authError: any) {
          Alert.alert('Login Failed', 'Invalid email or password. Please check your credentials.');
          setLoading(false);
          return;
        }
      } else if (role === 'driver') {
        // Driver login - check buses table for driver credentials
        const { data: bus } = await supabase
          .from('buses')
          .select('*')
          .eq('driver_email', identifier)
          .single();

        if (!bus) {
          Alert.alert('Login Failed', 'Driver email not found. Contact admin.');
          setLoading(false);
          return;
        }

        if (bus.driver_password !== password) {
          Alert.alert('Login Failed', 'Invalid Email or Password');
          setLoading(false);
          return;
        }

        // Driver validated - create/login with temporary account
        // Try to sign in first, if fails then sign up
        try {
          await signIn(identifier, password);
        } catch (authError: any) {
          // If sign in fails, try to sign up
          try {
            await signUp(identifier, password, 'driver');
          } catch (signUpError: any) {
            Alert.alert('Login Failed', 'Unable to login. Please contact admin.');
            setLoading(false);
            return;
          }
        }
      } else {
        // Admin login - regular email login
        await signIn(identifier, password);
      }
      // Navigation handled by auth state change
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Gradient Effect */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🚌</Text>
          </View>
          <Text style={styles.title}>Navy Route Buddy</Text>
          <Text style={styles.subtitle}>{t('trackBusRealtime')}</Text>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
        <Text style={styles.cardTitle}>{t('welcomeBackLogin')}</Text>
        <Text style={styles.cardSubtitle}>{t('selectRoleLogin')}</Text>

        {/* Role Selector */}
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'student' && styles.roleButtonActive]}
            onPress={() => {
              setRole('student');
              setIdentifier('');
              setPassword('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.roleIcon}>🎓</Text>
            <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>
              {t('student')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'driver' && styles.roleButtonActive]}
            onPress={() => {
              setRole('driver');
              setIdentifier('');
              setPassword('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.roleIcon}>🚗</Text>
            <Text style={[styles.roleText, role === 'driver' && styles.roleTextActive]}>
              {t('driver')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, role === 'admin' && styles.roleButtonActive]}
            onPress={() => {
              setRole('admin');
              setIdentifier('');
              setPassword('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.roleIcon}>👨‍💼</Text>
            <Text style={[styles.roleText, role === 'admin' && styles.roleTextActive]}>
              {t('admin')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>📧</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enterEmail')}
            placeholderTextColor="#94a3b8"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enterPassword')}
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>

        {/* Helper Text */}
        {role === 'student' && (
          <View style={styles.helperContainer}>
            <Text style={styles.helperIcon}>ℹ️</Text>
            <Text style={styles.helperText}>
              {t('useCredentials')}
            </Text>
          </View>
        )}

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {loading ? `⏳ ${t('loggingIn')}` : `🚀 ${t('login')}`}
          </Text>
        </TouchableOpacity>
      </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {t('secureReliable')}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerSection: {
    backgroundColor: '#1e3a8a',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#dbeafe',
  },
  loginCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: -20,
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 25,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  roleButtonActive: {
    borderColor: '#1e3a8a',
    backgroundColor: '#1e3a8a',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  roleIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  roleText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  roleTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  eyeButton: {
    padding: 10,
  },
  eyeIcon: {
    fontSize: 22,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  helperIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  helperText: {
    fontSize: 13,
    color: '#1e40af',
    flex: 1,
  },
  button: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 20,
  },
});
