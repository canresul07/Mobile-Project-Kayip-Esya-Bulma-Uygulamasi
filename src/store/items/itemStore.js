import { create } from 'zustand';

/**
 * Item store for managing item state and filtering in JS.
 */
export const useItemStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,
  activeFilter: 'ALL',
  searchQuery: '',
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilter: (activeFilter) => set({ activeFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  getFilteredItems: () => {
    const { items = [], activeFilter, searchQuery } = get();
    return items.filter((item) => {
      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'LOST' && item.type === 'LOST') ||
        (activeFilter === 'FOUND' && item.type === 'FOUND');
      
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      
      return matchesFilter && matchesSearch;
    });
  },
}));
