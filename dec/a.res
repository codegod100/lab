module type Base = {
  type t
}

module AddFoo = (Base: Base) => {
  include Base

  let foo = (instance: t, str: string) => {
    "hello " ++ str
  }
}

type a = {}

module A = {
  type t = a
}

module AWithFoo = AddFoo(A)

let a_instance: A.t = {} // Instance of the base type

let str = AWithFoo.foo(a_instance, "world")

Js.log(str)
