import { useState, useEffect } from 'react';

import ContentfulService, { ProcessedItem } from '../services/contentfulService';

interface UseContentfulDataReturn {
  items: ProcessedItem[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useContentfulData = (): UseContentfulDataReturn => {
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const service = ContentfulService.getInstance();
      const fetchedItems = await service.getItems();
      const fetchedCategories = service.getCategories(fetchedItems);
      
      setItems(fetchedItems);
      setCategories(fetchedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('useContentfulData: Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    const service = ContentfulService.getInstance();
    service.clearCache();
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    items,
    categories,
    loading,
    error,
    refresh
  };
}; 