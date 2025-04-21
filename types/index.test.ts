import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  optionFunctor, 
  resultFunctor, 
  type Option, 
  type Result, 
  type DeepPartial, 
  type Promisify, 
  type FunctionsOf, 
  type User,
  unreachableCodeDemo
} from './index';

// --- Mock User and Functions ---
const mockUser: User = {
  id: 123,
  name: 'Mocky',
  getProfile: vi.fn().mockResolvedValue('mocked profile'),
};

const mockGetProfile = vi.fn(async () => 'mocked profile');

// --- Option Functor Tests ---
describe('Option Functor', () => {
  let some: Option<number>;
  let none: Option<number>;

  beforeEach(() => {
    some = { tag: 'some', value: 10 };
    none = { tag: 'none' };
  });

  it('maps Some correctly', () => {
    const mappedSome = optionFunctor.map(some, (x: number) => x + 5);
    expect(mappedSome).toEqual({ tag: 'some', value: 15 });
  });

  it('maps None correctly', () => {
    const mappedNone = optionFunctor.map(none, (x: number) => x + 5);
    expect(mappedNone).toEqual({ tag: 'none' });
  });

  it('fails when expecting wrong value for Some', () => {
    const mappedSome = optionFunctor.map(some, (x: number) => x + 5);
    expect(() => expect(mappedSome).toEqual({ tag: 'some', value: 999 })).toThrowError();
  });

  it('fails when expecting wrong tag for None', () => {
    const mappedNone = optionFunctor.map(none, (x: number) => x + 5);
    expect(() => expect(mappedNone).toEqual({ tag: 'some', value: 0 })).toThrowError();
  });
});

// --- Result Functor Tests ---
describe('Result Functor', () => {
  let ok: Result<number, string>;
  let err: Result<number, string>;

  beforeEach(() => {
    ok = { tag: 'ok', value: 100 };
    err = { tag: 'err', error: 'fail' };
  });

  it('maps Ok correctly', () => {
    const mappedOk = resultFunctor.map(ok, (x: number) => x * 2);
    expect(mappedOk).toEqual({ tag: 'ok', value: 200 });
  });

  it('maps Err correctly', () => {
    const mappedErr = resultFunctor.map(err, (x: number) => x * 2);
    expect(mappedErr).toEqual({ tag: 'err', error: 'fail' });
  });

  it('fails when expecting wrong value for Ok', () => {
    const mappedOk = resultFunctor.map(ok, (x: number) => x * 2);
    expect(() => expect(mappedOk).toEqual({ tag: 'ok', value: 999 })).toThrowError();
  });

  it('fails when expecting wrong tag for Err', () => {
    const mappedErr = resultFunctor.map(err, (x: number) => x * 2);
    expect(() => expect(mappedErr).toEqual({ tag: 'ok', value: 0 })).toThrowError();
  });
});

// --- DeepPartial Test ---
describe('DeepPartial', () => {
  it('allows partial objects', () => {
    const user: DeepPartial<User> = { name: 'Partial', getProfile: mockGetProfile };
    expect(user).toEqual({ name: 'Partial', getProfile: mockGetProfile });
  });
});

// --- Promisify Test ---
describe('Promisify', () => {
  it('has promise-valued properties', async () => {
    const promisedUser: Promisify<User> = {
      id: Promise.resolve(1),
      name: Promise.resolve('Bob'),
      getProfile: Promise.resolve(mockGetProfile)
    };
    expect(await promisedUser.id).toBe(1);
    expect(await promisedUser.name).toBe('Bob');
    const getProfileFn = await promisedUser.getProfile;
    expect(await getProfileFn()).toBe('mocked profile');
  });
});

// --- FunctionsOf Test ---
describe('FunctionsOf', () => {
  it('extracts only function properties', () => {
    const userFunctions: FunctionsOf<User> = {
      getProfile: mockGetProfile,
    };
    expect(Object.keys(userFunctions)).toEqual(['getProfile']);
    // Call the mock to verify it's a mock
    userFunctions.getProfile();
    expect(mockGetProfile).toHaveBeenCalled();
  });
});

describe('unreachableCodeDemo', () => {
  it('throws an error when called', () => {
    expect(() => {
      unreachableCodeDemo();
    }).toThrowError('This code should not be covered by tests.');
  });
});

describe('privateUnusedFunction', () => {
  it('returns the expected string', async () => {
    const mod = await import('./index');
    expect(mod.__private__.privateUnusedFunction()).toBe('I am never called!');
  });
});
