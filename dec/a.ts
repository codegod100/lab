function bar<T extends new (...args: any[]) => any>(targetClass: T) {
  return class extends targetClass {
    foo() {
      console.log("foo");
    }
  } as T & { new (...args: any[]): { foo(): void } };
}

@bar
class A {}
interface A {
  foo(): void;
}
const a = new A();
a.foo();
