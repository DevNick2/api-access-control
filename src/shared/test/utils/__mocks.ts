import { faker } from '@faker-js/faker';
import { User, UserProfile } from 'src/entities/user.entity';

export function generateRandomUser(): User {
  return {
    id: faker.number.int(),
    code: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    profile: UserProfile.USER,
    active_roles: [],
    created_at: undefined,
    updated_at: undefined,
    hasId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
    is_temporary_password: false,
    last_login_at: undefined,
  };
}
