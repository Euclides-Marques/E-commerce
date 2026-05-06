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
  children: CategoryDto[];
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  imageUrl?: string;
  iconUrl?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateCategoryDto extends CreateCategoryDto {
  id: string;
}
