import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useItems } from '../hooks/useItems';
import { colors } from '@/shared/theme/colors';
import { CATEGORIES } from '../constants';
import { Input } from '@/shared/components/Input';

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
    } else {
      Alert.alert('Hata', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>İlan Oluştur</Text>
          <Text style={styles.subtitle}>Eşya detaylarını girerek başkalarına yardımcı ol</Text>
        </View>

        <View style={styles.card}>
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
                <Ionicons name="camera" size={40} color={colors.primary} />
                <Text style={styles.photoPlaceholderText}>Fotoğraf eklemek için tıkla</Text>
                <Text style={styles.photoPlaceholderSub}>PNG, JPG (max 5MB)</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.stepLabel}>3. Eşya Bilgileri</Text>
          
          <TouchableOpacity
            style={[styles.picker, !!errors.category && styles.pickerError]}
            onPress={() => setCategoryModal(true)}
          >
            <Ionicons name="grid-outline" size={20} color={colors.textHint} />
            <Text style={[styles.pickerText, !category && { color: colors.textHint }]}>
              {category || 'Kategori Seç'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textHint} />
          </TouchableOpacity>
          {errors.category && <Text style={styles.errorLabel}>{errors.category}</Text>}

          <Input
            placeholder="Eşya Adı"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            icon="pricetag-outline"
          />

          <Input
            placeholder="Açıklama (renk, marka, özellik...)"
            value={description}
            onChangeText={setDescription}
            error={errors.description}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            textAlignVertical="top"
          />

          <Text style={styles.stepLabel}>4. Konum ve Tarih</Text>
          <Input
            placeholder="Konum (örn: A Blok, Kafeterya)"
            value={location}
            onChangeText={setLocation}
            error={errors.location}
            icon="location-outline"
          />

          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.textHint} />
            <Text style={styles.pickerText}>
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

          <TouchableOpacity 
            style={[styles.submitBtn, loading && styles.disabledBtn]} 
            onPress={handleSubmit} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>🚀 İlanı Yayınla</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={categoryModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCategoryModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kategori Seç</Text>
              <TouchableOpacity onPress={() => setCategoryModal(false)}>
                <Ionicons name="close" size={24} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => { setCategory(item); setCategoryModal(false); }}
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
  container: { flex: 1, backgroundColor: colors.primary },
  content: { paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingVertical: 20 },
  backBtn: { marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    flex: 1,
  },
  stepLabel: { fontSize: 15, fontWeight: 'bold', color: colors.onSurface, marginBottom: 12, marginTop: 20 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 60, borderRadius: 16, borderWidth: 1.5, borderColor: colors.divider,
    backgroundColor: colors.background, gap: 8,
  },
  typeLostActive: { backgroundColor: colors.lostBg, borderColor: colors.lostColor },
  typeFoundActive: { backgroundColor: colors.foundBg, borderColor: colors.foundColor },
  typeEmoji: { fontSize: 20 },
  typeText: { fontSize: 14, fontWeight: 'bold', color: colors.textSecondary },
  photoArea: {
    height: 160, borderRadius: 16, overflow: 'hidden',
    backgroundColor: colors.surfaceVariant,
    borderWidth: 2, borderColor: colors.divider,
    borderStyle: 'dashed',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  photoPlaceholderText: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
  photoPlaceholderSub: { fontSize: 12, color: colors.textHint },
  removePhoto: { position: 'absolute', top: 12, right: 12 },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.divider,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
  },
  pickerError: { borderColor: colors.lostColor },
  pickerText: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.onSurface },
  errorLabel: { color: colors.lostColor, fontSize: 12, marginTop: -12, marginBottom: 16, marginLeft: 4 },
  textArea: { minHeight: 120 },
  submitBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 20,
    shadowColor: colors.secondary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  disabledBtn: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '70%',
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.onSurface },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalItemText: { fontSize: 16, color: colors.onSurface },
  modalItemActive: { color: colors.primary, fontWeight: 'bold' },
});

export default AddItemScreen;
