import { createClient } from 'contentful';

const SPACE_ID = process.env.REACT_APP_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN;
const CONTENT_TYPE = 'galleryItem';

interface ContentfulItem {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    image: {
      fields: {
        file: {
          url: string;
        };
      };
    };
    category: string;
    description?: string;
  };
}

interface ProcessedItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  description?: string;
}

class ContentfulService {
  private static instance: ContentfulService;
  private client: any;
  private cachedData: ProcessedItem[] | null = null;
  private loadingPromise: Promise<ProcessedItem[]> | null = null;

  private constructor() {
    if (!SPACE_ID || !ACCESS_TOKEN) {
      throw new Error('Contentful environment variables are not set');
    }

    this.client = createClient({
      space: SPACE_ID,
      accessToken: ACCESS_TOKEN,
    });
  }

  public static getInstance(): ContentfulService {
    if (!ContentfulService.instance) {
      ContentfulService.instance = new ContentfulService();
    }
    return ContentfulService.instance;
  }

  public async getItems(): Promise<ProcessedItem[]> {
    // Return cached data if available
    if (this.cachedData) {
      return this.cachedData;
    }

    // Return existing promise if already loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    // Create new loading promise
    this.loadingPromise = this.fetchItems();
    
    try {
      this.cachedData = await this.loadingPromise;
      return this.cachedData;
    } finally {
      this.loadingPromise = null;
    }
  }

  private async fetchItems(): Promise<ProcessedItem[]> {
    if (process.env.NODE_ENV === 'development') {
      console.log('ContentfulService: Fetching items from Contentful...');
    }

    try {
      const response = await this.client.getEntries({
        content_type: CONTENT_TYPE,
        limit: 100
      });

      const items: ProcessedItem[] = response.items.map((item: ContentfulItem) => ({
        id: item.sys.id,
        title: item.fields.title,
        imageUrl: item.fields.image.fields.file.url.startsWith('http')
          ? item.fields.image.fields.file.url
          : `https:${item.fields.image.fields.file.url}`,
        category: item.fields.category,
        description: item.fields.description
      }));

      // Sort items alphabetically by title
      items.sort((a, b) => a.title.localeCompare(b.title));

      if (process.env.NODE_ENV === 'development') {
        console.log('ContentfulService: Successfully fetched', items.length, 'items');
      }

      return items;
    } catch (error) {
      console.error('ContentfulService: Error fetching items:', error);
      throw error;
    }
  }

  public getCategories(items: ProcessedItem[]): string[] {
    return Array.from(new Set(items.map(item => item.category))).sort();
  }

  public createRoundRobinOrder(items: ProcessedItem[], maxItems = Infinity): ProcessedItem[] {
    const categories = this.getCategories(items);
    
    // Group items by category
    const itemsByCategory = new Map<string, ProcessedItem[]>();
    items.forEach(item => {
      if (!itemsByCategory.has(item.category)) {
        itemsByCategory.set(item.category, []);
      }
      itemsByCategory.get(item.category)!.push(item);
    });

    // Find the maximum number of items in any category
    let maxItemsPerCategory = 0;
    categories.forEach(category => {
      const categoryItems = itemsByCategory.get(category);
      if (categoryItems) {
        maxItemsPerCategory = Math.max(maxItemsPerCategory, categoryItems.length);
      }
    });

    // Create round-robin order
    const roundRobinItems: ProcessedItem[] = [];
    for (let round = 0; round < maxItemsPerCategory && roundRobinItems.length < maxItems; round++) {
      categories.forEach(category => {
        if (roundRobinItems.length >= maxItems) return;
        
        const categoryItems = itemsByCategory.get(category);
        if (categoryItems && categoryItems[round]) {
          roundRobinItems.push(categoryItems[round]);
        }
      });
    }

    return roundRobinItems;
  }

  public clearCache(): void {
    this.cachedData = null;
    this.loadingPromise = null;
  }
}

export default ContentfulService;
export type { ProcessedItem, ContentfulItem }; 