import { useEffect, useCallback } from 'react';
import useItemStore from '../store/itemStore';
import useAuthStore from '../store/authStore';
import {
  subscribeToItems, addItem as addToFirestore,
  deleteItem as deleteFromFirestore, resolveItem as resolveInFirestore,
  getUserItems, getItemById, getStats,
} from '../firebase/firestore';
import { uploadImageToCloudinary } from '../firebase/storage';
import { getCategoryEmoji } from '../utils/categoryEmoji';

const useItems = () => {
  const { items, loading, error, activeFilter, searchQuery, setItems, setLoading, setError, setFilter, setSearchQuery, getFilteredItems } = useItemStore();
  const { user, userProfile } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToItems(activeFilter, (newItems) => {
      setItems(newItems);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeFilter]);

  const addItem = async (formData, imageUri) => {
    if (!user) return { success: false, error: 'Giriş yapmalısınız' };
    setLoading(true);

    let imageUrl = '';
    if (imageUri) {
      const uploadResult = await uploadImageToCloudinary(imageUri);
      if (!uploadResult.success) {
        setLoading(false);
        return { success: false, error: uploadResult.error || 'Fotoğraf yüklenemedi' };
      }
      imageUrl = uploadResult.url;
    }

    const result = await addToFirestore({
      ...formData,
      imageUrl,
      imageEmoji: formData.imageEmoji || getCategoryEmoji(formData.category),
      ownerId: user.uid,
      ownerName: userProfile?.name || user.displayName || 'Kullanıcı',
      ownerDepartment: userProfile?.department || '',
      ownerStudentId: userProfile?.studentId || '',
    });

    setLoading(false);
    return result;
  };

  const deleteItem = async (id) => {
    setLoading(true);
    const result = await deleteFromFirestore(id);
    setLoading(false);
    return result;
  };

  const resolveItem = async (id) => resolveInFirestore(id);
  const fetchMyItems = useCallback(async () => user ? getUserItems(user.uid) : { success: false, data: [] }, [user]);
  const fetchItemById = useCallback(async (id) => getItemById(id), []);
  const fetchStats = useCallback(async () => getStats(), []);

  return {
    items,
    filteredItems: getFilteredItems(),
    loading, error, activeFilter, searchQuery,
    setFilter, setSearchQuery,
    addItem, deleteItem, resolveItem,
    fetchMyItems, fetchItemById, fetchStats,
  };
};

export default useItems;
