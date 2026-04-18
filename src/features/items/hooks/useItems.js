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
    categoryFilter,
    dateInterval,
    visibleItemsCount,
    setItems,
    setLoading,
    setError,
    setFilter,
    setSearchQuery,
    setCategoryFilter,
    setDateInterval,
    loadMore,
    getFilteredItems,
    getPaginatedItems,
  } = useItemStore();
  const { user, userProfile } = useAuthStore();

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

    try {
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
        ownerName: userProfile?.name || user.displayName || 'İsimsiz Kullanıcı',
        ownerPhoto: userProfile?.profilePicture || user.photoURL || '',
        ownerDepartment: userProfile?.department || '',
      });

      setLoading(false);
      return result;
    } catch (error) {
      console.error('[useItems] addItem error:', error);
      setLoading(false);
      return { success: false, error: 'İlan oluşturulurken bir hata oluştu.' };
    }
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
    paginatedItems: getPaginatedItems(),
    loading,
    error,
    activeFilter,
    searchQuery,
    categoryFilter,
    dateInterval,
    visibleItemsCount,
    setFilter,
    setSearchQuery,
    setCategoryFilter,
    setDateInterval,
    loadMore,
    addItem,
    deleteItem,
    resolveItem,
    fetchMyItems,
    fetchItemById,
    fetchStats,
  };
};
