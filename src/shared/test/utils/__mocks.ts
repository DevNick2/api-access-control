import { faker } from '@faker-js/faker/.';
import { Users, UserType } from 'src/entities/user.entity';

export function generateRandomUser(): Users {
  return {
    id: faker.number.int(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    type: UserType.DIVER,
    verified: true,
    code: faker.string.uuid(),
    created_at: undefined,
    updated_at: undefined,
    hasId: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    reload: jest.fn(),
  };
}
