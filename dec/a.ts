// biome-ignore lint/suspicious/noExplicitAny: Any is required for mixins.
function bar<T extends new (...args: any[]) => any>(target: T) {
	return class extends target {
		foo(str: string) {
			return `hello ${str}`;
		}
	};
}

@bar
class A {}

const a = new A() as A & { foo(str: string): string };
const str = a.foo("world");
console.dir(str);
