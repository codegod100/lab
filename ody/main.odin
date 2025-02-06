package main

import "core:fmt"
import "core:math/big"

factorial :: proc(n: int) -> big.Int {
	if n == 0 {
		return big.NewInt(1)
	}
	result := big.NewInt(n)
	temp := factorial(n - 1)
	big.Mul(result, result, temp)
	return result
}

main :: proc() {
	number := 50
	result := factorial(number)
	fmt.Printf("Factorial of %d is %v\n", number, result)
}