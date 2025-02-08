/// <reference types="@extism/js-pdk" />

/** @extism-main */
export const greet = (): void => {
  Host.outputString(`Hello, ${Host.inputString()}`);
};
