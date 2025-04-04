// generated by porffor 0.55.25
#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>

typedef uint8_t u8;
typedef uint16_t u16;
typedef int32_t i32;
typedef uint32_t u32;
typedef int64_t i64;
typedef uint64_t u64;
typedef float f32;
typedef double f64;

const f64 NaN = 0e+0/0e+0;
const f64 Infinity = 1e+0/0e+0;

struct ReturnValue {
  f64 value;
  i32 type;
};

char* _memory; u32 _memoryPages = 1;

struct ReturnValue isPrime(f64 number, i32 numberjjtype);
f64 f64_ll(f64 l0, f64 l1);
struct ReturnValue __Porffor_numberLog(f64 arg, i32 argjjtype);

f64 counter = 0;
i32 counterjjtype = 0;

f64 f64_ll(f64 l0, f64 l1) {
  f64 _get3;
  f64 _get2;
  f64 _get1;
  f64 _get0;
  _get0 = l0;
  _get1 = l0;
  _get2 = l1;
  _get3 = l1;
  return (_get0 - ((i32)(_get1 / _get2) * _get3));
}

struct ReturnValue isPrime(f64 number, i32 numberjjtype) {
  f64 _get5;
  f64 _get4;
  f64 _get3;
  f64 _get2;
  f64 _get1;
  f64 _get0;
  f64 i = 0;
  i32 ijjtype = 0;

  _get0 = number;
  // if 
    if (_get0 < 2) {
      return (struct ReturnValue){ 0, 2 };
    }
  // end
  j2:;
  i = 2;
  ijjtype = 1;
  // loop 
  j3:;
    _get1 = i;
    _get2 = number;
    // if 
      if (_get1 < _get2) {
        _get3 = number;
        _get4 = i;
        // if 
          if (f64_ll(_get3, _get4) == 0) {
            return (struct ReturnValue){ 0, 2 };
          }
        // end
        j5:;
        _get5 = i;
        i = _get5 + 1;
        goto j3;
      }
    // end
    j4:;
  // end
  return (struct ReturnValue){ 1, 2 };
}

struct ReturnValue __Porffor_numberLog(f64 arg, i32 argjjtype) {
  f64 _get0;
  _get0 = arg;
  printf("%g", _get0);
  putchar((int)(10));
  return (struct ReturnValue){ 0, 128 };
}

int main() {
  f64 _get1;
  i32 _get0;
  _memory = malloc(_memoryPages * 65536);


  i32 jjlast_type = 0;
  f64 jjlogicinner_tmp = 0;
  i32 jjtypeswitch_tmp1 = 0;

  counter = 0;
  counterjjtype = 1;
  // loop 
  j0:;
    // if 
      if (counter <= 10000) {
        const struct ReturnValue _0 = isPrime(counter, 1);
        jjlast_type = _0.type;
        jjlogicinner_tmp = _0.value;
        _get0 = jjlast_type;
        jjtypeswitch_tmp1 = _get0;
        _get1 = jjlogicinner_tmp;
        const f64 _tmp0 = _get1;
        // if 
          if ((_tmp0 < 0 ? -_tmp0 : _tmp0) > 0) {
            const struct ReturnValue _1 = __Porffor_numberLog(counter, 1);
            jjlast_type = _1.type;
          }
        // end
        j6:;
        counter = counter + 1;
        goto j0;
      }
    // end
    j1:;
  // end

  return 0;
}