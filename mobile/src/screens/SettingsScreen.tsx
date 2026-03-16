import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

export default function SettingsScreen({ navigation }: any) {
  const { language, theme, setLanguage, setTheme, t } = useSettings();

  const isDark = theme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    },
    header: {
      backgroundColor: isDark ? '#0f172a' : '#1e3a8a',
      padding: 20,
      paddingTop: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    section: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#333',
      marginBottom: 15,
    },
    optionContainer: {
      backgroundColor: isDark ? '#2d2d2d' : 'white',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
    },
    optionLabel: {
      fontSize: 16,
      color: isDark ? '#ccc' : '#666',
      marginBottom: 10,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 10,
    },
    optionButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: isDark ? '#444' : '#ddd',
      alignItems: 'center',
    },
    optionButtonActive: {
      backgroundColor: '#1e3a8a',
      borderColor: '#1e3a8a',
    },
    optionButtonText: {
      fontSize: 14,
      color: isDark ? '#ccc' : '#666',
      fontWeight: '600',
    },
    optionButtonTextActive: {
      color: 'white',
    },
    description: {
      fontSize: 14,
      color: isDark ? '#888' : '#999',
      marginTop: 10,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('settings')}</Text>
      </View>

      <ScrollView style={styles.section}>
        {/* Language Selection */}
        <View style={styles.optionContainer}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <Text style={styles.optionLabel}>{t('selectLanguage')}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                language === 'en' && styles.optionButtonActive,
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  language === 'en' && styles.optionButtonTextActive,
                ]}
              >
                {t('english')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                language === 'hi' && styles.optionButtonActive,
              ]}
              onPress={() => setLanguage('hi')}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  language === 'hi' && styles.optionButtonTextActive,
                ]}
              >
                {t('hindi')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>
            {language === 'en'
              ? 'Change the app language to Hindi or English'
              : 'ऐप की भाषा हिंदी या अंग्रेजी में बदलें'}
          </Text>
        </View>

        {/* Theme Selection */}
        <View style={styles.optionContainer}>
          <Text style={styles.sectionTitle}>{t('theme')}</Text>
          <Text style={styles.optionLabel}>{t('selectTheme')}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                theme === 'light' && styles.optionButtonActive,
              ]}
              onPress={() => setTheme('light')}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  theme === 'light' && styles.optionButtonTextActive,
                ]}
              >
                ☀️ {t('lightTheme')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                theme === 'dark' && styles.optionButtonActive,
              ]}
              onPress={() => setTheme('dark')}
            >
              <Text
                style={[
                  styles.optionButtonText,
                  theme === 'dark' && styles.optionButtonTextActive,
                ]}
              >
                🌙 {t('darkTheme')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>
            {language === 'en'
              ? 'Switch between light and dark theme'
              : 'लाइट और डार्क थीम के बीच स्विच करें'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
