import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Image,
  SafeAreaView, Platform, Modal, FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import useItems from '../hooks/useItems';
import { colors } from '../theme/colors';
import { CATEGORIES } from '../utils/categoryEmoji';

const AddItemScreen = () => {
  const navigation = useNavigation();
  const { addItem, loading } = useItems();

  const [type, setType] = useState('LOST');
  const [imageUri, setImageUri] = useState(null);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri izni gerekli.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const validate = () => {
    const e = {};
    if (!category) e.category = 'Kategori seçin';
    if (title.trim().length < 3) e.title = 'Eşya adı girin (min 3 karakter)';
    if (description.trim().length < 10) e.description = 'Açıklama girin (min 10 karakter)';
    if (!location.trim()) e.location = 'Konum girin';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const result = await addItem(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        type,
        location: location.trim(),
        date: date.toISOString().split('T')[0],
      },
      imageUri
    );

    if (result.success) {
      Alert.alert('Başarılı! 🎉', 'İlanın yayınlandı.', [
        { text: 'Tamam', onPress: () => navigation.navigate('HomeTab') },
      ]);
      // Formu temizle
      setTitle(''); setDescription(''); setLocation('');
      setCategory(''); setImageUri(null); setType('LOST');
    } else {
      Alert.alert('Hata', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>İlan Oluştur</Text>
          <Text style={styles.headerSubtitle}>Kaybettiğin veya bulduğun eşyayı paylaş</Text>
        </View>

        <View style={styles.card}>
          {/* 1. Tip Seçimi */}
          <Text style={styles.stepLabel}>1. İlan Türü</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'LOST' && styles.typeLostActive]}
              onPress={() => setType('LOST')}
            >
              <Text style={styles.typeEmoji}>😢</Text>
              <Text style={[styles.typeText, type === 'LOST' && { color: colors.lostColor }]}>Kaybettim</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'FOUND' && styles.typeFoundActive]}
              onPress={() => setType('FOUND')}
            >
              <Text style={styles.typeEmoji}>🎉</Text>
              <Text style={[styles.typeText, type === 'FOUND' && { color: colors.foundColor }]}>Buldum</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Fotoğraf */}
          <Text style={styles.stepLabel}>2. Fotoğraf Ekle</Text>
          <TouchableOpacity style={styles.photoArea} onPress={pickImage}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.removePhoto} onPress={() => setImageUri(null)}>
                  <Ionicons name="close-circle" size={28} color={colors.lostColor} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={{ fontSize: 40 }}>📷</Text>
                <Text style={styles.photoPlaceholderText}>Fotoğraf eklemek için tıkla</Text>
                <Text style={styles.photoPlaceholderSub}>PNG, JPG (max 5MB)</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* 3. Eşya Bilgileri */}
          <Text style={styles.stepLabel}>3. Eşya Bilgileri</Text>

          {/* Kategori */}
          <TouchableOpacity
            style={[styles.input, styles.dropdownInput, errors.category && styles.inputError]}
            onPress={() => setCategoryModal(true)}
          >
            <Ionicons name="grid-outline" size={18} color={colors.textHint} />
            <Text style={[styles.dropdownText, !category && { color: colors.textHint }]}>
              {category || 'Kategori Seç'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textHint} />
          </TouchableOpacity>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          {/* Başlık */}
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Eşya Adı"
            placeholderTextColor={colors.textHint}
            value={title}
            onChangeText={(t) => { setTitle(t); setErrors((e) => ({ ...e, title: '' })); }}
            maxLength={50}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          {/* Açıklama */}
          <TextInput
            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
            placeholder="Açıklama (renk, marka, özellik...)"
            placeholderTextColor={colors.textHint}
            value={description}
            onChangeText={(t) => { setDescription(t); setErrors((e) => ({ ...e, description: '' })); }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

          {/* 4. Konum */}
          <Text style={styles.stepLabel}>4. Konum Bilgisi</Text>
          <View style={[styles.input, styles.rowInput, errors.location && styles.inputError]}>
            <Ionicons name="location-outline" size={18} color={colors.textHint} />
            <TextInput
              style={{ flex: 1, marginLeft: 8, color: colors.onSurface }}
              placeholder="Konum (örn: A Blok, Kafeterya)"
              placeholderTextColor={colors.textHint}
              value={location}
              onChangeText={(t) => { setLocation(t); setErrors((e) => ({ ...e, location: '' })); }}
            />
          </View>
          {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

          {/* Tarih */}
          <TouchableOpacity
            style={[styles.input, styles.rowInput]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.textHint} />
            <Text style={{ flex: 1, marginLeft: 8, color: colors.onSurface }}>
              {date.toLocaleDateString('tr-TR')}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textHint} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>🚀 İlanı Yayınla</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={categoryModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCategoryModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kategori Seç</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => { setCategory(item); setCategoryModal(false); setErrors((e) => ({ ...e, category: '' })); }}
                >
                  <Text style={[styles.modalItemText, category === item && styles.modalItemActive]}>{item}</Text>
                  {category === item && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 48,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  stepLabel: { fontSize: 15, fontWeight: 'bold', color: colors.onSurface, marginBottom: 12, marginTop: 20 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 60, borderRadius: 12, borderWidth: 1.5, borderColor: colors.divider,
    backgroundColor: colors.background, gap: 8,
  },
  typeLostActive: { backgroundColor: colors.lostBg, borderColor: colors.lostColor },
  typeFoundActive: { backgroundColor: colors.foundBg, borderColor: colors.foundColor },
  typeEmoji: { fontSize: 20 },
  typeText: { fontSize: 14, fontWeight: 'bold', color: colors.textSecondary },
  photoArea: {
    height: 160, borderRadius: 12, overflow: 'hidden',
    backgroundColor: colors.surfaceVariant,
    borderWidth: 2, borderColor: colors.divider,
    borderStyle: 'dashed',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoPlaceholderText: { fontSize: 13, fontWeight: 'bold', color: colors.primary },
  photoPlaceholderSub: { fontSize: 11, color: colors.textHint },
  removePhoto: { position: 'absolute', top: 8, right: 8 },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.divider,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.onSurface,
    marginBottom: 8,
  },
  inputError: { borderColor: colors.lostColor },
  textArea: { minHeight: 100, paddingTop: 14 },
  rowInput: { flexDirection: 'row', alignItems: 'center' },
  dropdownInput: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dropdownText: { flex: 1, fontSize: 15, color: colors.onSurface },
  errorText: { color: colors.lostColor, fontSize: 12, marginBottom: 8, marginLeft: 4 },
  submitBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.onSurface, marginBottom: 16 },
  modalItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  modalItemText: { fontSize: 15, color: colors.onSurface },
  modalItemActive: { color: colors.primary, fontWeight: 'bold' },
});

export default AddItemScreen;
