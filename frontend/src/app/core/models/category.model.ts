export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
}
