import { create } from 'zustand';

export const useItemStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,
  activeFilter: 'ALL',
  searchQuery: '',
  categoryFilter: '',
  dateInterval: 'ALL', // 'ALL' | '3_DAYS' | '1_WEEK'
  visibleItemsCount: 5,
  
  setItems: (items) => set({ items }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilter: (activeFilter) => set({ activeFilter, visibleItemsCount: 5 }),
  setSearchQuery: (searchQuery) => set({ searchQuery, visibleItemsCount: 5 }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter, visibleItemsCount: 5 }),
  setDateInterval: (dateInterval) => set({ dateInterval, visibleItemsCount: 5 }),
  
  loadMore: () => set((state) => ({ visibleItemsCount: state.visibleItemsCount + 5 })),
  
  getFilteredItems: () => {
    const { 
      items = [], 
      activeFilter, 
      searchQuery, 
      categoryFilter, 
      dateInterval 
    } = get();
    
    let filtered = items.filter((item) => {
      // Type/Status Filter
      const matchesFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'LOST' && item.type === 'LOST' && item.status !== 'RESOLVED') ||
        (activeFilter === 'FOUND' && item.type === 'FOUND' && item.status !== 'RESOLVED') ||
        (activeFilter === 'RESOLVED' && (item.status === 'RESOLVED' || item.isResolved));
      
      // Search Filter
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      
      // Category Filter
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      
      // Date Interval Filter
      let matchesDate = true;
      if (dateInterval !== 'ALL') {
        const itemDate = item.timestamp?.toDate ? item.timestamp.toDate() : 
                         (item.timestamp?.seconds ? new Date(item.timestamp.seconds * 1000) : new Date(item.timestamp));
        const now = new Date();
        const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
        
        if (dateInterval === '3_DAYS') matchesDate = diffDays <= 3;
        if (dateInterval === '1_WEEK') matchesDate = diffDays <= 7;
      }
      
      return matchesFilter && matchesSearch && matchesCategory && matchesDate;
    });

    return filtered;
  },
  
  getPaginatedItems: () => {
    const filtered = get().getFilteredItems();
    return filtered.slice(0, get().visibleItemsCount);
  }
}));
