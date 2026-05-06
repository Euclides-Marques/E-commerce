export interface AddressDto {
  id: string;
  label: string;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  label: string;
  recipient: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
}
