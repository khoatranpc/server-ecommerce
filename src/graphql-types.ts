export interface UserRegisterInput {
  name: string;
  email: string;
  password: string;
  dob: number;
  phoneNumber: string;
  address: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface GetCurrentUserInput {
  access_token: string;
}
