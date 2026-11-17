import { User, type UserRecord } from '../models/User';

type CreateUserInput = Pick<UserRecord, 'email' | 'passwordHash' | 'firstName' | 'lastName'> &
  Partial<Pick<UserRecord, 'role' | 'status'>>;

export const userRepository = {
  findByEmail(email: string) {
    return User.findOne({ email: email.trim().toLowerCase() }).exec();
  },

  findById(id: string) {
    return User.findById(id).exec();
  },

  create(input: CreateUserInput) {
    return User.create(input);
  },
};
