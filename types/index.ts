// Highly advanced TypeScript types with generics, mapped types, conditional types, and higher-kinded type emulation

// --- Higher-Kinded Type emulation in TypeScript (via type lambdas) ---
// HKT is a type-level encoding of a generic type constructor (like Option, Result, etc.)
// It's a way to represent a type that can be parameterized with another type.
type HKT<URI, A> = {
  readonly _URI: URI;
  readonly _A: A;
};

// --- Type-level function for mapping over an HKT ---
// URI2HKT is a type-level dictionary mapping type names to their generic instantiations
// It's used to look up the concrete type of an HKT given its URI and type argument.
interface URI2HKT<A> {
  Option: Option<A>;
  Result: Result<A, unknown>;
}

// Kind extracts the concrete type from URI2HKT given a URI and type argument
// E.g., Kind<'Option', number> = Option<number>
// It's a way to get the actual type of an HKT given its URI and type argument.
type Kind<URI extends keyof URI2HKT<unknown>, A> = URI2HKT<A>[URI];

// --- Option type ---
// Option represents an optional value: either Some<T> or None
// It's a way to represent a value that may or may not be present.
type Option<T> = Some<T> | None;
type Some<T> = { tag: 'some'; value: T };
type None = { tag: 'none' };

// --- Result type ---
// Result represents a value that is either Ok<T> (success) or Err<E> (failure)
// It's a way to represent a value that may have failed to compute.
type Result<T, E> = Ok<T> | Err<E>;
type Ok<T> = { tag: 'ok'; value: T };
type Err<E> = { tag: 'err'; error: E };

// --- Functor type class ---
// Functor is a type class for types that can be mapped over (like Option, Result)
// It's a way to represent a type that can be transformed using a function.
type Functor<F extends keyof URI2HKT<unknown>> = {
  map: <A, B>(fa: Kind<F, A>, f: (a: A) => B) => Kind<F, B>;
};

// --- Option Functor instance ---
// Implements Functor for Option, allowing you to map a function over an Option
const optionFunctor: Functor<'Option'> = {
  map: (fa, f) =>
    fa.tag === 'some' ? { tag: 'some', value: f(fa.value) } : fa
};

// --- Result Functor instance ---
// Implements Functor for Result, allowing you to map a function over an Ok value
const resultFunctor: Functor<'Result'> = {
  map: (fa, f) =>
    fa.tag === 'ok' ? { tag: 'ok', value: f(fa.value) } : fa
};

// --- Highly generic DeepPartial type ---
// Recursively makes all properties of an object type optional
// It's a way to represent a partial object with optional properties.
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// --- Mapped type to transform all properties to promises ---
// Promisify transforms all fields of T into Promises
// It's a way to represent an object with promise-valued properties.
type Promisify<T> = {
  [K in keyof T]: Promise<T[K]>;
};

// --- Advanced conditional type: Extract all function property names ---
// FunctionPropertyNames extracts keys whose values are functions
// It's a way to get the names of the function properties of an object type.
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never
}[keyof T];

// FunctionsOf picks only the function properties from a type
// E.g., FunctionsOf<User> will only have getProfile
// It's a way to get the function properties of an object type.
type FunctionsOf<T> = Pick<T, FunctionPropertyNames<T>>;

// --- Example usage types and values ---
interface User {
  id: number;
  name: string;
  getProfile(): Promise<string>;
}

type UserFunctions = FunctionsOf<User>; // { getProfile(): Promise<string> }

// Example of using optionFunctor
const someValue: Option<number> = { tag: 'some', value: 42 };
const noneValue: Option<number> = { tag: 'none' };

const mappedSome = optionFunctor.map(someValue, (x: number) => x * 2); // { tag: 'some', value: 84 }
const mappedNone = optionFunctor.map(noneValue, (x: number) => x * 2); // { tag: 'none' }

// Example of DeepPartial
const partialUser: DeepPartial<User> = { name: 'Alice' };

// Example of Promisify
const promisedUser: Promisify<User> = {
  id: Promise.resolve(1),
  name: Promise.resolve('Bob'),
  getProfile: Promise.resolve(async () => 'profile')
};

// --- Uncovered code for coverage demonstration ---
/**
 * This function is intentionally left uncovered by tests.
 * It throws if called, and is here to demonstrate coverage reporting.
 */
export function unreachableCodeDemo(): never {
  throw new Error('This code should not be covered by tests.');
}

/**
 * A function that is not exported and never used.
 * It is also not covered by tests.
 * For coverage, we expose it via a __private__ export for testing only.
 */
function privateUnusedFunction(): string {
  return 'I am never called!';
}

// Expose privateUnusedFunction for test coverage only
export const __private__ = { privateUnusedFunction };

// --- Exporting all types, interfaces, and instances for testing purposes ---
export type { HKT, Option, Some, None, Result, Ok, Err, Functor, DeepPartial, Promisify, FunctionsOf, User };
export { optionFunctor, resultFunctor };
