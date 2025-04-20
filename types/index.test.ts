import { describe, it, expect } from 'vitest';
import { optionFunctor, resultFunctor, type Option, type Result, type DeepPartial, type Promisify, type FunctionsOf, type User } from './index';

// --- Option Functor Tests ---
describe('Option Functor', () => {
  const some: Option<number> = { tag: 'some', value: 10 };
  const none: Option<number> = { tag: 'none' };

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
  const ok: Result<number, string> = { tag: 'ok', value: 100 };
  const err: Result<number, string> = { tag: 'err', error: 'fail' };

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
    const user: DeepPartial<User> = { name: 'Partial', getProfile: async () => 'profile' };
    expect(user).toEqual({ name: 'Partial', getProfile: expect.any(Function) });
  });
});

// --- Promisify Test ---
describe('Promisify', () => {
  it('has promise-valued properties', async () => {
    const promisedUser: Promisify<User> = {
      id: Promise.resolve(1),
      name: Promise.resolve('Bob'),
      getProfile: Promise.resolve(async () => 'profile')
    };
    expect(await promisedUser.id).toBe(1);
    expect(await promisedUser.name).toBe('Bob');
    const getProfileFn = await promisedUser.getProfile;
    expect(await getProfileFn()).toBe('profile');
  });
});

// --- FunctionsOf Test ---
describe('FunctionsOf', () => {
  it('extracts only function properties', () => {
    const userFunctions: FunctionsOf<User> = {
      getProfile: async () => 'profile',
    };
    expect(Object.keys(userFunctions)).toEqual(['getProfile']);
  });
});
