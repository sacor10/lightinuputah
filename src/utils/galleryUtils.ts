import { ProcessedItem } from '../services/contentfulService';

interface GalleryItemFields {
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
}

export type GalleryItem = {
  fields: GalleryItemFields;
  sys: {
    id: string;
  };
};

export const convertToGalleryItem = (item: ProcessedItem): GalleryItem => ({
  sys: { id: item.id },
  fields: {
    title: item.title,
    image: {
      fields: {
        file: {
          url: item.imageUrl
        }
      }
    },
    category: item.category,
    description: item.description
  }
});

export const convertToGalleryItems = (items: ProcessedItem[]): GalleryItem[] => {
  return items.map(convertToGalleryItem);
}; 