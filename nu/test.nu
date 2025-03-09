use std/log
use std/input

export def imp [] {
  let foo = "bar"
  mut in_str = ""
  let input = $in
  if ($input != null) {
    $in_str = $" from ($input)"
  }
  {
    input: $input
    foo: $foo
  }
}
