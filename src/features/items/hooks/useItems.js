import { useEffect, useCallback } from 'react';
import { useItemStore } from '@/store/items/itemStore';
import { useAuthStore } from '@/store/auth/authStore';
import * as itemsService from '../services/itemsService';
import { uploadImageToCloudinary } from '@/core/storage';

export const useItems = () => {
  const {
    items,
    loading,
    error,
    activeFilter,
    searchQuery,
    setItems,
    setLoading,
    setError,
    setFilter,
    setSearchQuery,
    getFilteredItems,
  } = useItemStore();
  const { user } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = itemsService.subscribeToItems(activeFilter, (result) => {
      if (result.success) {
        setItems(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [activeFilter, setItems, setLoading]);

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
      imageUrl = uploadResult.url || '';
    }

    const result = await itemsService.addItem({
      ...formData,
      imageUrl,
      ownerId: user.uid,
    });

    setLoading(false);
    return result;
  };

  const deleteItem = async (id) => {
    setLoading(true);
    const result = await itemsService.deleteItem(id);
    setLoading(false);
    return result;
  };

  const resolveItem = (id) => itemsService.resolveItem(id);
  const fetchMyItems = useCallback(async () => (user ? itemsService.getUserItems(user.uid) : { success: false, data: [] }), [user]);
  const fetchItemById = useCallback((id) => itemsService.getItemById(id), []);
  const fetchStats = useCallback(() => itemsService.getStats(), []);

  return {
    items,
    filteredItems: getFilteredItems(),
    loading,
    error,
    activeFilter,
    searchQuery,
    setFilter,
    setSearchQuery,
    addItem,
    deleteItem,
    resolveItem,
    fetchMyItems,
    fetchItemById,
    fetchStats,
  };
};
