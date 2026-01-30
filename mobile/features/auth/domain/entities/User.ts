// interface que define o usuário
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  birthDate?: string;
  profilePicture?: any;
}
