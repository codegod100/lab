export memory memory(initial: 17, max: 0);

global stack_pointer:int = 1048576;

table T_a:funcref(min: 6, max: 6);

data rodata(offset: 1048576) =
  "attempt to unwrap error: {s}\00start index {d} is larger than end inde"
  "x {d}\00index out of bounds: index {d}, len {d}\00{ ... }\00OutOfMemor"
  "y\00integer overflow\00Overflow\00TruncatedInput\00incorrect alignment"
  "\00NoSpaceLeft\00format\00integer cast truncated bits\00@memcpy argume"
  "nts have non-equal lengths\00@memcpy arguments alias\00attempt to cast"
  " negative value to unsigned integer\00division by zero\00Utf8ExpectedC"
  "ontinuation\00cast causes pointer to be null\00Utf8OverlongEncoding\00"
  "Utf8EncodesSurrogateHalf\00Utf8CannotEncodeSurrogateHalf\00shift amoun"
  "t is greater than the type size\00switch on corrupt value\00Utf8Invali"
  "dStartByte\00Utf8CodepointTooLarge\00reached unreachable code\00000102"
  "0304050607080910111213141516171819202122232425262728293031323334353637"
  "3839404142434445464748495051525354555657585960616263646566676869707172"
  "737475767778798081828384858687888990919293949596979899\00InvalidUtf8\00"
  "(msg truncated)\00Hello, {s}!\00\00\00\00\00\00\00\00\00\00\00\00\00\00"
  "\00\00\00\00\03\00\00\00\04\00\00\00\05\00\00\00\00\00\00\00\84\03\10\00"
  "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"
  "\b0\05\10\00\00\00\00\00\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00"
  "\00\00\00\00\02\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"
  "\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"
  "s\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00 \00\00\00\02"
  "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\03\00\00\00\00"
  "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\ff"
  "\ff\ff\ff\00\00\00\00\00\00\00\00\01\00\00\00\00\00\00\00\00\00\00\00d"
  "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00 \00\00\00\02"
  "\00\00\00\00\00\00\00\00\00\00\00\03\00\00\00\00\00\00\00\00\00\00\00\00"
  "\00\00\00\00\00\00\00 \00\00\00\02\00\00\00\00\00\00\00\00\00\00\00\03"
  "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"
  "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"
  "\00\00\00 \00\00\00\02\00\00\00\00\00\00\00\00\00\00\00\03\00\00\00\00"
  "\00\01\00\00\00\02\00\00\00\03\00\00\00\04\00\09\00\00\00\00\00\00\00\0a"
  "\00\00\00\ef\bf\bd\00\00\00\00\00\00\00\00\00\00\00\00\00\03\00\00\00\00"
  "\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00"
  "\00\01\00\00\00\02\00\00\00\03\00\00\00\04\00\0c\00\00\00\00\00\00\00\00"
  "\00\00\00\0b\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\05\00\00\00\00"
  "\00\00\00\00\00\00\00\00\00\00\00\06\00\00\00\00\00\00\00\07\00\00\00\00"
  "\00\00\00\05\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00\06\00\00\00\00"
  "\00\00\00\08\00\00\00\00\00\00\00\05\00\00\00\00\00\00\00\00\00\00\00\00"
  "\00\00\00\06\00\00\00\00\00\00\00\00\00\00\00z\00\10\00\0b\00\00\00\97"
  "\00\10\00\08\00\00\00\c3\00\10\00\0b\00\00\00K\03\10\00\0b\00\00\00w\01"
  "\10\00\18\00\00\00\af\01\10\00\14\00\00\00\c4\01\10\00\18\00\00\00S\02"
  "\10\00\15\00\00\00>\02\10\00\14\00\00\00\a0\00\10\00\0e\00\00\00\dd\01"
  "\10\00\1d\00\00\00W\02\10\00\11\00\00\00";

import function input_length_extism_host_env():long;

import function input_load_u8_extism_host_env(a:long):int;

import function input_load_u64_extism_host_env(a:long):long;

import function alloc_extism_host_env(a:long):long;

import function output_set_extism_host_env(a:long, b:long);

import function store_u8_extism_host_env(a:long, b:int);

import function store_u64_extism_host_env(a:long, b:long);

function main_Plugin_getInput(a:long_ptr@4, b:int, c:long_ptr@4) {
  var gb:long;
  var ub:int;
  var vb:int;
  var wb:int;
  var d:int = stack_pointer;
  var e:int = 112;
  var f:int = d - e;
  stack_pointer = f;
  var g:long = input_length_extism_host_env();
  f[0]:long = g;
  var h:long = c[0];
  f[2]:long = h;
  var i:int = 16;
  var j:int = f + i;
  var k:int = j;
  var l:long = 4294967295L;
  var m:long = g;
  var n:long = l;
  var o:int = m <= n;
  var p:int = 1;
  var q:int = o & p;
  if (eqz(q)) goto B_b;
  goto B_a;
  label B_b:
  var r:int = 1048790;
  var s:int = 27;
  var t:int = 0;
  var u:int = 1049460;
  builtin_default_panic(r, s, t, u);
  unreachable;
  label B_a:
  var v:int = i32_wrap_i64(g);
  var w:int = 28;
  var x:int = f + w;
  var y:int = x;
  mem_Allocator_alloc_anon_1318(y, b, k, v);
  var z:int = f[18]:ushort;
  var aa:int = 0;
  var ba:int = 65535;
  var ca:int = z & ba;
  var da:int = 65535;
  var ea:int = aa & da;
  var fa:int = ca != ea;
  var ga:int = 1;
  var ha:int = fa & ga;
  if (eqz(ha)) goto B_c;
  var ia:int = f[18]:ushort;
  f[24]:short = ia;
  builtin_returnError(b);
  var ja:long = f[10]:long@4;
  a[0] = ja;
  var ka:int = 8;
  var la:int_ptr = a + ka;
  var ma:int = 40;
  var na:int = f + ma;
  var oa:int_ptr = na + ka;
  var pa:int = oa[0];
  la[0] = pa;
  var qa:int = 112;
  var ra:int = f + qa;
  stack_pointer = ra;
  return ;
  label B_c:
  var sa:int = f[7]:int;
  var ta:int = f[8]:int;
  f[3]:int = ta;
  f[2]:int = sa;
  var ua:int = 0;
  f[13]:int = ua;
  loop L_e {
    var va:int = f[13]:int;
    var wa:int = va;
    var xa:long = i64_extend_i32_u(wa);
    var ya:long = xa;
    var za:long = g;
    var ab:int = ya < za;
    var bb:int = 1;
    var cb:int = ab & bb;
    if (eqz(cb)) goto B_h;
    var db:int = f[13]:int;
    var eb:int = db;
    var fb:long = i64_extend_i32_u(eb);
    gb = g - fb;
    var hb:int = gb > g;
    var ib:int = 1;
    var jb:int = hb & ib;
    if (jb) goto B_g;
    goto B_f;
    label B_h:
    goto B_d;
    label B_g:
    var kb:int = 1048710;
    var lb:int = 16;
    var mb:int = 0;
    var nb:int = 1049468;
    builtin_default_panic(kb, lb, mb, nb);
    unreachable;
    label B_f:
    var ob:long = 8L;
    var pb:long = gb;
    var qb:long = ob;
    var rb:int = pb < qb;
    var sb:int = 1;
    var tb:int = rb & sb;
    if (eqz(tb)) goto B_n;
    ub = f[13]:int;
    vb = f[3]:int;
    wb = f[2]:int;
    var xb:int = ub;
    var yb:int = vb;
    var zb:int = xb < yb;
    var ac:int = 1;
    var bc:int = zb & ac;
    if (bc) goto B_m;
    goto B_l;
    label B_n:
    goto B_j;
    label B_m:
    goto B_k;
    label B_l:
    builtin_panicOutOfBounds(ub, vb);
    unreachable;
    label B_k:
    var cc:byte_ptr = wb + ub;
    var dc:int = f[13]:int;
    var ec:int = dc;
    var fc:long = i64_extend_i32_u(ec);
    var gc:int = input_load_u8_extism_host_env(fc);
    cc[0] = gc;
    var hc:int = f[13]:int;
    var ic:int = 1;
    var jc:int = hc + ic;
    var kc:int = eqz(jc);
    var lc:int = 1;
    var mc:int = kc & lc;
    if (eqz(mc)) goto B_o;
    var nc:int = 1048710;
    var oc:int = 16;
    var pc:int = 0;
    var qc:int = 1049468;
    builtin_default_panic(nc, oc, pc, qc);
    unreachable;
    label B_o:
    f[13]:int = jc;
    goto B_i;
    label B_j:
    var rc:long = f[13]:uint;
    var sc:long = input_load_u64_extism_host_env(rc);
    f[7]:long = sc;
    var tc:int = f[13]:int;
    var uc:int = f[3]:int;
    var vc:int = f[2]:int;
    var wc:long_ptr@1 = vc + tc;
    var xc:int = 8;
    var yc:int = tc + xc;
    var zc:int = yc;
    var ad:int = uc;
    var bd:int = zc <= ad;
    var cd:int = 1;
    var dd:int = bd & cd;
    if (eqz(dd)) goto B_q;
    goto B_p;
    label B_q:
    builtin_panicOutOfBounds(yc, uc);
    unreachable;
    label B_p:
    f[17]:int = wc;
    f[9]:long = sc;
    var ed:int = 1;
    var fd:int = 1;
    var gd:int = ed & fd;
    f[87]:byte = gd;
    f[11]:long = sc;
    var hd:long = f[11]:long;
    wc[0] = hd;
    var id:int = f[13]:int;
    var jd:int = 8;
    var kd:int = id + jd;
    var ld:int = kd < id;
    var md:int = 1;
    var nd:int = ld & md;
    if (eqz(nd)) goto B_r;
    var od:int = 1048710;
    var pd:int = 16;
    var qd:int = 0;
    var rd:int = 1049468;
    builtin_default_panic(od, pd, qd, rd);
    unreachable;
    label B_r:
    f[13]:int = kd;
    label B_i:
    continue L_e;
  }
  label B_d:
  var sd:int = f[2]:int;
  var td:int = f[3]:int;
  var ud:int = 0;
  f[54]:short = ud;
  f[26]:int = td;
  f[25]:int = sd;
  var vd:long = f[25]:long@4;
  a[0] = vd;
  var wd:int = 8;
  var xd:int_ptr = a + wd;
  var yd:int = 100;
  var zd:int = f + yd;
  var ae:int_ptr = zd + wd;
  var be:int = ae[0];
  xd[0] = be;
  var ce:int = 112;
  var de:int = f + ce;
  stack_pointer = de;
}

function builtin_default_panic(a:int, b:int, c:int, d:int) {
  var e:int = stack_pointer;
  var f:int = 16;
  var g:int_ptr = e - f;
  stack_pointer = g;
  g[2] = b;
  g[1] = a;
  g[3] = c;
  loop L_a {
    unreachable;
    continue L_a;
  }
}

function mem_Allocator_alloc_anon_1318(a:long_ptr@4, b:int, c:long_ptr@4, d:int) {
  var fa:int;
  var e:int = stack_pointer;
  var f:int = 80;
  var g:int = e - f;
  stack_pointer = g;
  g[1]:int = d;
  var h:long = c[0];
  g[1]:long = h;
  var i:long = g[2]:long@4;
  g[2]:long = i;
  g[6]:int = d;
  var j:int = 0;
  g[7]:int = j;
  var k:long = g[4]:long@4;
  g[4]:long = k;
  var l:int = 40;
  var m:int = g + l;
  var n:int = m;
  var o:int = 32;
  var p:int = g + o;
  var q:int = p;
  var r:int = 0;
  mem_Allocator_allocWithSizeAndAlignment_anon_1542(n, b, q, d, r);
  var s:int = g[22]:ushort;
  var t:int = 0;
  var u:int = 65535;
  var v:int = s & u;
  var w:int = 65535;
  var x:int = t & w;
  var y:int = v != x;
  var z:int = 1;
  var aa:int = y & z;
  if (eqz(aa)) goto B_b;
  var ba:int = g[22]:ushort;
  g[28]:short = ba;
  var ca:int = 48;
  var da:int = g + ca;
  var ea:int = da;
  fa = ea;
  goto B_a;
  label B_b:
  var ga:int = g[10]:int;
  g[15]:int = ga;
  g[16]:int = ga;
  var ha:int = g[15]:int;
  var ia:int = 0;
  var ja:int = ia;
  var ka:int = d;
  var la:int = ja <= ka;
  var ma:int = 1;
  var na:int = la & ma;
  if (eqz(na)) goto B_d;
  goto B_c;
  label B_d:
  var oa:int = 0;
  builtin_panicStartGreaterThanEnd(oa, d);
  unreachable;
  label B_c:
  var pa:int = 0;
  var qa:int = pa;
  var ra:int = d;
  var sa:int = qa <= ra;
  var ta:int = 1;
  var ua:int = sa & ta;
  if (eqz(ua)) goto B_f;
  goto B_e;
  label B_f:
  var va:int = 0;
  builtin_panicOutOfBounds(va, d);
  unreachable;
  label B_e:
  var wa:int = 0;
  g[38]:short = wa;
  g[18]:int = d;
  g[17]:int = ha;
  var xa:int = 68;
  var ya:int = g + xa;
  var za:int = ya;
  fa = za;
  label B_a:
  var ab:int = fa;
  var bb:int = ab[4]:ushort;
  var cb:int = 0;
  var db:int = 65535;
  var eb:int = bb & db;
  var fb:int = 65535;
  var gb:int = cb & fb;
  var hb:int = eb == gb;
  var ib:int = 1;
  var jb:int = hb & ib;
  if (eqz(jb)) goto B_g;
  var kb:long = ab[0]:long@4;
  a[0] = kb;
  var lb:int = 8;
  var mb:int_ptr = a + lb;
  var nb:int_ptr = ab + lb;
  var ob:int = nb[0];
  mb[0] = ob;
  var pb:int = 80;
  var qb:int = g + pb;
  stack_pointer = qb;
  return ;
  label B_g:
  builtin_returnError(b);
  var rb:long = ab[0]:long@4;
  a[0] = rb;
  var sb:int = 8;
  var tb:int_ptr = a + sb;
  var ub:int_ptr = ab + sb;
  var vb:int = ub[0];
  tb[0] = vb;
  var wb:int = 80;
  var xb:int = g + wb;
  stack_pointer = xb;
}

function builtin_returnError(a:{ a:int, b:int }) {
  var p:int;
  var s:int;
  var t:int;
  var b:int = stack_pointer;
  var c:int = 32;
  var d:int_ptr = b - c;
  stack_pointer = d;
  d[3] = a;
  d[4] = a;
  var e:int = 0;
  d[5] = e;
  var f:int = a.a;
  var g:int = 8;
  var h:int_ptr = a + g;
  var i:int = h[0];
  a.b;
  var j:int = f;
  var k:int = i;
  var l:int = j < k;
  var m:int = 1;
  var n:int = l & m;
  if (eqz(n)) goto B_e;
  d[6] = a;
  var o:int_ptr = d[6];
  p = a.a;
  var q:int = 8;
  var r:int_ptr = o + q;
  s = r[0];
  t = o[1];
  var u:int = p;
  var v:int = s;
  var w:int = u < v;
  var x:int = 1;
  var y:int = w & x;
  if (y) goto B_d;
  goto B_c;
  label B_e:
  goto B_a;
  label B_d:
  goto B_b;
  label B_c:
  builtin_panicOutOfBounds(p, s);
  unreachable;
  label B_b:
  var z:int = 2;
  var aa:int = p << z;
  var ba:int_ptr = t + aa;
  var ca:int = 0;
  ba[0] = ca;
  label B_a:
  d[7] = a;
  var da:int_ptr = d[7];
  var ea:int = da[0];
  var fa:int = 1;
  var ga:int = ea + fa;
  var ha:int = eqz(ga);
  var ia:int = 1;
  var ja:int = ha & ia;
  if (eqz(ja)) goto B_f;
  var ka:int = 1048710;
  var la:int = 16;
  var ma:int = 0;
  var na:int = 1049468;
  builtin_default_panic(ka, la, ma, na);
  unreachable;
  label B_f:
  da[0] = ga;
  var oa:int = 32;
  var pa:int = d + oa;
  stack_pointer = pa;
}

function builtin_panicOutOfBounds(a:int, b:int) {
  var c:int = stack_pointer;
  var d:int = 32;
  var e:int = c - d;
  stack_pointer = e;
  e[2]:int = a;
  e[3]:int = b;
  var f:int = 0;
  e[4]:int = f;
  var g:int = 1;
  e[20]:byte = g;
  e[6]:int = a;
  e[7]:int = b;
  var h:int = 0;
  var i:int = 16;
  var j:int = e + i;
  var k:int = j;
  var l:int = 24;
  var m:int = e + l;
  var n:int = m;
  debug_panicExtra_anon_1543(h, k, n);
  unreachable;
}

function mem_Allocator_allocWithSizeAndAlignment_anon_1542(a:long_ptr@4, b:int, c:long_ptr@4, d:int, e:int) {
  var w:int;
  var f:int = stack_pointer;
  var g:int = 48;
  var h:int = f - g;
  stack_pointer = h;
  h[3]:int = d;
  h[4]:int = e;
  var i:int = 20;
  var j:int = h + i;
  var k:int = j;
  var l:int = 1;
  math_mul_anon_1565(k, b, l, d);
  var m:int = h[12]:ushort;
  var n:int = 0;
  var o:int = 65535;
  var p:int = m & o;
  var q:int = 65535;
  var r:int = n & q;
  var s:int = p == r;
  var t:int = 1;
  var u:int = s & t;
  if (eqz(u)) goto B_b;
  var v:int = h[5]:int;
  w = v;
  goto B_a;
  label B_b:
  builtin_returnError(b);
  var x:long_ptr@4 = 0;
  var y:long = x[262392];
  a[0] = y;
  var z:int = 48;
  var aa:int = h + z;
  stack_pointer = aa;
  return ;
  label B_a:
  var ba:int = w;
  h[7]:int = ba;
  var ca:long = c[0];
  h[4]:long = ca;
  var da:int = 40;
  var ea:int = h + da;
  var fa:int = ea;
  var ga:int = 32;
  var ha:int = h + ga;
  var ia:int = ha;
  mem_Allocator_allocBytesWithAlignment_anon_1566(fa, b, ia, ba, e);
  var ja:int = h[22]:ushort;
  var ka:int = 0;
  var la:int = 65535;
  var ma:int = ja & la;
  var na:int = 65535;
  var oa:int = ka & na;
  var pa:int = ma == oa;
  var qa:int = 1;
  var ra:int = pa & qa;
  if (eqz(ra)) goto B_c;
  var sa:long = h[10]:long@4;
  a[0] = sa;
  var ta:int = 48;
  var ua:int = h + ta;
  stack_pointer = ua;
  return ;
  label B_c:
  builtin_returnError(b);
  var va:long = h[10]:long@4;
  a[0] = va;
  var wa:int = 48;
  var xa:int = h + wa;
  stack_pointer = xa;
}

function builtin_panicStartGreaterThanEnd(a:int, b:int) {
  var c:int = stack_pointer;
  var d:int = 32;
  var e:int = c - d;
  stack_pointer = e;
  e[2]:int = a;
  e[3]:int = b;
  var f:int = 0;
  e[4]:int = f;
  var g:int = 1;
  e[20]:byte = g;
  e[6]:int = a;
  e[7]:int = b;
  var h:int = 0;
  var i:int = 16;
  var j:int = e + i;
  var k:int = j;
  var l:int = 24;
  var m:int = e + l;
  var n:int = m;
  debug_panicExtra_anon_1567(h, k, n);
  unreachable;
}

function debug_panicExtra_anon_1543(a:int, b:int, c:int) {
  var ya:int;
  var xa:int;
  var d:int = stack_pointer;
  var e:int = 4288;
  var f:int = d - e;
  stack_pointer = f;
  f[0]:int = a;
  var g:int = 140;
  var h:int_ptr = f + g;
  var i:int = 32;
  h[0] = i;
  var j:int = 4;
  var k:int = f + j;
  f[34]:int = k;
  var l:int = 0;
  f[33]:int = l;
  var m:int = f[33]:int;
  var n:int = 1049431;
  f[36]:int = n;
  var o:int = 4111;
  var p:int = 170;
  var q:int = 149;
  var r:int = f + q;
  memset(r, p, o);
  var s:int = 149;
  var t:int = f + s;
  var u:int = t;
  var v:int = 4096;
  var w:int = 4111;
  var x:int = v;
  var y:int = w;
  var z:int = x <= y;
  var aa:int = 1;
  var ba:int = z & aa;
  if (eqz(ba)) goto B_b;
  goto B_a;
  label B_b:
  var ca:int = 4096;
  var da:int = 4111;
  builtin_panicOutOfBounds(ca, da);
  unreachable;
  label B_a:
  var ea:int = 4096;
  var fa:int = u;
  var ga:int = 4260;
  var ha:int = f + ga;
  var ia:int = ha;
  var ja:int = 132;
  var ka:int = f + ja;
  var la:int = ka;
  fmt_bufPrint_anon_1568(ia, la, fa, ea, c);
  var ma:int = f[2134]:ushort;
  var na:int = 0;
  var oa:int = 65535;
  var pa:int = ma & oa;
  var qa:int = 65535;
  var ra:int = na & qa;
  var sa:int = pa == ra;
  var ta:int = 1;
  var ua:int = sa & ta;
  if (eqz(ua)) goto B_d;
  var va:int = f[1066]:int;
  var wa:int = f[1065]:int;
  xa = wa;
  ya = va;
  goto B_c;
  label B_d:
  var za:int = f[2134]:ushort;
  var ab:int = 3;
  var bb:int = za == ab;
  if (bb) goto B_e;
  var cb:int = 1049126;
  var db:int = 23;
  var eb:int = 0;
  var fb:int = 1049576;
  builtin_default_panic(cb, db, eb, fb);
  unreachable;
  label B_e:
  var gb:int = 149;
  var hb:int = f + gb;
  var ib:int = hb;
  var jb:int = 4096;
  var kb:long_ptr@1 = ib + jb;
  var lb:int = 4111;
  var mb:int = lb;
  var nb:int = lb;
  var ob:int = mb <= nb;
  var pb:int = 1;
  var qb:int = ob & pb;
  if (eqz(qb)) goto B_g;
  goto B_f;
  label B_g:
  var rb:int = 4111;
  builtin_panicOutOfBounds(rb, rb);
  unreachable;
  label B_f:
  var sb:int = 15;
  var tb:int = kb + sb;
  var ub:int = 1049431;
  var vb:int = 15;
  var wb:int = ub + vb;
  var xb:int = kb;
  var yb:int = wb;
  var zb:int = xb >= yb;
  var ac:int = 1049431;
  var bc:int = ac;
  var cc:int = tb;
  var dc:int = bc >= cc;
  var ec:int = zb | dc;
  var fc:int = 1;
  var gc:int = ec & fc;
  if (eqz(gc)) goto B_i;
  goto B_h;
  label B_i:
  var hc:int = 1048859;
  var ic:int = 23;
  var jc:int = 0;
  var kc:int = 1049576;
  builtin_default_panic(hc, ic, jc, kc);
  unreachable;
  label B_h:
  var lc:int = 7;
  var mc:long_ptr@1 = kb + lc;
  var nc:long_ptr@1 = 0;
  var oc:long = nc[1049438];
  mc[0] = oc;
  var pc:long = nc[1049431];
  kb[0] = pc;
  f[33]:int = m;
  var qc:int = 4111;
  var rc:int = 149;
  var sc:int = f + rc;
  var tc:int = sc;
  xa = tc;
  ya = qc;
  label B_c:
  var uc:int = ya;
  var vc:int = xa;
  f[1068]:int = vc;
  f[1069]:int = uc;
  f[1071]:int = uc;
  f[1070]:int = vc;
  var wc:int = f[1071]:int;
  var xc:int = f[1070]:int;
  builtin_default_panic(xc, wc, a, b);
  unreachable;
}

export function greet():int {
  var ja:int;
  var ia:int;
  var mb:int;
  var lb:int;
  var a:int = stack_pointer;
  var b:int = 224;
  var c:int = a - b;
  stack_pointer = c;
  var d:int = 148;
  var e:int_ptr = c + d;
  var f:int = 32;
  e[0] = f;
  var g:int = 12;
  var h:int = c + g;
  c[36]:int = h;
  var i:int = 0;
  c[35]:int = i;
  var j:int = 152;
  var k:int = c + j;
  var l:int = k;
  var m:int = 1049488;
  main_Plugin_init(l, m);
  var n:long = c[38]:long@4;
  c[20]:long = n;
  var o:int = 168;
  var p:int = c + o;
  var q:int = p;
  var r:int = 140;
  var s:int = c + r;
  var t:int = s;
  var u:int = 160;
  var v:int = c + u;
  var w:int = v;
  main_Plugin_getInput(q, t, w);
  var x:int = c[88]:ushort;
  var y:int = 0;
  var z:int = 65535;
  var aa:int = x & z;
  var ba:int = 65535;
  var ca:int = y & ba;
  var da:int = aa == ca;
  var ea:int = 1;
  var fa:int = da & ea;
  if (eqz(fa)) goto B_b;
  var ga:int = c[43]:int;
  var ha:int = c[42]:int;
  ia = ha;
  ja = ga;
  goto B_a;
  label B_b:
  var ka:int = c[88]:ushort;
  var la:int = 140;
  var ma:int = c + la;
  var na:int = ma;
  builtin_panicUnwrapError(na, ka);
  unreachable;
  label B_a:
  var oa:int = ja;
  var pa:int = ia;
  c[45]:int = pa;
  c[46]:int = oa;
  c[48]:int = oa;
  c[47]:int = pa;
  var qa:int = 196;
  var ra:int = c + qa;
  var sa:int = ra;
  var ta:int = 140;
  var ua:int = c + ta;
  var va:int = ua;
  var wa:int = 1049488;
  var xa:int = 188;
  var ya:int = c + xa;
  var za:int = ya;
  fmt_allocPrint_anon_1468(sa, va, wa, za);
  var ab:int = c[102]:ushort;
  var bb:int = 0;
  var cb:int = 65535;
  var db:int = ab & cb;
  var eb:int = 65535;
  var fb:int = bb & eb;
  var gb:int = db == fb;
  var hb:int = 1;
  var ib:int = gb & hb;
  if (eqz(ib)) goto B_d;
  var jb:int = c[50]:int;
  var kb:int = c[49]:int;
  lb = kb;
  mb = jb;
  goto B_c;
  label B_d:
  var nb:int = c[102]:ushort;
  var ob:int = 140;
  var pb:int = c + ob;
  var qb:int = pb;
  builtin_panicUnwrapError(qb, nb);
  unreachable;
  label B_c:
  var rb:int = mb;
  var sb:int = lb;
  c[52]:int = sb;
  c[53]:int = rb;
  c[55]:int = rb;
  c[54]:int = sb;
  var tb:int = c[55]:int;
  var ub:int = c[54]:int;
  var vb:int = 160;
  var wb:int = c + vb;
  var xb:int = wb;
  main_Plugin_output(xb, ub, tb);
  var yb:int = 1049488;
  mem_Allocator_free_anon_1469(yb, pa, oa);
  var zb:int = 0;
  var ac:int = 224;
  var bc:int = c + ac;
  stack_pointer = bc;
  return zb;
}

function main_Plugin_init(a:long_ptr@4, b:long_ptr@4) {
  var c:int = stack_pointer;
  var d:int = 16;
  var e:long_ptr@4 = c - d;
  stack_pointer = e;
  var f:int = 8;
  var g:int = e + f;
  var h:long_ptr@4 = g;
  var i:long = b[0];
  h[0] = i;
  var j:long = e[2];
  a[0] = j;
  var k:int = 16;
  var l:int = e + k;
  stack_pointer = l;
}

function builtin_panicUnwrapError(a:int, b:int) {
  var c:int = stack_pointer;
  var d:int = 32;
  var e:int = c - d;
  stack_pointer = e;
  e[2]:int = a;
  e[7]:short = b;
  var f:int_ptr = 0;
  e[4]:int = f;
  var g:int = 1;
  e[20]:byte = g;
  var h:int = f[262380];
  var i:int = i32_extend16_s(b);
  var j:int = 3;
  var k:int = i << j;
  var l:{ a:int, b:int } = h + k;
  var m:int = l.a;
  var n:int = l.b;
  e[7]:int = n;
  e[6]:int = m;
  var o:int = 16;
  var p:int = e + o;
  var q:int = p;
  var r:int = 24;
  var s:int = e + r;
  var t:int = s;
  debug_panicExtra_anon_1544(a, q, t);
  unreachable;
}

function fmt_allocPrint_anon_1468(a:long_ptr@4, b:int, c:long_ptr@4, d:int) {
  var v:int;
  var yb:int;
  var e:int = stack_pointer;
  var f:int = 80;
  var g:int = e - f;
  stack_pointer = g;
  var h:long = fmt_count_anon_1545(d);
  var i:int = 4;
  var j:int = g + i;
  var k:int = j;
  math_cast_anon_1546(k, h);
  var l:int = g[8]:ubyte;
  var m:int = 0;
  var n:int = 255;
  var o:int = l & n;
  var p:int = 255;
  var q:int = m & p;
  var r:int = o != q;
  var s:int = 1;
  var t:int = r & s;
  if (eqz(t)) goto B_b;
  var u:int = g[1]:int;
  v = u;
  goto B_a;
  label B_b:
  builtin_returnError(b);
  var w:int = 8;
  var x:int_ptr = a + w;
  var y:int = 0;
  var z:int = y[262383]:int;
  x[0] = z;
  var aa:long = y[262381]:long@4;
  a[0] = aa;
  var ba:int = 80;
  var ca:int = g + ba;
  stack_pointer = ca;
  return ;
  label B_a:
  var da:int = v;
  g[3]:int = da;
  var ea:long = c[0];
  g[2]:long = ea;
  var fa:int = 24;
  var ga:int = g + fa;
  var ha:int = ga;
  var ia:int = 16;
  var ja:int = g + ia;
  var ka:int = ja;
  mem_Allocator_alloc_anon_1318(ha, b, ka, da);
  var la:int = g[16]:ushort;
  var ma:int = 0;
  var na:int = 65535;
  var oa:int = la & na;
  var pa:int = 65535;
  var qa:int = ma & pa;
  var ra:int = oa != qa;
  var sa:int = 1;
  var ta:int = ra & sa;
  if (eqz(ta)) goto B_c;
  var ua:int = g[16]:ushort;
  g[22]:short = ua;
  builtin_returnError(b);
  var va:long = g[9]:long@4;
  a[0] = va;
  var wa:int = 8;
  var xa:int_ptr = a + wa;
  var ya:int = 36;
  var za:int = g + ya;
  var ab:int_ptr = za + wa;
  var bb:int = ab[0];
  xa[0] = bb;
  var cb:int = 80;
  var db:int = g + cb;
  stack_pointer = db;
  return ;
  label B_c:
  var eb:int = g[7]:int;
  var fb:int = g[6]:int;
  g[13]:int = eb;
  g[12]:int = fb;
  var gb:int = 56;
  var hb:int = g + gb;
  var ib:int = hb;
  fmt_bufPrint_anon_1548(ib, b, fb, eb, d);
  var jb:int = g[32]:ushort;
  var kb:int = 0;
  var lb:int = 65535;
  var mb:int = jb & lb;
  var nb:int = 65535;
  var ob:int = kb & nb;
  var pb:int = mb == ob;
  var qb:int = 1;
  var rb:int = pb & qb;
  if (eqz(rb)) goto B_e;
  var sb:int = g[14]:int;
  var tb:int = g[15]:int;
  var ub:int = 0;
  g[38]:short = ub;
  g[18]:int = tb;
  g[17]:int = sb;
  var vb:int = 68;
  var wb:int = g + vb;
  var xb:int = wb;
  yb = xb;
  goto B_d;
  label B_e:
  var zb:int = g[32]:ushort;
  var ac:int = 3;
  var bc:int = zb == ac;
  if (bc) goto B_f;
  var cc:int = 1049126;
  var dc:int = 23;
  var ec:int = 0;
  var fc:int = 1049536;
  builtin_default_panic(cc, dc, ec, fc);
  unreachable;
  label B_f:
  builtin_panicUnwrapError(b, zb);
  unreachable;
  label B_d:
  var gc:int = yb;
  var hc:int = gc[4]:ushort;
  var ic:int = 0;
  var jc:int = 65535;
  var kc:int = hc & jc;
  var lc:int = 65535;
  var mc:int = ic & lc;
  var nc:int = kc == mc;
  var oc:int = 1;
  var pc:int = nc & oc;
  if (eqz(pc)) goto B_g;
  var qc:long = gc[0]:long@4;
  a[0] = qc;
  var rc:int = 8;
  var sc:int_ptr = a + rc;
  var tc:int_ptr = gc + rc;
  var uc:int = tc[0];
  sc[0] = uc;
  var vc:int = 80;
  var wc:int = g + vc;
  stack_pointer = wc;
  return ;
  label B_g:
  builtin_returnError(b);
  var xc:long = gc[0]:long@4;
  a[0] = xc;
  var yc:int = 8;
  var zc:int_ptr = a + yc;
  var ad:int_ptr = gc + yc;
  var bd:int = ad[0];
  zc[0] = bd;
  var cd:int = 80;
  var dd:int = g + cd;
  stack_pointer = dd;
}

function main_Plugin_output(a:int, b:int, c:int) {
  var d:int = stack_pointer;
  var e:int = 64;
  var f:int = d - e;
  stack_pointer = f;
  var g:int = c;
  var h:int = b;
  f[3]:int = c;
  f[2]:int = b;
  var i:int = g;
  var j:long = i64_extend_i32_u(i);
  f[2]:long = j;
  var k:long = alloc_extism_host_env(j);
  f[3]:long = k;
  var l:int = 32;
  var m:int = f + l;
  var n:int = m;
  Memory_init(n, k, j);
  var o:int = 8;
  var p:int = 48;
  var q:int = f + p;
  var r:long_ptr = q + o;
  var s:int = 32;
  var t:int = f + s;
  var u:long_ptr = t + o;
  var v:long = u[0];
  r[0] = v;
  var w:long = f[4]:long;
  f[6]:long = w;
  var x:int = 48;
  var y:int = f + x;
  var z:int = y;
  Memory_store(z, h, g);
  output_set_extism_host_env(k, j);
  var aa:int = 64;
  var ba:int = f + aa;
  stack_pointer = ba;
}

function mem_Allocator_free_anon_1469(a:long_ptr@4, b:int, c:int) {
  var d:int = stack_pointer;
  var e:int = 80;
  var f:int = d - e;
  stack_pointer = f;
  f[4]:int = c;
  f[3]:int = b;
  mem_sliceAsBytes_anon_1558(f, b, c);
  var g:int = f[1]:int;
  var h:int = f[0]:int;
  f[6]:int = g;
  f[5]:int = h;
  f[7]:int = g;
  if (g) goto B_a;
  var i:int = 80;
  var j:int = f + i;
  stack_pointer = j;
  return ;
  label B_a:
  f[8]:int = h;
  f[9]:int = h;
  var k:int = f[8]:int;
  var l:int = 0;
  var m:int = l;
  var n:int = g;
  var o:int = m <= n;
  var p:int = 1;
  var q:int = o & p;
  if (eqz(q)) goto B_c;
  goto B_b;
  label B_c:
  var r:int = 0;
  builtin_panicStartGreaterThanEnd(r, g);
  unreachable;
  label B_b:
  var s:int = 0;
  var t:int = s;
  var u:int = g;
  var v:int = t <= u;
  var w:int = 1;
  var x:int = v & w;
  if (eqz(x)) goto B_e;
  goto B_d;
  label B_e:
  var y:int = 0;
  builtin_panicOutOfBounds(y, g);
  unreachable;
  label B_d:
  var z:int = g;
  var aa:int = k;
  var ba:int = 170;
  memset(aa, ba, z);
  var ca:long = a[0];
  f[5]:long = ca;
  var da:long = f[10]:long@4;
  f[6]:long = da;
  var ea:int = f[8]:int;
  var fa:int = 0;
  var ga:int = fa;
  var ha:int = g;
  var ia:int = ga <= ha;
  var ja:int = 1;
  var ka:int = ia & ja;
  if (eqz(ka)) goto B_g;
  goto B_f;
  label B_g:
  var la:int = 0;
  builtin_panicStartGreaterThanEnd(la, g);
  unreachable;
  label B_f:
  var ma:int = 0;
  var na:int = ma;
  var oa:int = g;
  var pa:int = na <= oa;
  var qa:int = 1;
  var ra:int = pa & qa;
  if (eqz(ra)) goto B_i;
  goto B_h;
  label B_i:
  var sa:int = 0;
  builtin_panicOutOfBounds(sa, g);
  unreachable;
  label B_h:
  var ta:int = g;
  var ua:int = ea;
  f[14]:int = ua;
  f[15]:int = ta;
  var va:int = 0;
  f[67]:byte = va;
  var wa:int = 0;
  f[17]:int = wa;
  var xa:long = f[6]:long;
  f[9]:long = xa;
  var ya:int_ptr = f[19]:int;
  var za:int = ya[2];
  var ab:int = f[12]:int;
  var bb:int = 0;
  var cb:int = 0;
  call_indirect(ab, ua, ta, bb, cb, za);
  var db:int = 80;
  var eb:int = f + db;
  stack_pointer = eb;
}

function debug_panicExtra_anon_1544(a:int, b:int, c:int) {
  var ya:int;
  var xa:int;
  var d:int = stack_pointer;
  var e:int = 4288;
  var f:int = d - e;
  stack_pointer = f;
  f[0]:int = a;
  var g:int = 140;
  var h:int_ptr = f + g;
  var i:int = 32;
  h[0] = i;
  var j:int = 4;
  var k:int = f + j;
  f[34]:int = k;
  var l:int = 0;
  f[33]:int = l;
  var m:int = f[33]:int;
  var n:int = 1049431;
  f[36]:int = n;
  var o:int = 4111;
  var p:int = 170;
  var q:int = 149;
  var r:int = f + q;
  memset(r, p, o);
  var s:int = 149;
  var t:int = f + s;
  var u:int = t;
  var v:int = 4096;
  var w:int = 4111;
  var x:int = v;
  var y:int = w;
  var z:int = x <= y;
  var aa:int = 1;
  var ba:int = z & aa;
  if (eqz(ba)) goto B_b;
  goto B_a;
  label B_b:
  var ca:int = 4096;
  var da:int = 4111;
  builtin_panicOutOfBounds(ca, da);
  unreachable;
  label B_a:
  var ea:int = 4096;
  var fa:int = u;
  var ga:int = 4260;
  var ha:int = f + ga;
  var ia:int = ha;
  var ja:int = 132;
  var ka:int = f + ja;
  var la:int = ka;
  fmt_bufPrint_anon_1569(ia, la, fa, ea, c);
  var ma:int = f[2134]:ushort;
  var na:int = 0;
  var oa:int = 65535;
  var pa:int = ma & oa;
  var qa:int = 65535;
  var ra:int = na & qa;
  var sa:int = pa == ra;
  var ta:int = 1;
  var ua:int = sa & ta;
  if (eqz(ua)) goto B_d;
  var va:int = f[1066]:int;
  var wa:int = f[1065]:int;
  xa = wa;
  ya = va;
  goto B_c;
  label B_d:
  var za:int = f[2134]:ushort;
  var ab:int = 3;
  var bb:int = za == ab;
  if (bb) goto B_e;
  var cb:int = 1049126;
  var db:int = 23;
  var eb:int = 0;
  var fb:int = 1049584;
  builtin_default_panic(cb, db, eb, fb);
  unreachable;
  label B_e:
  var gb:int = 149;
  var hb:int = f + gb;
  var ib:int = hb;
  var jb:int = 4096;
  var kb:long_ptr@1 = ib + jb;
  var lb:int = 4111;
  var mb:int = lb;
  var nb:int = lb;
  var ob:int = mb <= nb;
  var pb:int = 1;
  var qb:int = ob & pb;
  if (eqz(qb)) goto B_g;
  goto B_f;
  label B_g:
  var rb:int = 4111;
  builtin_panicOutOfBounds(rb, rb);
  unreachable;
  label B_f:
  var sb:int = 15;
  var tb:int = kb + sb;
  var ub:int = 1049431;
  var vb:int = 15;
  var wb:int = ub + vb;
  var xb:int = kb;
  var yb:int = wb;
  var zb:int = xb >= yb;
  var ac:int = 1049431;
  var bc:int = ac;
  var cc:int = tb;
  var dc:int = bc >= cc;
  var ec:int = zb | dc;
  var fc:int = 1;
  var gc:int = ec & fc;
  if (eqz(gc)) goto B_i;
  goto B_h;
  label B_i:
  var hc:int = 1048859;
  var ic:int = 23;
  var jc:int = 0;
  var kc:int = 1049584;
  builtin_default_panic(hc, ic, jc, kc);
  unreachable;
  label B_h:
  var lc:int = 7;
  var mc:long_ptr@1 = kb + lc;
  var nc:long_ptr@1 = 0;
  var oc:long = nc[1049438];
  mc[0] = oc;
  var pc:long = nc[1049431];
  kb[0] = pc;
  f[33]:int = m;
  var qc:int = 4111;
  var rc:int = 149;
  var sc:int = f + rc;
  var tc:int = sc;
  xa = tc;
  ya = qc;
  label B_c:
  var uc:int = ya;
  var vc:int = xa;
  f[1068]:int = vc;
  f[1069]:int = uc;
  f[1071]:int = uc;
  f[1070]:int = vc;
  var wc:int = f[1071]:int;
  var xc:int = f[1070]:int;
  builtin_default_panic(xc, wc, a, b);
  unreachable;
}

function fmt_count_anon_1545(a:int):long {
  var b:int = stack_pointer;
  var c:int = 192;
  var d:int = b - c;
  stack_pointer = d;
  var e:int = 148;
  var f:int_ptr = d + e;
  var g:int = 32;
  f[0] = g;
  var h:int = 12;
  var i:int = d + h;
  d[36]:int = i;
  var j:int = 0;
  d[35]:int = j;
  var k:int = 160;
  var l:int = d + k;
  var m:int = l;
  io_counting_writer_countingWriter_anon_1665(m);
  var n:long = d[20]:long;
  d[19]:long = n;
  var o:int = 168;
  var p:int = d + o;
  var q:int = p;
  var r:int = 152;
  var s:int = d + r;
  var t:int = s;
  io_counting_writer_CountingWriter_writer(q, t);
  var u:int = d[42]:int;
  d[43]:int = u;
  var v:int = 172;
  var w:int = d + v;
  var x:int = w;
  d[44]:int = x;
  var y:int = 172;
  var z:int = d + y;
  var aa:int = z;
  d[47]:int = aa;
  var ba:int = d[47]:int;
  d[45]:int = ba;
  var ca:int = 1;
  d[46]:int = ca;
  var da:int = 180;
  var ea:int = d + da;
  var fa:int = ea;
  var ga:int = fa;
  var ha:int = ga;
  var ia:int = 140;
  var ja:int = d + ia;
  var ka:int = ja;
  var la:int = fmt_format_anon_1697(ka, ha, a);
  var ma:int = 0;
  var na:int = 65535;
  var oa:int = la & na;
  var pa:int = 65535;
  var qa:int = ma & pa;
  var ra:int = oa == qa;
  var sa:int = 1;
  var ta:int = ra & sa;
  if (eqz(ta)) goto B_b;
  goto B_a;
  label B_b:
  var ua:int = 140;
  var va:int = d + ua;
  var wa:int = va;
  builtin_panicUnwrapError(wa, la);
  unreachable;
  label B_a:
  var xa:long = d[19]:long;
  var ya:int = 192;
  var za:int = d + ya;
  stack_pointer = za;
  return xa;
}

function math_cast_anon_1546(a:long_ptr@4, b:long) {
  var c:int = stack_pointer;
  var d:int = 32;
  var e:int = c - d;
  stack_pointer = e;
  e[1]:long = b;
  var f:int = 0;
  var g:int = 1;
  var h:int = f & g;
  e[23]:byte = h;
  var i:long = 4294967295L;
  var j:long = b;
  var k:long = i;
  var l:int = j > k;
  var m:int = 1;
  var n:int = l & m;
  if (eqz(n)) goto B_a;
  var o:long = 0L;
  a[0] = o;
  var p:int = 32;
  var q:int = e + p;
  stack_pointer = q;
  return ;
  label B_a:
  var r:long = 4294967295L;
  var s:long = b;
  var t:long = r;
  var u:int = s <= t;
  var v:int = 1;
  var w:int = u & v;
  if (eqz(w)) goto B_c;
  goto B_b;
  label B_c:
  var x:int = 1048790;
  var y:int = 27;
  var z:int = 0;
  var aa:int = 1049620;
  builtin_default_panic(x, y, z, aa);
  unreachable;
  label B_b:
  var ba:int = i32_wrap_i64(b);
  e[6]:int = ba;
  var ca:int = 1;
  e[28]:byte = ca;
  var da:long = e[6]:long@4;
  a[0] = da;
  var ea:int = 32;
  var fa:int = e + ea;
  stack_pointer = fa;
}

function fmt_bufPrint_anon_1548(a:long_ptr@4, b:int, c:int, d:int, e:int) {
  var f:int = stack_pointer;
  var g:int = 80;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = d;
  var j:int = c;
  h[3]:int = d;
  h[2]:int = c;
  var k:int = 32;
  var l:int = h + k;
  var m:int = l;
  io_fixed_buffer_stream_fixedBufferStream_anon_2212(m, j, i);
  var n:int = 8;
  var o:int = 16;
  var p:int = h + o;
  var q:int_ptr = p + n;
  var r:int = 32;
  var s:int = h + r;
  var t:int_ptr = s + n;
  var u:int = t[0];
  q[0] = u;
  var v:long = h[8]:long@4;
  h[2]:long = v;
  var w:int = 44;
  var x:int = h + w;
  var y:int = x;
  var z:int = 16;
  var aa:int = h + z;
  var ba:int = aa;
  io_fixed_buffer_stream_FixedBufferStream_writer(y, ba);
  var ca:int = h[11]:int;
  h[12]:int = ca;
  var da:int = 48;
  var ea:int = h + da;
  var fa:int = ea;
  h[13]:int = fa;
  var ga:int = 48;
  var ha:int = h + ga;
  var ia:int = ha;
  h[16]:int = ia;
  var ja:int = h[16]:int;
  h[14]:int = ja;
  var ka:int = 2;
  h[15]:int = ka;
  var la:int = 56;
  var ma:int = h + la;
  var na:int = ma;
  var oa:int = na;
  var pa:int = oa;
  var qa:int = fmt_format_anon_1697(b, pa, e);
  var ra:int = 0;
  var sa:int = 65535;
  var ta:int = qa & sa;
  var ua:int = 65535;
  var va:int = ra & ua;
  var wa:int = ta == va;
  var xa:int = 1;
  var ya:int = wa & xa;
  if (eqz(ya)) goto B_b;
  goto B_a;
  label B_b:
  var za:int = 65535;
  var ab:int = qa & za;
  var bb:int = 3;
  var cb:int = ab == bb;
  if (cb) goto B_c;
  builtin_panicUnwrapError(b, qa);
  unreachable;
  label B_c:
  builtin_returnError(b);
  var db:int = 8;
  var eb:int_ptr = a + db;
  var fb:int = 0;
  var gb:int = fb[262409]:int;
  eb[0] = gb;
  var hb:long = fb[262407]:long@4;
  a[0] = hb;
  var ib:int = 80;
  var jb:int = h + ib;
  stack_pointer = jb;
  return ;
  label B_a:
  var kb:int = 16;
  var lb:int = h + kb;
  io_fixed_buffer_stream_FixedBufferStream_getWritten(h, lb);
  var mb:int = h[0]:int;
  var nb:int = h[1]:int;
  var ob:int = 0;
  h[38]:short = ob;
  h[18]:int = nb;
  h[17]:int = mb;
  var pb:long = h[17]:long@4;
  a[0] = pb;
  var qb:int = 8;
  var rb:int_ptr = a + qb;
  var sb:int = 68;
  var tb:int = h + sb;
  var ub:int_ptr = tb + qb;
  var vb:int = ub[0];
  rb[0] = vb;
  var wb:int = 80;
  var xb:int = h + wb;
  stack_pointer = xb;
}

function Memory_init(a:{ a:long, b:long }, b:long, c:long) {
  var d:int = stack_pointer;
  var e:int = 16;
  var f:{ a:long, b:long } = d - e;
  stack_pointer = f;
  f.a = b;
  f.b = c;
  a.a = b;
  a.b = c;
  var g:int = 16;
  var h:int = f + g;
  stack_pointer = h;
}

function Memory_store(a:long_ptr, b:int, c:int) {
  var q:int;
  var ia:long;
  var d:int = stack_pointer;
  var e:int = 48;
  var f:int = d - e;
  stack_pointer = f;
  var g:int = c;
  var h:int = b;
  f[1]:int = c;
  f[0]:int = b;
  f[2]:int = g;
  var i:int = 0;
  f[3]:int = i;
  loop L_b {
    var j:int = f[3]:int;
    var k:int = j;
    var l:int = g;
    var m:int = k < l;
    var n:int = 1;
    var o:int = m & n;
    if (eqz(o)) goto B_e;
    var p:int = f[3]:int;
    q = g - p;
    var r:int = q > g;
    var s:int = 1;
    var t:int = r & s;
    if (t) goto B_d;
    goto B_c;
    label B_e:
    goto B_a;
    label B_d:
    var u:int = 1048710;
    var v:int = 16;
    var w:int = 0;
    var x:int = 1049468;
    builtin_default_panic(u, v, w, x);
    unreachable;
    label B_c:
    var y:int = 8;
    var z:int = q;
    var aa:int = y;
    var ba:int = z < aa;
    var ca:int = 1;
    var da:int = ba & ca;
    if (eqz(da)) goto B_j;
    var ea:long = a[0];
    var fa:int = f[3]:int;
    var ga:int = fa;
    var ha:long = i64_extend_i32_u(ga);
    ia = ea + ha;
    var ja:int = ia < ea;
    var ka:int = 1;
    var la:int = ja & ka;
    if (la) goto B_i;
    goto B_h;
    label B_j:
    goto B_g;
    label B_i:
    var ma:int = 1048710;
    var na:int = 16;
    var oa:int = 0;
    var pa:int = 1049468;
    builtin_default_panic(ma, na, oa, pa);
    unreachable;
    label B_h:
    var qa:int = f[3]:int;
    var ra:int = qa;
    var sa:int = g;
    var ta:int = ra < sa;
    var ua:int = 1;
    var va:int = ta & ua;
    if (eqz(va)) goto B_l;
    goto B_k;
    label B_l:
    builtin_panicOutOfBounds(qa, g);
    unreachable;
    label B_k:
    var wa:ubyte_ptr = h + qa;
    var xa:int = wa[0];
    var ya:int = 255;
    var za:int = xa & ya;
    store_u8_extism_host_env(ia, za);
    var ab:int = f[3]:int;
    var bb:int = 1;
    var cb:int = ab + bb;
    var db:int = eqz(cb);
    var eb:int = 1;
    var fb:int = db & eb;
    if (eqz(fb)) goto B_m;
    var gb:int = 1048710;
    var hb:int = 16;
    var ib:int = 0;
    var jb:int = 1049468;
    builtin_default_panic(gb, hb, ib, jb);
    unreachable;
    label B_m:
    f[3]:int = cb;
    goto B_f;
    label B_g:
    f[4]:int = h;
    f[5]:int = g;
    var kb:int = f[3]:int;
    var lb:int = f[5]:int;
    var mb:int = f[4]:int;
    var nb:long_ptr@1 = mb + kb;
    var ob:int = 8;
    var pb:int = kb + ob;
    var qb:int = pb;
    var rb:int = lb;
    var sb:int = qb <= rb;
    var tb:int = 1;
    var ub:int = sb & tb;
    if (eqz(ub)) goto B_o;
    goto B_n;
    label B_o:
    builtin_panicOutOfBounds(pb, lb);
    unreachable;
    label B_n:
    f[6]:int = nb;
    var vb:int = 1;
    var wb:int = 1;
    var xb:int = vb & wb;
    f[31]:byte = xb;
    var yb:long = nb[0];
    f[4]:long = yb;
    var zb:long = yb;
    var ac:long = zb;
    f[5]:long = ac;
    var bc:long = a[0];
    var cc:int = f[3]:int;
    var dc:int = cc;
    var ec:long = i64_extend_i32_u(dc);
    var fc:long = bc + ec;
    var gc:int = fc < bc;
    var hc:int = 1;
    var ic:int = gc & hc;
    if (eqz(ic)) goto B_p;
    var jc:int = 1048710;
    var kc:int = 16;
    var lc:int = 0;
    var mc:int = 1049468;
    builtin_default_panic(jc, kc, lc, mc);
    unreachable;
    label B_p:
    store_u64_extism_host_env(fc, ac);
    var nc:int = f[3]:int;
    var oc:int = 8;
    var pc:int = nc + oc;
    var qc:int = pc < nc;
    var rc:int = 1;
    var sc:int = qc & rc;
    if (eqz(sc)) goto B_q;
    var tc:int = 1048710;
    var uc:int = 16;
    var vc:int = 0;
    var wc:int = 1049468;
    builtin_default_panic(tc, uc, vc, wc);
    unreachable;
    label B_q:
    f[3]:int = pc;
    label B_f:
    continue L_b;
  }
  label B_a:
  var xc:int = 48;
  var yc:int = f + xc;
  stack_pointer = yc;
}

function mem_sliceAsBytes_anon_1558(a:{ a:int, b:int }, b:int, c:int) {
  var j:int;
  var d:int = stack_pointer;
  var e:int = 16;
  var f:int_ptr = d - e;
  stack_pointer = f;
  var g:int = c;
  var h:int = b;
  f[2] = c;
  f[1] = b;
  if (g) goto B_c;
  goto B_b;
  label B_c:
  var i:int = 0;
  j = i;
  goto B_a;
  label B_b:
  var k:int = 1;
  j = k;
  label B_a:
  var l:int = j;
  var m:int = 1;
  var n:int = l & m;
  if (eqz(n)) goto B_d;
  var o:int = 0;
  a.b = o;
  var p:int = -1431655766;
  a.a = p;
  var q:int = 16;
  var r:int = f + q;
  stack_pointer = r;
  return ;
  label B_d:
  f[3] = h;
  var s:int = f[3];
  var t:int = 0;
  var u:int = t;
  var v:int = g;
  var w:int = u <= v;
  var x:int = 1;
  var y:int = w & x;
  if (eqz(y)) goto B_f;
  goto B_e;
  label B_f:
  var z:int = 0;
  builtin_panicStartGreaterThanEnd(z, g);
  unreachable;
  label B_e:
  var aa:int = 0;
  var ba:int = aa;
  var ca:int = g;
  var da:int = ba <= ca;
  var ea:int = 1;
  var fa:int = da & ea;
  if (eqz(fa)) goto B_h;
  goto B_g;
  label B_h:
  var ga:int = 0;
  builtin_panicOutOfBounds(ga, g);
  unreachable;
  label B_g:
  a.b = g;
  a.a = s;
  var ha:int = 16;
  var ia:int = f + ha;
  stack_pointer = ia;
}

function heap_WasmAllocator_alloc(a:int, b:int, c:int, d:int):int {
  var bb:int;
  var jc:int;
  var le:int;
  var vd:int;
  var e:int = stack_pointer;
  var f:int = 208;
  var g:int = e - f;
  stack_pointer = g;
  g[0]:int = a;
  g[1]:int = b;
  g[11]:byte = c;
  g[3]:int = d;
  var h:int = 152;
  var i:int_ptr = g + h;
  var j:int = 32;
  i[0] = j;
  var k:int = 16;
  var l:int = g + k;
  g[37]:int = l;
  var m:int = 0;
  g[36]:int = m;
  var n:int = g[36]:int;
  var o:int = 31;
  var p:int = 255;
  var q:int = c & p;
  var r:int = 255;
  var s:int = o & r;
  var t:int = q <= s;
  var u:int = 1;
  var v:int = t & u;
  if (eqz(v)) goto B_b;
  goto B_a;
  label B_b:
  var w:int = 1048790;
  var x:int = 27;
  var y:int = 0;
  var z:int = 1049496;
  builtin_default_panic(w, x, y, z);
  unreachable;
  label B_a:
  var aa:int = 31;
  var ba:int = c & aa;
  var ca:int = 1;
  var da:int = ca << ba;
  g[39]:int = da;
  var ea:int = 4;
  var fa:int = b + ea;
  var ga:int = fa < b;
  var ha:int = -1;
  var ia:int = select_if(ha, fa, ga);
  var ja:int = ia > da;
  var ka:int = select_if(ia, da, ja);
  g[40]:int = ka;
  var la:int = 164;
  var ma:int = g + la;
  var na:int = ma;
  var oa:int = 144;
  var pa:int = g + oa;
  var qa:int = pa;
  math_ceilPowerOfTwo_anon_1489(na, qa, ka);
  var ra:int = g[84]:ushort;
  var sa:int = 0;
  var ta:int = 65535;
  var ua:int = ra & ta;
  var va:int = 65535;
  var wa:int = sa & va;
  var xa:int = ua == wa;
  var ya:int = 1;
  var za:int = xa & ya;
  if (eqz(za)) goto B_d;
  var ab:int = g[41]:int;
  bb = ab;
  goto B_c;
  label B_d:
  g[36]:int = n;
  var cb:int = 0;
  var db:int = 208;
  var eb:int = g + db;
  stack_pointer = eb;
  return cb;
  label B_c:
  var fb:int = bb;
  g[43]:int = fb;
  var gb:int = math_log2_log2_anon_1497(fb);
  var hb:int = -3;
  var ib:int = gb + hb;
  var jb:int = ib > gb;
  var kb:int = 1;
  var lb:int = jb & kb;
  if (eqz(lb)) goto B_e;
  var mb:int = 1048710;
  var nb:int = 16;
  var ob:int = 0;
  var pb:int = 1049468;
  builtin_default_panic(mb, nb, ob, pb);
  unreachable;
  label B_e:
  g[44]:int = ib;
  var qb:int = 13;
  var rb:int = ib;
  var sb:int = qb;
  var tb:int = rb < sb;
  var ub:int = 1;
  var vb:int = tb & ub;
  if (eqz(vb)) goto B_j;
  var wb:int = 13;
  var xb:int = ib;
  var yb:int = wb;
  var zb:int = xb < yb;
  var ac:int = 1;
  var bc:int = zb & ac;
  if (bc) goto B_i;
  goto B_h;
  label B_j:
  goto B_f;
  label B_i:
  goto B_g;
  label B_h:
  var cc:int = 13;
  builtin_panicOutOfBounds(ib, cc);
  unreachable;
  label B_g:
  var dc:int = 1050136;
  var ec:int = 2;
  var fc:int = ib << ec;
  var gc:int_ptr = dc + fc;
  var hc:int = gc[0];
  g[45]:int = hc;
  if (eqz(hc)) goto B_o;
  var ic:int = -4;
  jc = fb + ic;
  var kc:int = jc > fb;
  var lc:int = 1;
  var mc:int = kc & lc;
  if (mc) goto B_n;
  goto B_m;
  label B_o:
  goto B_l;
  label B_n:
  var nc:int = 1048710;
  var oc:int = 16;
  var pc:int = 0;
  var qc:int = 1049468;
  builtin_default_panic(nc, oc, pc, qc);
  unreachable;
  label B_m:
  var rc:int_ptr = hc + jc;
  var sc:int = rc < hc;
  var tc:int = 1;
  var uc:int = sc & tc;
  if (eqz(uc)) goto B_p;
  var vc:int = 1048710;
  var wc:int = 16;
  var xc:int = 0;
  var yc:int = 1049468;
  builtin_default_panic(vc, wc, xc, yc);
  unreachable;
  label B_p:
  if (eqz(rc)) goto B_r;
  goto B_q;
  label B_r:
  var zc:int = 1048976;
  var ad:int = 30;
  var bd:int = 0;
  var cd:int = 1049496;
  builtin_default_panic(zc, ad, bd, cd);
  unreachable;
  label B_q:
  var dd:int = 3;
  var ed:int = rc & dd;
  if (ed) goto B_t;
  goto B_s;
  label B_t:
  var fd:int = 1048751;
  var gd:int = 19;
  var hd:int = 0;
  var id:int = 1049496;
  builtin_default_panic(fd, gd, hd, id);
  unreachable;
  label B_s:
  g[46]:int = rc;
  var jd:int = 13;
  var kd:int = ib;
  var ld:int = jd;
  var md:int = kd < ld;
  var nd:int = 1;
  var od:int = md & nd;
  if (eqz(od)) goto B_v;
  goto B_u;
  label B_v:
  var pd:int = 13;
  builtin_panicOutOfBounds(ib, pd);
  unreachable;
  label B_u:
  var qd:int = 1050136;
  var rd:int = 2;
  var sd:int = ib << rd;
  var td:int_ptr = qd + sd;
  var ud:int = rc[0];
  td[0] = ud;
  vd = hc;
  goto B_k;
  label B_l:
  var wd:int = 13;
  var xd:int = ib;
  var yd:int = wd;
  var zd:int = xd < yd;
  var ae:int = 1;
  var be:int = zd & ae;
  if (eqz(be)) goto B_x;
  goto B_w;
  label B_x:
  var ce:int = 13;
  builtin_panicOutOfBounds(ib, ce);
  unreachable;
  label B_w:
  var de:int = 1050188;
  var ee:int = 2;
  var fe:int = ib << ee;
  var ge:int_ptr = de + fe;
  var he:int = ge[0];
  g[47]:int = he;
  var ie:int = 65535;
  var je:int = he & ie;
  if (je) goto B_ea;
  var ke:int = 1;
  le = heap_WasmAllocator_allocBigPages(ke);
  g[48]:int = le;
  if (eqz(le)) goto B_da;
  goto B_ca;
  label B_ea:
  var me:int = 13;
  var ne:int = ib;
  var oe:int = me;
  var pe:int = ne < oe;
  var qe:int = 1;
  var re:int = pe & qe;
  if (re) goto B_ba;
  goto B_aa;
  label B_da:
  var se:int = 0;
  var te:int = 208;
  var ue:int = g + te;
  stack_pointer = ue;
  return se;
  label B_ca:
  goto B_y;
  label B_ba:
  goto B_z;
  label B_aa:
  var ve:int = 13;
  builtin_panicOutOfBounds(ib, ve);
  unreachable;
  label B_z:
  var we:int = 1050188;
  var xe:int = 2;
  var ye:int = ib << xe;
  var ze:int_ptr = we + ye;
  var af:int = he + fb;
  var bf:int = af < he;
  var cf:int = 1;
  var df:int = bf & cf;
  if (eqz(df)) goto B_fa;
  var ef:int = 1048710;
  var ff:int = 16;
  var gf:int = 0;
  var hf:int = 1049468;
  builtin_default_panic(ef, ff, gf, hf);
  unreachable;
  label B_fa:
  ze[0] = af;
  vd = he;
  goto B_k;
  label B_y:
  var if:int = 13;
  var jf:int = ib;
  var kf:int = if;
  var lf:int = jf < kf;
  var mf:int = 1;
  var nf:int = lf & mf;
  if (eqz(nf)) goto B_ha;
  goto B_ga;
  label B_ha:
  var of:int = 13;
  builtin_panicOutOfBounds(ib, of);
  unreachable;
  label B_ga:
  var pf:int = 1050188;
  var qf:int = 2;
  var rf:int = ib << qf;
  var sf:int_ptr = pf + rf;
  var tf:int = le + fb;
  var uf:int = tf < le;
  var vf:int = 1;
  var wf:int = uf & vf;
  if (eqz(wf)) goto B_ia;
  var xf:int = 1048710;
  var yf:int = 16;
  var zf:int = 0;
  var ag:int = 1049468;
  builtin_default_panic(xf, yf, zf, ag);
  unreachable;
  label B_ia:
  sf[0] = tf;
  vd = le;
  label B_k:
  var bg:int = vd;
  g[49]:int = bg;
  var cg:int = 208;
  var dg:int = g + cg;
  stack_pointer = dg;
  return bg;
  label B_f:
  g[50]:int = ka;
  var eg:int = 65539;
  var fg:int = ka + eg;
  var gg:int = fg < ka;
  var hg:int = 1;
  var ig:int = gg & hg;
  if (eqz(ig)) goto B_ja;
  var jg:int = 1048710;
  var kg:int = 16;
  var lg:int = 0;
  var mg:int = 1049468;
  builtin_default_panic(jg, kg, lg, mg);
  unreachable;
  label B_ja:
  var ng:int = 16;
  var og:int = fg >> ng;
  var pg:int = og;
  var qg:int = pg;
  g[51]:int = qg;
  var rg:int = heap_WasmAllocator_allocBigPages(qg);
  var sg:int = 208;
  var tg:int = g + sg;
  stack_pointer = tg;
  return rg;
}

function math_ceilPowerOfTwo_anon_1489(a:long_ptr@4, b:int, c:int) {
  var d:int = stack_pointer;
  var e:int = 32;
  var f:int = d - e;
  stack_pointer = f;
  f[1]:int = c;
  var g:long = 1L;
  f[12]:byte = g;
  var h:long = 0L;
  f[2]:int = h;
  var i:long = math_ceilPowerOfTwoPromote_anon_1560(c);
  f[4]:int = i;
  var j:long = 8589934591L;
  var k:long = i & j;
  var l:long = 32L;
  var m:long = k >> l;
  f[20]:byte = m;
  var n:long = 4294967296L;
  var o:long = i & n;
  var p:long = o >> l;
  var q:int = i32_wrap_i64(p);
  var r:int = 1;
  var s:int = q & r;
  if (eqz(s)) goto B_a;
  builtin_returnError(b);
  var t:long_ptr@4 = 0;
  var u:long = t[262386];
  a[0] = u;
  var v:int = 32;
  var w:int = f + v;
  stack_pointer = w;
  return ;
  label B_a:
  var x:long = 31L;
  var y:long = i << x;
  var z:long = y >> x;
  var aa:long = -1L;
  var ba:int = z > aa;
  var ca:int = 1;
  var da:int = ba & ca;
  if (eqz(da)) goto B_c;
  goto B_b;
  label B_c:
  var ea:int = 1048790;
  var fa:int = 27;
  var ga:int = 0;
  var ha:int = 1049552;
  builtin_default_panic(ea, fa, ga, ha);
  unreachable;
  label B_b:
  var ia:int = i32_wrap_i64(i);
  var ja:int = 0;
  f[14]:short = ja;
  f[6]:int = ia;
  var ka:long = f[6]:long@4;
  a[0] = ka;
  var la:int = 32;
  var ma:int = f + la;
  stack_pointer = ma;
}

function math_log2_log2_anon_1497(a:int):int {
  var b:int = stack_pointer;
  var c:int = 16;
  var d:int_ptr = b - c;
  stack_pointer = d;
  d[3] = a;
  var e:int = math_log2_anon_1561(a);
  var f:int = 31;
  var g:int = e & f;
  var h:int = 16;
  var i:int = d + h;
  stack_pointer = i;
  return g;
}

function heap_WasmAllocator_allocBigPages(a:int):int {
  var ea:int;
  var b:int = stack_pointer;
  var c:int = 32;
  var d:int_ptr = b - c;
  stack_pointer = d;
  d[1] = a;
  var e:int = math_ceilPowerOfTwoAssert_anon_1539(a);
  d[2] = e;
  var f:int = 16;
  var g:int = e << f;
  var h:int = 65535;
  var i:int = e & h;
  var j:int = i != e;
  var k:int = 1;
  var l:int = j & k;
  if (eqz(l)) goto B_a;
  var m:int = 1048710;
  var n:int = 16;
  var o:int = 0;
  var p:int = 1049468;
  builtin_default_panic(m, n, o, p);
  unreachable;
  label B_a:
  d[3] = g;
  var q:int = math_log2_log2_anon_1497(e);
  d[4] = q;
  var r:int = 15;
  var s:int = q;
  var t:int = r;
  var u:int = s < t;
  var v:int = 1;
  var w:int = u & v;
  if (eqz(w)) goto B_c;
  goto B_b;
  label B_c:
  var x:int = 15;
  builtin_panicOutOfBounds(q, x);
  unreachable;
  label B_b:
  var y:int = 1050240;
  var z:int = 2;
  var aa:int = q << z;
  var ba:int_ptr = y + aa;
  var ca:int = ba[0];
  d[5] = ca;
  if (eqz(ca)) goto B_g;
  var da:int = -4;
  ea = g + da;
  var fa:int = ea > g;
  var ga:int = 1;
  var ha:int = fa & ga;
  if (ha) goto B_f;
  goto B_e;
  label B_g:
  goto B_d;
  label B_f:
  var ia:int = 1048710;
  var ja:int = 16;
  var ka:int = 0;
  var la:int = 1049468;
  builtin_default_panic(ia, ja, ka, la);
  unreachable;
  label B_e:
  var ma:int_ptr = ca + ea;
  var na:int = ma < ca;
  var oa:int = 1;
  var pa:int = na & oa;
  if (eqz(pa)) goto B_h;
  var qa:int = 1048710;
  var ra:int = 16;
  var sa:int = 0;
  var ta:int = 1049468;
  builtin_default_panic(qa, ra, sa, ta);
  unreachable;
  label B_h:
  if (eqz(ma)) goto B_j;
  goto B_i;
  label B_j:
  var ua:int = 1048976;
  var va:int = 30;
  var wa:int = 0;
  var xa:int = 1049560;
  builtin_default_panic(ua, va, wa, xa);
  unreachable;
  label B_i:
  var ya:int = 3;
  var za:int = ma & ya;
  if (za) goto B_l;
  goto B_k;
  label B_l:
  var ab:int = 1048751;
  var bb:int = 19;
  var cb:int = 0;
  var db:int = 1049560;
  builtin_default_panic(ab, bb, cb, db);
  unreachable;
  label B_k:
  d[6] = ma;
  var eb:int = 15;
  var fb:int = q;
  var gb:int = eb;
  var hb:int = fb < gb;
  var ib:int = 1;
  var jb:int = hb & ib;
  if (eqz(jb)) goto B_n;
  goto B_m;
  label B_n:
  var kb:int = 15;
  builtin_panicOutOfBounds(q, kb);
  unreachable;
  label B_m:
  var lb:int = 1050240;
  var mb:int = 2;
  var nb:int = q << mb;
  var ob:int_ptr = lb + nb;
  var pb:int = ma[0];
  ob[0] = pb;
  var qb:int = 32;
  var rb:int = d + qb;
  stack_pointer = rb;
  return ca;
  label B_d:
  var sb:int = memory_grow(e);
  d[7] = sb;
  var tb:int = -1;
  var ub:int = sb;
  var vb:int = tb;
  var wb:int = ub == vb;
  var xb:int = 1;
  var yb:int = wb & xb;
  if (eqz(yb)) goto B_o;
  var zb:int = 0;
  var ac:int = 32;
  var bc:int = d + ac;
  stack_pointer = bc;
  return zb;
  label B_o:
  var cc:int = 0;
  var dc:int = sb;
  var ec:int = cc;
  var fc:int = dc >= ec;
  var gc:int = 1;
  var hc:int = fc & gc;
  if (eqz(hc)) goto B_q;
  goto B_p;
  label B_q:
  var ic:int = 1048883;
  var jc:int = 50;
  var kc:int = 0;
  var lc:int = 1049560;
  builtin_default_panic(ic, jc, kc, lc);
  unreachable;
  label B_p:
  var mc:int = 16;
  var nc:int = sb << mc;
  var oc:int = 65535;
  var pc:int = sb & oc;
  var qc:int = pc != sb;
  var rc:int = 1;
  var sc:int = qc & rc;
  if (eqz(sc)) goto B_r;
  var tc:int = 1048710;
  var uc:int = 16;
  var vc:int = 0;
  var wc:int = 1049468;
  builtin_default_panic(tc, uc, vc, wc);
  unreachable;
  label B_r:
  var xc:int = 32;
  var yc:int = d + xc;
  stack_pointer = yc;
  return nc;
}

function math_ceilPowerOfTwoPromote_anon_1560(a:int):long {
  var b:int = stack_pointer;
  var c:int = 16;
  var d:int_ptr = b - c;
  stack_pointer = d;
  d[3] = a;
  var e:int = 0;
  var f:int = a;
  var g:int = e;
  var h:int = f != g;
  debug_assert(h);
  var i:int = -1;
  var j:int = a + i;
  var k:int = j > a;
  var l:int = 1;
  var m:int = k & l;
  if (eqz(m)) goto B_a;
  var n:int = 1048710;
  var o:int = 16;
  var p:int = 0;
  var q:int = 1049468;
  builtin_default_panic(n, o, p, q);
  unreachable;
  label B_a:
  var r:int = clz(j);
  var s:int = 65535;
  var t:int = r & s;
  var u:int = 32;
  var v:int = u - t;
  var w:int = v & s;
  var x:int = w != v;
  var y:int = 1;
  var z:int = x & y;
  if (eqz(z)) goto B_b;
  var aa:int = 1048710;
  var ba:int = 16;
  var ca:int = 0;
  var da:int = 1049468;
  builtin_default_panic(aa, ba, ca, da);
  unreachable;
  label B_b:
  var ea:int = v;
  var fa:int = 63;
  var ga:int = 65535;
  var ha:int = ea & ga;
  var ia:int = 65535;
  var ja:int = fa & ia;
  var ka:int = ha <= ja;
  var la:int = 1;
  var ma:int = ka & la;
  if (eqz(ma)) goto B_d;
  goto B_c;
  label B_d:
  var na:int = 1048790;
  var oa:int = 27;
  var pa:int = 0;
  var qa:int = 1049640;
  builtin_default_panic(na, oa, pa, qa);
  unreachable;
  label B_c:
  var ra:int = 63;
  var sa:int = ea & ra;
  var ta:int = ea;
  var ua:int = 33;
  var va:int = sa < ua;
  var wa:int = 1;
  var xa:int = va & wa;
  if (eqz(xa)) goto B_f;
  goto B_e;
  label B_f:
  var ya:int = 1049083;
  var za:int = 42;
  var ab:int = 0;
  var bb:int = 1049640;
  builtin_default_panic(ya, za, ab, bb);
  unreachable;
  label B_e:
  var cb:long = i64_extend_i32_u(ta);
  var db:long = 1L;
  var eb:long = db << cb;
  var fb:int = 16;
  var gb:int = d + fb;
  stack_pointer = gb;
  return eb;
}

function math_log2_anon_1561(a:int):int {
  var b:int = stack_pointer;
  var c:int = 16;
  var d:int_ptr = b - c;
  stack_pointer = d;
  d[3] = a;
  var e:int = 0;
  var f:int = a != e;
  debug_assert(f);
  var g:int = clz(a);
  var h:int = 65535;
  var i:int = g & h;
  var j:int = 31;
  var k:int = j - i;
  var l:int = k & h;
  var m:int = l != k;
  var n:int = 1;
  var o:int = m & n;
  if (eqz(o)) goto B_a;
  var p:int = 1048710;
  var q:int = 16;
  var r:int = 0;
  var s:int = 1049468;
  builtin_default_panic(p, q, r, s);
  unreachable;
  label B_a:
  var t:int = k;
  var u:int = 31;
  var v:int = 65535;
  var w:int = t & v;
  var x:int = 65535;
  var y:int = u & x;
  var z:int = w <= y;
  var aa:int = 1;
  var ba:int = z & aa;
  if (eqz(ba)) goto B_c;
  goto B_b;
  label B_c:
  var ca:int = 1048790;
  var da:int = 27;
  var ea:int = 0;
  var fa:int = 1049648;
  builtin_default_panic(ca, da, ea, fa);
  unreachable;
  label B_b:
  var ga:int = 16;
  var ha:int = d + ga;
  stack_pointer = ha;
  return t;
}

function math_ceilPowerOfTwoAssert_anon_1539(a:int):int {
  var aa:int;
  var b:int = stack_pointer;
  var c:int = 160;
  var d:int = b - c;
  stack_pointer = d;
  d[2]:int = a;
  var e:int = 148;
  var f:int_ptr = d + e;
  var g:int = 32;
  f[0] = g;
  var h:int = 12;
  var i:int = d + h;
  d[36]:int = i;
  var j:int = 0;
  d[35]:int = j;
  var k:int = 152;
  var l:int = d + k;
  var m:int = l;
  var n:int = 140;
  var o:int = d + n;
  var p:int = o;
  math_ceilPowerOfTwo_anon_1489(m, p, a);
  var q:int = d[78]:ushort;
  var r:int = 0;
  var s:int = 65535;
  var t:int = q & s;
  var u:int = 65535;
  var v:int = r & u;
  var w:int = t == v;
  var x:int = 1;
  var y:int = w & x;
  if (eqz(y)) goto B_b;
  var z:int = d[38]:int;
  aa = z;
  goto B_a;
  label B_b:
  var ba:int = d[78]:ushort;
  var ca:int = 140;
  var da:int = d + ca;
  var ea:int = da;
  builtin_panicUnwrapError(ea, ba);
  unreachable;
  label B_a:
  var fa:int = aa;
  var ga:int = 160;
  var ha:int = d + ga;
  stack_pointer = ha;
  return fa;
}

function heap_WasmAllocator_resize(a:int, b:int, c:int, d:int, e:int, f:int):int {
  var gc:int;
  var be:int;
  var lc:int;
  var g:int = stack_pointer;
  var h:int = 240;
  var i:int = g - h;
  stack_pointer = i;
  var j:int = c;
  b;
  i[3]:int = a;
  i[5]:int = c;
  i[4]:int = b;
  i[27]:byte = d;
  i[7]:int = e;
  i[8]:int = f;
  var k:int = 172;
  var l:int_ptr = i + k;
  var m:int = 32;
  l[0] = m;
  var n:int = 36;
  var o:int = i + n;
  i[42]:int = o;
  var p:int = 0;
  i[41]:int = p;
  var q:int = i[41]:int;
  var r:int = 31;
  var s:int = 255;
  var t:int = d & s;
  var u:int = 255;
  var v:int = r & u;
  var w:int = t <= v;
  var x:int = 1;
  var y:int = w & x;
  if (eqz(y)) goto B_b;
  goto B_a;
  label B_b:
  var z:int = 1048790;
  var aa:int = 27;
  var ba:int = 0;
  var ca:int = 1049504;
  builtin_default_panic(z, aa, ba, ca);
  unreachable;
  label B_a:
  var da:int = 31;
  var ea:int = d & da;
  var fa:int = 1;
  var ga:int = fa << ea;
  i[44]:int = ga;
  var ha:int = 4;
  var ia:int = j + ha;
  var ja:int = ia < j;
  var ka:int = 1;
  var la:int = ja & ka;
  if (eqz(la)) goto B_c;
  var ma:int = 1048710;
  var na:int = 16;
  var oa:int = 0;
  var pa:int = 1049468;
  builtin_default_panic(ma, na, oa, pa);
  unreachable;
  label B_c:
  var qa:int = ia > ga;
  var ra:int = select_if(ia, ga, qa);
  i[45]:int = ra;
  var sa:int = 4;
  var ta:int = e + sa;
  var ua:int = ta < e;
  var va:int = -1;
  var wa:int = select_if(va, ta, ua);
  var xa:int = wa > ga;
  var ya:int = select_if(wa, ga, xa);
  i[46]:int = ya;
  var za:int = math_ceilPowerOfTwoAssert_anon_1539(ra);
  i[47]:int = za;
  var ab:int = math_log2_log2_anon_1497(za);
  var bb:int = -3;
  var cb:int = ab + bb;
  var db:int = cb > ab;
  var eb:int = 1;
  var fb:int = db & eb;
  if (eqz(fb)) goto B_d;
  var gb:int = 1048710;
  var hb:int = 16;
  var ib:int = 0;
  var jb:int = 1049468;
  builtin_default_panic(gb, hb, ib, jb);
  unreachable;
  label B_d:
  i[48]:int = cb;
  var kb:int = 13;
  var lb:int = cb;
  var mb:int = kb;
  var nb:int = lb < mb;
  var ob:int = 1;
  var pb:int = nb & ob;
  if (eqz(pb)) goto B_j;
  var qb:int = 196;
  var rb:int = i + qb;
  var sb:int = rb;
  var tb:int = 164;
  var ub:int = i + tb;
  var vb:int = ub;
  math_ceilPowerOfTwo_anon_1489(sb, vb, ya);
  var wb:int = i[100]:ushort;
  var xb:int = 0;
  var yb:int = 65535;
  var zb:int = wb & yb;
  var ac:int = 65535;
  var bc:int = xb & ac;
  var cc:int = zb == bc;
  var dc:int = 1;
  var ec:int = cc & dc;
  if (ec) goto B_i;
  goto B_h;
  label B_j:
  i[52]:int = ra;
  var fc:int = 65539;
  gc = ra + fc;
  var hc:int = gc < ra;
  var ic:int = 1;
  var jc:int = hc & ic;
  if (jc) goto B_g;
  goto B_f;
  label B_i:
  var kc:int = i[49]:int;
  lc = kc;
  goto B_e;
  label B_h:
  i[41]:int = q;
  var mc:int = 0;
  var nc:int = 240;
  var oc:int = i + nc;
  stack_pointer = oc;
  return mc;
  label B_g:
  var pc:int = 1048710;
  var qc:int = 16;
  var rc:int = 0;
  var sc:int = 1049468;
  builtin_default_panic(pc, qc, rc, sc);
  unreachable;
  label B_f:
  var tc:int = 16;
  var uc:int = gc >> tc;
  var vc:int = uc;
  var wc:int = vc;
  i[53]:int = wc;
  var xc:int = math_ceilPowerOfTwoAssert_anon_1539(wc);
  i[54]:int = xc;
  i[55]:int = ya;
  var yc:int = 65539;
  var zc:int = ya + yc;
  var ad:int = zc < ya;
  var bd:int = 1;
  var cd:int = ad & bd;
  if (eqz(cd)) goto B_k;
  var dd:int = 1048710;
  var ed:int = 16;
  var fd:int = 0;
  var gd:int = 1049468;
  builtin_default_panic(dd, ed, fd, gd);
  unreachable;
  label B_k:
  var hd:int = 16;
  var id:int = zc >> hd;
  var jd:int = id;
  var kd:int = jd;
  i[56]:int = kd;
  var ld:int = 228;
  var md:int = i + ld;
  var nd:int = md;
  var od:int = 164;
  var pd:int = i + od;
  var qd:int = pd;
  math_ceilPowerOfTwo_anon_1489(nd, qd, kd);
  var rd:int = i[116]:ushort;
  var sd:int = 0;
  var td:int = 65535;
  var ud:int = rd & td;
  var vd:int = 65535;
  var wd:int = sd & vd;
  var xd:int = ud == wd;
  var yd:int = 1;
  var zd:int = xd & yd;
  if (eqz(zd)) goto B_m;
  var ae:int = i[57]:int;
  be = ae;
  goto B_l;
  label B_m:
  i[41]:int = q;
  var ce:int = 0;
  var de:int = 240;
  var ee:int = i + de;
  stack_pointer = ee;
  return ce;
  label B_l:
  var fe:int = be;
  i[59]:int = fe;
  var ge:int = xc;
  var he:int = fe;
  var ie:int = ge == he;
  var je:int = 240;
  var ke:int = i + je;
  stack_pointer = ke;
  return ie;
  label B_e:
  var le:int = lc;
  i[51]:int = le;
  var me:int = za;
  var ne:int = le;
  var oe:int = me == ne;
  var pe:int = 240;
  var qe:int = i + pe;
  stack_pointer = qe;
  return oe;
}

function heap_WasmAllocator_free(a:int, b:int, c:int, d:int, e:int) {
  var db:int;
  var ib:int;
  var qb:int_ptr;
  var f:int = stack_pointer;
  var g:int = 80;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = c;
  var j:int = b;
  h[3]:int = a;
  h[5]:int = c;
  h[4]:int = b;
  h[27]:byte = d;
  h[7]:int = e;
  var k:int = 31;
  var l:int = 255;
  var m:int = d & l;
  var n:int = 255;
  var o:int = k & n;
  var p:int = m <= o;
  var q:int = 1;
  var r:int = p & q;
  if (eqz(r)) goto B_b;
  goto B_a;
  label B_b:
  var s:int = 1048790;
  var t:int = 27;
  var u:int = 0;
  var v:int = 1049512;
  builtin_default_panic(s, t, u, v);
  unreachable;
  label B_a:
  var w:int = 31;
  var x:int = d & w;
  var y:int = 1;
  var z:int = y << x;
  h[8]:int = z;
  var aa:int = 4;
  var ba:int = i + aa;
  var ca:int = ba < i;
  var da:int = 1;
  var ea:int = ca & da;
  if (eqz(ea)) goto B_c;
  var fa:int = 1048710;
  var ga:int = 16;
  var ha:int = 0;
  var ia:int = 1049468;
  builtin_default_panic(fa, ga, ha, ia);
  unreachable;
  label B_c:
  var ja:int = ba > z;
  var ka:int = select_if(ba, z, ja);
  h[9]:int = ka;
  var la:int = math_ceilPowerOfTwoAssert_anon_1539(ka);
  h[10]:int = la;
  var ma:int = math_log2_log2_anon_1497(la);
  var na:int = -3;
  var oa:int = ma + na;
  var pa:int = oa > ma;
  var qa:int = 1;
  var ra:int = pa & qa;
  if (eqz(ra)) goto B_d;
  var sa:int = 1048710;
  var ta:int = 16;
  var ua:int = 0;
  var va:int = 1049468;
  builtin_default_panic(sa, ta, ua, va);
  unreachable;
  label B_d:
  h[11]:int = oa;
  h[12]:int = j;
  var wa:int = 13;
  var xa:int = oa;
  var ya:int = wa;
  var za:int = xa < ya;
  var ab:int = 1;
  var bb:int = za & ab;
  if (eqz(bb)) goto B_k;
  var cb:int = -4;
  db = la + cb;
  var eb:int = db > la;
  var fb:int = 1;
  var gb:int = eb & fb;
  if (gb) goto B_j;
  goto B_i;
  label B_k:
  h[14]:int = ka;
  var hb:int = 65539;
  ib = ka + hb;
  var jb:int = ib < ka;
  var kb:int = 1;
  var lb:int = jb & kb;
  if (lb) goto B_h;
  goto B_g;
  label B_j:
  var mb:int = 1048710;
  var nb:int = 16;
  var ob:int = 0;
  var pb:int = 1049468;
  builtin_default_panic(mb, nb, ob, pb);
  unreachable;
  label B_i:
  qb = j + db;
  var rb:int = qb < j;
  var sb:int = 1;
  var tb:int = rb & sb;
  if (eqz(tb)) goto B_l;
  var ub:int = 1048710;
  var vb:int = 16;
  var wb:int = 0;
  var xb:int = 1049468;
  builtin_default_panic(ub, vb, wb, xb);
  unreachable;
  label B_l:
  if (eqz(qb)) goto B_m;
  goto B_f;
  label B_m:
  var yb:int = 1048976;
  var zb:int = 30;
  var ac:int = 0;
  var bc:int = 1049512;
  builtin_default_panic(yb, zb, ac, bc);
  unreachable;
  label B_h:
  var cc:int = 1048710;
  var dc:int = 16;
  var ec:int = 0;
  var fc:int = 1049468;
  builtin_default_panic(cc, dc, ec, fc);
  unreachable;
  label B_g:
  var gc:int = 16;
  var hc:int = ib >> gc;
  var ic:int = hc;
  var jc:int = ic;
  h[15]:int = jc;
  var kc:int = math_ceilPowerOfTwoAssert_anon_1539(jc);
  h[16]:int = kc;
  var lc:int = 16;
  var mc:int = kc << lc;
  var nc:int = 65535;
  var oc:int = kc & nc;
  var pc:int = oc != kc;
  var qc:int = 1;
  var rc:int = pc & qc;
  if (eqz(rc)) goto B_n;
  var sc:int = 1048710;
  var tc:int = 16;
  var uc:int = 0;
  var vc:int = 1049468;
  builtin_default_panic(sc, tc, uc, vc);
  unreachable;
  label B_n:
  h[17]:int = mc;
  var wc:int = -4;
  var xc:int = mc + wc;
  var yc:int = xc > mc;
  var zc:int = 1;
  var ad:int = yc & zc;
  if (eqz(ad)) goto B_o;
  var bd:int = 1048710;
  var cd:int = 16;
  var dd:int = 0;
  var ed:int = 1049468;
  builtin_default_panic(bd, cd, dd, ed);
  unreachable;
  label B_o:
  var fd:int_ptr = j + xc;
  var gd:int = fd < j;
  var hd:int = 1;
  var id:int = gd & hd;
  if (eqz(id)) goto B_p;
  var jd:int = 1048710;
  var kd:int = 16;
  var ld:int = 0;
  var md:int = 1049468;
  builtin_default_panic(jd, kd, ld, md);
  unreachable;
  label B_p:
  if (eqz(fd)) goto B_r;
  goto B_q;
  label B_r:
  var nd:int = 1048976;
  var od:int = 30;
  var pd:int = 0;
  var qd:int = 1049512;
  builtin_default_panic(nd, od, pd, qd);
  unreachable;
  label B_q:
  var rd:int = 3;
  var sd:int = fd & rd;
  if (sd) goto B_t;
  goto B_s;
  label B_t:
  var td:int = 1048751;
  var ud:int = 19;
  var vd:int = 0;
  var wd:int = 1049512;
  builtin_default_panic(td, ud, vd, wd);
  unreachable;
  label B_s:
  h[18]:int = fd;
  var xd:int = math_log2_log2_anon_1497(kc);
  h[19]:int = xd;
  var yd:int = 15;
  var zd:int = xd;
  var ae:int = yd;
  var be:int = zd < ae;
  var ce:int = 1;
  var de:int = be & ce;
  if (eqz(de)) goto B_v;
  goto B_u;
  label B_v:
  var ee:int = 15;
  builtin_panicOutOfBounds(xd, ee);
  unreachable;
  label B_u:
  var fe:int = 1050240;
  var ge:int = 2;
  var he:int = xd << ge;
  var ie:int_ptr = fe + he;
  var je:int = ie[0];
  fd[0] = je;
  var ke:int = 15;
  var le:int = xd;
  var me:int = ke;
  var ne:int = le < me;
  var oe:int = 1;
  var pe:int = ne & oe;
  if (eqz(pe)) goto B_x;
  goto B_w;
  label B_x:
  var qe:int = 15;
  builtin_panicOutOfBounds(xd, qe);
  unreachable;
  label B_w:
  var re:int = 1050240;
  var se:int = 2;
  var te:int = xd << se;
  var ue:int_ptr = re + te;
  ue[0] = j;
  goto B_e;
  label B_f:
  var ve:int = 3;
  var we:int = qb & ve;
  if (we) goto B_z;
  goto B_y;
  label B_z:
  var xe:int = 1048751;
  var ye:int = 19;
  var ze:int = 0;
  var af:int = 1049512;
  builtin_default_panic(xe, ye, ze, af);
  unreachable;
  label B_y:
  h[13]:int = qb;
  var bf:int = 13;
  var cf:int = oa;
  var df:int = bf;
  var ef:int = cf < df;
  var ff:int = 1;
  var gf:int = ef & ff;
  if (eqz(gf)) goto B_ba;
  goto B_aa;
  label B_ba:
  var hf:int = 13;
  builtin_panicOutOfBounds(oa, hf);
  unreachable;
  label B_aa:
  var if:int = 1050136;
  var jf:int = 2;
  var kf:int = oa << jf;
  var lf:int_ptr = if + kf;
  var mf:int = lf[0];
  qb[0] = mf;
  var nf:int = 13;
  var of:int = oa;
  var pf:int = nf;
  var qf:int = of < pf;
  var rf:int = 1;
  var sf:int = qf & rf;
  if (eqz(sf)) goto B_da;
  goto B_ca;
  label B_da:
  var tf:int = 13;
  builtin_panicOutOfBounds(oa, tf);
  unreachable;
  label B_ca:
  var uf:int = 1050136;
  var vf:int = 2;
  var wf:int = oa << vf;
  var xf:int_ptr = uf + wf;
  xf[0] = j;
  label B_e:
  var yf:int = 80;
  var zf:int = h + yf;
  stack_pointer = zf;
}

function math_mul_anon_1565(a:long_ptr@4, b:int, c:int, d:int) {
  var e:int = stack_pointer;
  var f:int = 32;
  var g:int = e - f;
  stack_pointer = g;
  g[2]:int = c;
  g[3]:int = d;
  var h:long = i64_extend_i32_u(d);
  var i:long = i64_extend_i32_u(c);
  var j:long = i * h;
  var k:long = 32L;
  var l:long = j >> k;
  var m:int = i32_wrap_i64(l);
  var n:int = 0;
  var o:int = m != n;
  var p:int = i32_wrap_i64(j);
  g[4]:int = p;
  var q:int = 1;
  var r:int = o & q;
  g[20]:byte = r;
  var s:int = g[20]:ubyte;
  var t:int = 0;
  var u:int = 1;
  var v:int = s & u;
  var w:int = 1;
  var x:int = t & w;
  var y:int = v != x;
  var z:int = 1;
  var aa:int = y & z;
  if (eqz(aa)) goto B_a;
  builtin_returnError(b);
  var ba:long_ptr@4 = 0;
  var ca:long = ba[262414];
  a[0] = ca;
  var da:int = 32;
  var ea:int = g + da;
  stack_pointer = ea;
  return ;
  label B_a:
  var fa:int = g[4]:int;
  var ga:int = 0;
  g[14]:short = ga;
  g[6]:int = fa;
  var ha:long = g[6]:long@4;
  a[0] = ha;
  var ia:int = 32;
  var ja:int = g + ia;
  stack_pointer = ja;
}

function mem_Allocator_allocBytesWithAlignment_anon_1566(a:long_ptr@4, b:int, c:long_ptr@4, d:int, e:int) {
  var ia:int;
  var f:int = stack_pointer;
  var g:int = 80;
  var h:int = f - g;
  stack_pointer = h;
  h[3]:int = d;
  h[4]:int = e;
  if (d) goto B_a;
  var i:int = -1;
  h[5]:int = i;
  var j:long_ptr@4 = 0;
  var k:long = j[262416];
  a[0] = k;
  var l:int = 80;
  var m:int = h + l;
  stack_pointer = m;
  return ;
  label B_a:
  var n:long = c[0];
  h[3]:long = n;
  var o:long = h[3]:long;
  h[4]:long = o;
  var p:int = 1;
  h[10]:int = p;
  var q:int = math_log2_anon_2228(p);
  var r:int = q;
  var s:int = r;
  var t:int = 31;
  var u:int = s & t;
  h[11]:int = d;
  h[51]:byte = u;
  h[13]:int = e;
  var v:long = h[4]:long;
  h[7]:long = v;
  var w:int_ptr = h[15]:int;
  var x:int = w[0];
  var y:int = h[8]:int;
  var z:int = call_indirect(y, d, u, e, x);
  var aa:int = z;
  var ba:int = aa;
  var ca:int = 0;
  var da:int = ba;
  var ea:int = ca;
  var fa:int = da != ea;
  var ga:int = 1;
  var ha:int = fa & ga;
  if (eqz(ha)) goto B_c;
  ia = ba;
  goto B_b;
  label B_c:
  builtin_returnError(b);
  var ja:long_ptr@4 = 0;
  var ka:long = ja[262418];
  a[0] = ka;
  var la:int = 80;
  var ma:int = h + la;
  stack_pointer = ma;
  return ;
  label B_b:
  var na:int = ia;
  h[16]:int = na;
  h[17]:int = na;
  var oa:int = h[16]:int;
  var pa:int = 0;
  var qa:int = pa;
  var ra:int = d;
  var sa:int = qa <= ra;
  var ta:int = 1;
  var ua:int = sa & ta;
  if (eqz(ua)) goto B_e;
  goto B_d;
  label B_e:
  var va:int = 0;
  builtin_panicStartGreaterThanEnd(va, d);
  unreachable;
  label B_d:
  var wa:int = 0;
  var xa:int = wa;
  var ya:int = d;
  var za:int = xa <= ya;
  var ab:int = 1;
  var bb:int = za & ab;
  if (eqz(bb)) goto B_g;
  goto B_f;
  label B_g:
  var cb:int = 0;
  builtin_panicOutOfBounds(cb, d);
  unreachable;
  label B_f:
  var db:int = d;
  var eb:int = oa;
  var fb:int = 170;
  memset(eb, fb, db);
  var gb:int = 0;
  h[38]:short = gb;
  h[18]:int = na;
  var hb:long = h[18]:long@4;
  a[0] = hb;
  var ib:int = 80;
  var jb:int = h + ib;
  stack_pointer = jb;
}

function debug_panicExtra_anon_1567(a:int, b:int, c:int) {
  var ya:int;
  var xa:int;
  var d:int = stack_pointer;
  var e:int = 4288;
  var f:int = d - e;
  stack_pointer = f;
  f[0]:int = a;
  var g:int = 140;
  var h:int_ptr = f + g;
  var i:int = 32;
  h[0] = i;
  var j:int = 4;
  var k:int = f + j;
  f[34]:int = k;
  var l:int = 0;
  f[33]:int = l;
  var m:int = f[33]:int;
  var n:int = 1049431;
  f[36]:int = n;
  var o:int = 4111;
  var p:int = 170;
  var q:int = 149;
  var r:int = f + q;
  memset(r, p, o);
  var s:int = 149;
  var t:int = f + s;
  var u:int = t;
  var v:int = 4096;
  var w:int = 4111;
  var x:int = v;
  var y:int = w;
  var z:int = x <= y;
  var aa:int = 1;
  var ba:int = z & aa;
  if (eqz(ba)) goto B_b;
  goto B_a;
  label B_b:
  var ca:int = 4096;
  var da:int = 4111;
  builtin_panicOutOfBounds(ca, da);
  unreachable;
  label B_a:
  var ea:int = 4096;
  var fa:int = u;
  var ga:int = 4260;
  var ha:int = f + ga;
  var ia:int = ha;
  var ja:int = 132;
  var ka:int = f + ja;
  var la:int = ka;
  fmt_bufPrint_anon_2229(ia, la, fa, ea, c);
  var ma:int = f[2134]:ushort;
  var na:int = 0;
  var oa:int = 65535;
  var pa:int = ma & oa;
  var qa:int = 65535;
  var ra:int = na & qa;
  var sa:int = pa == ra;
  var ta:int = 1;
  var ua:int = sa & ta;
  if (eqz(ua)) goto B_d;
  var va:int = f[1066]:int;
  var wa:int = f[1065]:int;
  xa = wa;
  ya = va;
  goto B_c;
  label B_d:
  var za:int = f[2134]:ushort;
  var ab:int = 3;
  var bb:int = za == ab;
  if (bb) goto B_e;
  var cb:int = 1049126;
  var db:int = 23;
  var eb:int = 0;
  var fb:int = 1049680;
  builtin_default_panic(cb, db, eb, fb);
  unreachable;
  label B_e:
  var gb:int = 149;
  var hb:int = f + gb;
  var ib:int = hb;
  var jb:int = 4096;
  var kb:long_ptr@1 = ib + jb;
  var lb:int = 4111;
  var mb:int = lb;
  var nb:int = lb;
  var ob:int = mb <= nb;
  var pb:int = 1;
  var qb:int = ob & pb;
  if (eqz(qb)) goto B_g;
  goto B_f;
  label B_g:
  var rb:int = 4111;
  builtin_panicOutOfBounds(rb, rb);
  unreachable;
  label B_f:
  var sb:int = 15;
  var tb:int = kb + sb;
  var ub:int = 1049431;
  var vb:int = 15;
  var wb:int = ub + vb;
  var xb:int = kb;
  var yb:int = wb;
  var zb:int = xb >= yb;
  var ac:int = 1049431;
  var bc:int = ac;
  var cc:int = tb;
  var dc:int = bc >= cc;
  var ec:int = zb | dc;
  var fc:int = 1;
  var gc:int = ec & fc;
  if (eqz(gc)) goto B_i;
  goto B_h;
  label B_i:
  var hc:int = 1048859;
  var ic:int = 23;
  var jc:int = 0;
  var kc:int = 1049680;
  builtin_default_panic(hc, ic, jc, kc);
  unreachable;
  label B_h:
  var lc:int = 7;
  var mc:long_ptr@1 = kb + lc;
  var nc:long_ptr@1 = 0;
  var oc:long = nc[1049438];
  mc[0] = oc;
  var pc:long = nc[1049431];
  kb[0] = pc;
  f[33]:int = m;
  var qc:int = 4111;
  var rc:int = 149;
  var sc:int = f + rc;
  var tc:int = sc;
  xa = tc;
  ya = qc;
  label B_c:
  var uc:int = ya;
  var vc:int = xa;
  f[1068]:int = vc;
  f[1069]:int = uc;
  f[1071]:int = uc;
  f[1070]:int = vc;
  var wc:int = f[1071]:int;
  var xc:int = f[1070]:int;
  builtin_default_panic(xc, wc, a, b);
  unreachable;
}

function fmt_bufPrint_anon_1568(a:long_ptr@4, b:int, c:int, d:int, e:int) {
  var f:int = stack_pointer;
  var g:int = 80;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = d;
  var j:int = c;
  h[3]:int = d;
  h[2]:int = c;
  var k:int = 32;
  var l:int = h + k;
  var m:int = l;
  io_fixed_buffer_stream_fixedBufferStream_anon_2212(m, j, i);
  var n:int = 8;
  var o:int = 16;
  var p:int = h + o;
  var q:int_ptr = p + n;
  var r:int = 32;
  var s:int = h + r;
  var t:int_ptr = s + n;
  var u:int = t[0];
  q[0] = u;
  var v:long = h[8]:long@4;
  h[2]:long = v;
  var w:int = 44;
  var x:int = h + w;
  var y:int = x;
  var z:int = 16;
  var aa:int = h + z;
  var ba:int = aa;
  io_fixed_buffer_stream_FixedBufferStream_writer(y, ba);
  var ca:int = h[11]:int;
  h[12]:int = ca;
  var da:int = 48;
  var ea:int = h + da;
  var fa:int = ea;
  h[13]:int = fa;
  var ga:int = 48;
  var ha:int = h + ga;
  var ia:int = ha;
  h[16]:int = ia;
  var ja:int = h[16]:int;
  h[14]:int = ja;
  var ka:int = 2;
  h[15]:int = ka;
  var la:int = 56;
  var ma:int = h + la;
  var na:int = ma;
  var oa:int = na;
  var pa:int = oa;
  var qa:int = fmt_format_anon_2230(b, pa, e);
  var ra:int = 0;
  var sa:int = 65535;
  var ta:int = qa & sa;
  var ua:int = 65535;
  var va:int = ra & ua;
  var wa:int = ta == va;
  var xa:int = 1;
  var ya:int = wa & xa;
  if (eqz(ya)) goto B_b;
  goto B_a;
  label B_b:
  var za:int = 65535;
  var ab:int = qa & za;
  var bb:int = 3;
  var cb:int = ab == bb;
  if (cb) goto B_c;
  builtin_panicUnwrapError(b, qa);
  unreachable;
  label B_c:
  builtin_returnError(b);
  var db:int = 8;
  var eb:int_ptr = a + db;
  var fb:int = 0;
  var gb:int = fb[262431]:int;
  eb[0] = gb;
  var hb:long = fb[262429]:long@4;
  a[0] = hb;
  var ib:int = 80;
  var jb:int = h + ib;
  stack_pointer = jb;
  return ;
  label B_a:
  var kb:int = 16;
  var lb:int = h + kb;
  io_fixed_buffer_stream_FixedBufferStream_getWritten(h, lb);
  var mb:int = h[0]:int;
  var nb:int = h[1]:int;
  var ob:int = 0;
  h[38]:short = ob;
  h[18]:int = nb;
  h[17]:int = mb;
  var pb:long = h[17]:long@4;
  a[0] = pb;
  var qb:int = 8;
  var rb:int_ptr = a + qb;
  var sb:int = 68;
  var tb:int = h + sb;
  var ub:int_ptr = tb + qb;
  var vb:int = ub[0];
  rb[0] = vb;
  var wb:int = 80;
  var xb:int = h + wb;
  stack_pointer = xb;
}

function fmt_bufPrint_anon_1569(a:long_ptr@4, b:int, c:int, d:int, e:int) {
  var f:int = stack_pointer;
  var g:int = 80;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = d;
  var j:int = c;
  h[3]:int = d;
  h[2]:int = c;
  var k:int = 32;
  var l:int = h + k;
  var m:int = l;
  io_fixed_buffer_stream_fixedBufferStream_anon_2212(m, j, i);
  var n:int = 8;
  var o:int = 16;
  var p:int = h + o;
  var q:int_ptr = p + n;
  var r:int = 32;
  var s:int = h + r;
  var t:int_ptr = s + n;
  var u:int = t[0];
  q[0] = u;
  var v:long = h[8]:long@4;
  h[2]:long = v;
  var w:int = 44;
  var x:int = h + w;
  var y:int = x;
  var z:int = 16;
  var aa:int = h + z;
  var ba:int = aa;
  io_fixed_buffer_stream_FixedBufferStream_writer(y, ba);
  var ca:int = h[11]:int;
  h[12]:int = ca;
  var da:int = 48;
  var ea:int = h + da;
  var fa:int = ea;
  h[13]:int = fa;
  var ga:int = 48;
  var ha:int = h + ga;
  var ia:int = ha;
  h[16]:int = ia;
  var ja:int = h[16]:int;
  h[14]:int = ja;
  var ka:int = 2;
  h[15]:int = ka;
  var la:int = 56;
  var ma:int = h + la;
  var na:int = ma;
  var oa:int = na;
  var pa:int = oa;
  var qa:int = fmt_format_anon_2232(b, pa, e);
  var ra:int = 0;
  var sa:int = 65535;
  var ta:int = qa & sa;
  var ua:int = 65535;
  var va:int = ra & ua;
  var wa:int = ta == va;
  var xa:int = 1;
  var ya:int = wa & xa;
  if (eqz(ya)) goto B_b;
  goto B_a;
  label B_b:
  var za:int = 65535;
  var ab:int = qa & za;
  var bb:int = 3;
  var cb:int = ab == bb;
  if (cb) goto B_c;
  builtin_panicUnwrapError(b, qa);
  unreachable;
  label B_c:
  builtin_returnError(b);
  var db:int = 8;
  var eb:int_ptr = a + db;
  var fb:int = 0;
  var gb:int = fb[262440]:int;
  eb[0] = gb;
  var hb:long = fb[262438]:long@4;
  a[0] = hb;
  var ib:int = 80;
  var jb:int = h + ib;
  stack_pointer = jb;
  return ;
  label B_a:
  var kb:int = 16;
  var lb:int = h + kb;
  io_fixed_buffer_stream_FixedBufferStream_getWritten(h, lb);
  var mb:int = h[0]:int;
  var nb:int = h[1]:int;
  var ob:int = 0;
  h[38]:short = ob;
  h[18]:int = nb;
  h[17]:int = mb;
  var pb:long = h[17]:long@4;
  a[0] = pb;
  var qb:int = 8;
  var rb:int_ptr = a + qb;
  var sb:int = 68;
  var tb:int = h + sb;
  var ub:int_ptr = tb + qb;
  var vb:int = ub[0];
  rb[0] = vb;
  var wb:int = 80;
  var xb:int = h + wb;
  stack_pointer = xb;
}

function io_counting_writer_countingWriter_anon_1665(a:long_ptr) {
  var b:long = 0L;
  a[0] = b;
}

function io_counting_writer_CountingWriter_writer(a:int_ptr, b:int) {
  var c:int = stack_pointer;
  var d:int = 16;
  var e:int_ptr = c - d;
  stack_pointer = e;
  e[3] = b;
  a[0] = b;
  var f:int = 16;
  var g:int = e + f;
  stack_pointer = g;
}

function io_GenericWriter_typeErasedWriteFn(a:long_ptr@4, b:int, c:int_ptr, d:int, e:int) {
  var f:int = stack_pointer;
  var g:int = 32;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = e;
  var j:int = d;
  h[2]:int = c;
  h[4]:int = e;
  h[3]:int = d;
  var k:int = 3;
  var l:int = c & k;
  if (l) goto B_b;
  goto B_a;
  label B_b:
  var m:int = 1048751;
  var n:int = 19;
  var o:int = 0;
  var p:int = 1049764;
  builtin_default_panic(m, n, o, p);
  unreachable;
  label B_a:
  h[5]:int = c;
  var q:int = c[0];
  var r:int = 24;
  var s:int = h + r;
  var t:int = s;
  io_counting_writer_CountingWriter_write(t, b, q, j, i);
  var u:int = h[14]:ushort;
  var v:int = 0;
  var w:int = 65535;
  var x:int = u & w;
  var y:int = 65535;
  var z:int = v & y;
  var aa:int = x == z;
  var ba:int = 1;
  var ca:int = aa & ba;
  if (eqz(ca)) goto B_c;
  var da:long = h[6]:long@4;
  a[0] = da;
  var ea:int = 32;
  var fa:int = h + ea;
  stack_pointer = fa;
  return ;
  label B_c:
  builtin_returnError(b);
  var ga:long = h[6]:long@4;
  a[0] = ga;
  var ha:int = 32;
  var ia:int = h + ha;
  stack_pointer = ia;
}

function fmt_format_anon_1697(a:int, b:long_ptr@4, c:{ a:int, b:int }):int {
  var d:int = stack_pointer;
  var e:int = 32;
  var f:int = d - e;
  stack_pointer = f;
  var g:long = b[0];
  f[1]:long = g;
  var h:int = 1049447;
  var i:int = 7;
  var j:int = 8;
  var k:int = f + j;
  var l:int = k;
  var m:int = io_Writer_writeAll(a, l, h, i);
  var n:int = 0;
  var o:int = 65535;
  var p:int = m & o;
  var q:int = 65535;
  var r:int = n & q;
  var s:int = p != r;
  var t:int = 1;
  var u:int = s & t;
  if (eqz(u)) goto B_a;
  builtin_returnError(a);
  var v:int = 32;
  var w:int = f + v;
  stack_pointer = w;
  return m;
  label B_a:
  var x:int = 0;
  f[5]:int = x;
  var y:int = c.b;
  var z:int = c.a;
  var aa:int = 1049596;
  var ba:int = 3;
  var ca:int = fmt_formatType_anon_2178(a, z, y, aa, b, ba);
  var da:int = 0;
  var ea:int = 65535;
  var fa:int = ca & ea;
  var ga:int = 65535;
  var ha:int = da & ga;
  var ia:int = fa != ha;
  var ja:int = 1;
  var ka:int = ia & ja;
  if (eqz(ka)) goto B_b;
  builtin_returnError(a);
  var la:int = 32;
  var ma:int = f + la;
  stack_pointer = ma;
  return ca;
  label B_b:
  var na:long = b[0];
  f[3]:long = na;
  var oa:int = 1049457;
  var pa:int = 1;
  var qa:int = 24;
  var ra:int = f + qa;
  var sa:int = ra;
  var ta:int = io_Writer_writeAll(a, sa, oa, pa);
  var ua:int = 0;
  var va:int = 65535;
  var wa:int = ta & va;
  var xa:int = 65535;
  var ya:int = ua & xa;
  var za:int = wa != ya;
  var ab:int = 1;
  var bb:int = za & ab;
  if (eqz(bb)) goto B_c;
  builtin_returnError(a);
  var cb:int = 32;
  var db:int = f + cb;
  stack_pointer = db;
  return ta;
  label B_c:
  var eb:int = 0;
  var fb:int = 32;
  var gb:int = f + fb;
  stack_pointer = gb;
  return eb;
}

function io_fixed_buffer_stream_fixedBufferStream_anon_2212(a:{ a:int, b:int, c:int }, b:int, c:int) {
  var d:int = stack_pointer;
  var e:int = 16;
  var f:int_ptr = d - e;
  stack_pointer = f;
  f[3] = c;
  f[2] = b;
  a.b = c;
  a.a = b;
  var g:int = 0;
  a.c = g;
  var h:int = 16;
  var i:int = f + h;
  stack_pointer = i;
}

function io_fixed_buffer_stream_FixedBufferStream_writer(a:int_ptr, b:int) {
  var c:int = stack_pointer;
  var d:int = 16;
  var e:int_ptr = c - d;
  stack_pointer = e;
  e[3] = b;
  a[0] = b;
  var f:int = 16;
  var g:int = e + f;
  stack_pointer = g;
}

function io_GenericWriter_typeErasedWriteFn_1(a:long_ptr@4, b:int, c:int_ptr, d:int, e:int) {
  var f:int = stack_pointer;
  var g:int = 32;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = e;
  var j:int = d;
  h[2]:int = c;
  h[4]:int = e;
  h[3]:int = d;
  var k:int = 3;
  var l:int = c & k;
  if (l) goto B_b;
  goto B_a;
  label B_b:
  var m:int = 1048751;
  var n:int = 19;
  var o:int = 0;
  var p:int = 1049772;
  builtin_default_panic(m, n, o, p);
  unreachable;
  label B_a:
  h[5]:int = c;
  var q:int = c[0];
  var r:int = 24;
  var s:int = h + r;
  var t:int = s;
  io_fixed_buffer_stream_FixedBufferStream_write(t, b, q, j, i);
  var u:int = h[14]:ushort;
  var v:int = 0;
  var w:int = 65535;
  var x:int = u & w;
  var y:int = 65535;
  var z:int = v & y;
  var aa:int = x == z;
  var ba:int = 1;
  var ca:int = aa & ba;
  if (eqz(ca)) goto B_c;
  var da:long = h[6]:long@4;
  a[0] = da;
  var ea:int = 32;
  var fa:int = h + ea;
  stack_pointer = fa;
  return ;
  label B_c:
  builtin_returnError(b);
  var ga:long = h[6]:long@4;
  a[0] = ga;
  var ha:int = 32;
  var ia:int = h + ha;
  stack_pointer = ia;
}

function io_fixed_buffer_stream_FixedBufferStream_getWritten(a:{ a:int, b:int }, b:long_ptr@4) {
  var c:int = stack_pointer;
  var d:int = 16;
  var e:int = c - d;
  stack_pointer = e;
  var f:int = 8;
  var g:int_ptr = b + f;
  var h:int = g[0];
  var i:int_ptr = e + f;
  i[0] = h;
  var j:long = b[0];
  e[0]:long = j;
  var k:int = g[0];
  var l:int = e[1]:int;
  var m:int = e[0]:int;
  var n:int = 0;
  var o:int = n;
  var p:int = k;
  var q:int = o <= p;
  var r:int = 1;
  var s:int = q & r;
  if (eqz(s)) goto B_b;
  goto B_a;
  label B_b:
  var t:int = 0;
  builtin_panicStartGreaterThanEnd(t, k);
  unreachable;
  label B_a:
  var u:int = k;
  var v:int = l;
  var w:int = u <= v;
  var x:int = 1;
  var y:int = w & x;
  if (eqz(y)) goto B_d;
  goto B_c;
  label B_d:
  builtin_panicOutOfBounds(k, l);
  unreachable;
  label B_c:
  var z:int = 0;
  var aa:int = z;
  var ba:int = k;
  var ca:int = aa <= ba;
  var da:int = 1;
  var ea:int = ca & da;
  if (eqz(ea)) goto B_f;
  goto B_e;
  label B_f:
  var fa:int = 0;
  builtin_panicOutOfBounds(fa, k);
  unreachable;
  label B_e:
  a.b = k;
  a.a = m;
  var ga:int = 16;
  var ha:int = e + ga;
  stack_pointer = ha;
}

function debug_assert(a:int) {
  var b:int = stack_pointer;
  var c:int = 16;
  var d:byte_ptr = b - c;
  stack_pointer = d;
  var e:int = 1;
  var f:int = a & e;
  d[15] = f;
  var g:int = -1;
  var h:int = a ^ g;
  var i:int = 1;
  var j:int = h & i;
  if (eqz(j)) goto B_a;
  var k:int = 1049193;
  var l:int = 24;
  var m:int = 0;
  var n:int = 1049780;
  builtin_default_panic(k, l, m, n);
  unreachable;
  label B_a:
  var o:int = 16;
  var p:int = d + o;
  stack_pointer = p;
}

function math_log2_anon_2228(a:int):int {
  var b:int = stack_pointer;
  var c:int = 16;
  var d:int_ptr = b - c;
  stack_pointer = d;
  var e:int = 536870911;
  var f:int = a & e;
  d[3] = f;
  var g:int = 0;
  var h:int = f != g;
  debug_assert(h);
  var i:int = clz(f);
  var j:int = -3;
  var k:int = i + j;
  var l:int = k & e;
  var m:int = 65535;
  var n:int = l & m;
  var o:int = 28;
  var p:int = o - n;
  var q:int = p & m;
  var r:int = q != p;
  var s:int = 1;
  var t:int = r & s;
  if (eqz(t)) goto B_a;
  var u:int = 1048710;
  var v:int = 16;
  var w:int = 0;
  var x:int = 1049468;
  builtin_default_panic(u, v, w, x);
  unreachable;
  label B_a:
  var y:int = p;
  var z:int = 31;
  var aa:int = 65535;
  var ba:int = y & aa;
  var ca:int = 65535;
  var da:int = z & ca;
  var ea:int = ba <= da;
  var fa:int = 1;
  var ga:int = ea & fa;
  if (eqz(ga)) goto B_c;
  goto B_b;
  label B_c:
  var ha:int = 1048790;
  var ia:int = 27;
  var ja:int = 0;
  var ka:int = 1049788;
  builtin_default_panic(ha, ia, ja, ka);
  unreachable;
  label B_b:
  var la:int = 16;
  var ma:int = d + la;
  stack_pointer = ma;
  return y;
}

function fmt_bufPrint_anon_2229(a:long_ptr@4, b:int, c:int, d:int, e:int) {
  var f:int = stack_pointer;
  var g:int = 80;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = d;
  var j:int = c;
  h[3]:int = d;
  h[2]:int = c;
  var k:int = 32;
  var l:int = h + k;
  var m:int = l;
  io_fixed_buffer_stream_fixedBufferStream_anon_2212(m, j, i);
  var n:int = 8;
  var o:int = 16;
  var p:int = h + o;
  var q:int_ptr = p + n;
  var r:int = 32;
  var s:int = h + r;
  var t:int_ptr = s + n;
  var u:int = t[0];
  q[0] = u;
  var v:long = h[8]:long@4;
  h[2]:long = v;
  var w:int = 44;
  var x:int = h + w;
  var y:int = x;
  var z:int = 16;
  var aa:int = h + z;
  var ba:int = aa;
  io_fixed_buffer_stream_FixedBufferStream_writer(y, ba);
  var ca:int = h[11]:int;
  h[12]:int = ca;
  var da:int = 48;
  var ea:int = h + da;
  var fa:int = ea;
  h[13]:int = fa;
  var ga:int = 48;
  var ha:int = h + ga;
  var ia:int = ha;
  h[16]:int = ia;
  var ja:int = h[16]:int;
  h[14]:int = ja;
  var ka:int = 2;
  h[15]:int = ka;
  var la:int = 56;
  var ma:int = h + la;
  var na:int = ma;
  var oa:int = na;
  var pa:int = oa;
  var qa:int = fmt_format_anon_2235(b, pa, e);
  var ra:int = 0;
  var sa:int = 65535;
  var ta:int = qa & sa;
  var ua:int = 65535;
  var va:int = ra & ua;
  var wa:int = ta == va;
  var xa:int = 1;
  var ya:int = wa & xa;
  if (eqz(ya)) goto B_b;
  goto B_a;
  label B_b:
  var za:int = 65535;
  var ab:int = qa & za;
  var bb:int = 3;
  var cb:int = ab == bb;
  if (cb) goto B_c;
  builtin_panicUnwrapError(b, qa);
  unreachable;
  label B_c:
  builtin_returnError(b);
  var db:int = 8;
  var eb:int_ptr = a + db;
  var fb:int = 0;
  var gb:int = fb[262457]:int;
  eb[0] = gb;
  var hb:long = fb[262455]:long@4;
  a[0] = hb;
  var ib:int = 80;
  var jb:int = h + ib;
  stack_pointer = jb;
  return ;
  label B_a:
  var kb:int = 16;
  var lb:int = h + kb;
  io_fixed_buffer_stream_FixedBufferStream_getWritten(h, lb);
  var mb:int = h[0]:int;
  var nb:int = h[1]:int;
  var ob:int = 0;
  h[38]:short = ob;
  h[18]:int = nb;
  h[17]:int = mb;
  var pb:long = h[17]:long@4;
  a[0] = pb;
  var qb:int = 8;
  var rb:int_ptr = a + qb;
  var sb:int = 68;
  var tb:int = h + sb;
  var ub:int_ptr = tb + qb;
  var vb:int = ub[0];
  rb[0] = vb;
  var wb:int = 80;
  var xb:int = h + wb;
  stack_pointer = xb;
}

function fmt_format_anon_2230(a:int, b:long_ptr@4, c:{ a:int, b:int }):int {
  var d:int = stack_pointer;
  var e:int = 32;
  var f:int = d - e;
  stack_pointer = f;
  var g:long = b[0];
  f[0]:long = g;
  var h:int = 1048650;
  var i:int = 27;
  var j:int = f;
  var k:int = io_Writer_writeAll(a, j, h, i);
  var l:int = 0;
  var m:int = 65535;
  var n:int = k & m;
  var o:int = 65535;
  var p:int = l & o;
  var q:int = n != p;
  var r:int = 1;
  var s:int = q & r;
  if (eqz(s)) goto B_a;
  builtin_returnError(a);
  var t:int = 32;
  var u:int = f + t;
  stack_pointer = u;
  return k;
  label B_a:
  var v:int = 0;
  f[3]:int = v;
  var w:int = c.a;
  var x:int = 1049692;
  var y:int = 3;
  var z:int = fmt_formatType_anon_2231(a, w, x, b, y);
  var aa:int = 0;
  var ba:int = 65535;
  var ca:int = z & ba;
  var da:int = 65535;
  var ea:int = aa & da;
  var fa:int = ca != ea;
  var ga:int = 1;
  var ha:int = fa & ga;
  if (eqz(ha)) goto B_b;
  builtin_returnError(a);
  var ia:int = 32;
  var ja:int = f + ia;
  stack_pointer = ja;
  return z;
  label B_b:
  var ka:long = b[0];
  f[2]:long = ka;
  var la:int = 1048680;
  var ma:int = 6;
  var na:int = 16;
  var oa:int = f + na;
  var pa:int = oa;
  var qa:int = io_Writer_writeAll(a, pa, la, ma);
  var ra:int = 0;
  var sa:int = 65535;
  var ta:int = qa & sa;
  var ua:int = 65535;
  var va:int = ra & ua;
  var wa:int = ta != va;
  var xa:int = 1;
  var ya:int = wa & xa;
  if (eqz(ya)) goto B_c;
  builtin_returnError(a);
  var za:int = 32;
  var ab:int = f + za;
  stack_pointer = ab;
  return qa;
  label B_c:
  var bb:int = 1;
  f[7]:int = bb;
  var cb:int = c.b;
  var db:int = 1049692;
  var eb:int = 3;
  var fb:int = fmt_formatType_anon_2231(a, cb, db, b, eb);
  var gb:int = 0;
  var hb:int = 65535;
  var ib:int = fb & hb;
  var jb:int = 65535;
  var kb:int = gb & jb;
  var lb:int = ib != kb;
  var mb:int = 1;
  var nb:int = lb & mb;
  if (eqz(nb)) goto B_d;
  builtin_returnError(a);
  var ob:int = 32;
  var pb:int = f + ob;
  stack_pointer = pb;
  return fb;
  label B_d:
  var qb:int = 0;
  var rb:int = 32;
  var sb:int = f + rb;
  stack_pointer = sb;
  return qb;
}

function fmt_format_anon_2232(a:int, b:long_ptr@4, c:{ a:int, b:int }):int {
  var d:int = stack_pointer;
  var e:int = 16;
  var f:int = d - e;
  stack_pointer = f;
  var g:long = b[0];
  f[0]:long = g;
  var h:int = 1048576;
  var i:int = 25;
  var j:int = f;
  var k:int = io_Writer_writeAll(a, j, h, i);
  var l:int = 0;
  var m:int = 65535;
  var n:int = k & m;
  var o:int = 65535;
  var p:int = l & o;
  var q:int = n != p;
  var r:int = 1;
  var s:int = q & r;
  if (eqz(s)) goto B_a;
  builtin_returnError(a);
  var t:int = 16;
  var u:int = f + t;
  stack_pointer = u;
  return k;
  label B_a:
  var v:int = 0;
  f[3]:int = v;
  var w:int = c.b;
  var x:int = c.a;
  var y:int = 1049728;
  var z:int = 3;
  var aa:int = fmt_formatType_anon_2233(a, x, w, y, b, z);
  var ba:int = 0;
  var ca:int = 65535;
  var da:int = aa & ca;
  var ea:int = 65535;
  var fa:int = ba & ea;
  var ga:int = da != fa;
  var ha:int = 1;
  var ia:int = ga & ha;
  if (eqz(ia)) goto B_b;
  builtin_returnError(a);
  var ja:int = 16;
  var ka:int = f + ja;
  stack_pointer = ka;
  return aa;
  label B_b:
  var la:int = 0;
  var ma:int = 16;
  var na:int = f + ma;
  stack_pointer = na;
  return la;
}

function io_Writer_writeAll(a:int, b:long_ptr@4, c:int, d:int):int {
  var t:int;
  var u:int;
  var w:int;
  var q:int;
  var e:int = stack_pointer;
  var f:int = 48;
  var g:int = e - f;
  stack_pointer = g;
  var h:int = d;
  var i:int = c;
  g[2]:int = d;
  g[1]:int = c;
  var j:int = 0;
  g[3]:int = j;
  loop L_b {
    var k:int = g[3]:int;
    var l:int = k;
    var m:int = h;
    var n:int = l != m;
    var o:int = 1;
    var p:int = n & o;
    if (eqz(p)) goto B_f;
    q = g[3]:int;
    var r:long = b[0];
    g[2]:long = r;
    var s:long = g[2]:long;
    g[3]:long = s;
    g[9]:int = h;
    g[8]:int = i;
    t = g[3]:int;
    u = g[9]:int;
    var v:int = g[8]:int;
    w = v + t;
    var x:int = t;
    var y:int = u;
    var z:int = x <= y;
    var aa:int = 1;
    var ba:int = z & aa;
    if (ba) goto B_e;
    goto B_d;
    label B_f:
    goto B_a;
    label B_e:
    goto B_c;
    label B_d:
    builtin_panicStartGreaterThanEnd(t, u);
    unreachable;
    label B_c:
    var ca:int = u - t;
    var da:int = u;
    var ea:int = u;
    var fa:int = da <= ea;
    var ga:int = 1;
    var ha:int = fa & ga;
    if (eqz(ha)) goto B_h;
    goto B_g;
    label B_h:
    builtin_panicOutOfBounds(u, u);
    unreachable;
    label B_g:
    var ia:int = t;
    var ja:int = u;
    var ka:int = ia <= ja;
    var la:int = 1;
    var ma:int = ka & la;
    if (eqz(ma)) goto B_j;
    goto B_i;
    label B_j:
    builtin_panicOutOfBounds(t, u);
    unreachable;
    label B_i:
    var na:int = ca;
    var oa:int = w;
    var pa:int = 40;
    var qa:int = g + pa;
    var ra:int = qa;
    var sa:int = 24;
    var ta:int = g + sa;
    var ua:int = ta;
    io_Writer_write(ra, a, ua, oa, na);
    var va:int = g[22]:ushort;
    var wa:int = 0;
    var xa:int = 65535;
    var ya:int = va & xa;
    var za:int = 65535;
    var ab:int = wa & za;
    var bb:int = ya != ab;
    var cb:int = 1;
    var db:int = bb & cb;
    if (eqz(db)) goto B_k;
    var eb:int = g[22]:ushort;
    builtin_returnError(a);
    var fb:int = 48;
    var gb:int = g + fb;
    stack_pointer = gb;
    return eb;
    label B_k:
    var hb:int = g[10]:int;
    var ib:int = q + hb;
    var jb:int = ib < q;
    var kb:int = 1;
    var lb:int = jb & kb;
    if (eqz(lb)) goto B_l;
    var mb:int = 1048710;
    var nb:int = 16;
    var ob:int = 0;
    var pb:int = 1049468;
    builtin_default_panic(mb, nb, ob, pb);
    unreachable;
    label B_l:
    g[3]:int = ib;
    continue L_b;
  }
  label B_a:
  var qb:int = 0;
  var rb:int = 48;
  var sb:int = g + rb;
  stack_pointer = sb;
  return qb;
}

function fmt_formatType_anon_2178(a:int, b:int, c:int, d:int, e:long_ptr@4, f:int):int {
  var v:int;
  var g:int = stack_pointer;
  var h:int = 48;
  var i:int = g - h;
  stack_pointer = i;
  var j:int = c;
  var k:int = b;
  i[2]:int = c;
  i[1]:int = b;
  i[3]:int = f;
  var l:int = 1;
  i[5]:int = l;
  var m:int = 1049592;
  i[4]:int = m;
  var n:int = 6;
  i[7]:int = n;
  var o:int = 1048783;
  i[6]:int = o;
  if (f) goto B_d;
  var p:long = e[0];
  i[4]:long = p;
  var q:int = 1048690;
  var r:int = 7;
  var s:int = 32;
  var t:int = i + s;
  var u:int = t;
  v = io_Writer_writeAll(a, u, q, r);
  var w:int = 0;
  var x:int = 65535;
  var y:int = v & x;
  var z:int = 65535;
  var aa:int = w & z;
  var ba:int = y == aa;
  var ca:int = 1;
  var da:int = ba & ca;
  if (da) goto B_c;
  goto B_b;
  label B_d:
  goto B_a;
  label B_c:
  var ea:int = 48;
  var fa:int = i + ea;
  stack_pointer = fa;
  return v;
  label B_b:
  builtin_returnError(a);
  var ga:int = 48;
  var ha:int = i + ga;
  stack_pointer = ha;
  return v;
  label B_a:
  i[10]:int = k;
  i[11]:int = j;
  var ia:int = i[11]:int;
  var ja:int = i[10]:int;
  var ka:int = fmt_formatBuf_anon_2234(a, ja, ia, d, e);
  var la:int = 0;
  var ma:int = 65535;
  var na:int = ka & ma;
  var oa:int = 65535;
  var pa:int = la & oa;
  var qa:int = na == pa;
  var ra:int = 1;
  var sa:int = qa & ra;
  if (eqz(sa)) goto B_e;
  var ta:int = 48;
  var ua:int = i + ta;
  stack_pointer = ua;
  return ka;
  label B_e:
  builtin_returnError(a);
  var va:int = 48;
  var wa:int = i + va;
  stack_pointer = wa;
  return ka;
}

function io_Writer_write(a:long_ptr@4, b:int, c:int, d:int, e:int) {
  var f:int = stack_pointer;
  var g:int = 32;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = e;
  var j:int = d;
  h[3]:int = e;
  h[2]:int = d;
  var k:long = c[0]:long@4;
  h[2]:long = k;
  var l:int = h[5]:int;
  var m:int = c[0]:int;
  var n:int = 24;
  var o:int = h + n;
  var p:int = o;
  call_indirect(p, b, m, j, i, l);
  var q:int = h[14]:ushort;
  var r:int = 0;
  var s:int = 65535;
  var t:int = q & s;
  var u:int = 65535;
  var v:int = r & u;
  var w:int = t == v;
  var x:int = 1;
  var y:int = w & x;
  if (eqz(y)) goto B_a;
  var z:long = h[6]:long@4;
  a[0] = z;
  var aa:int = 32;
  var ba:int = h + aa;
  stack_pointer = ba;
  return ;
  label B_a:
  builtin_returnError(b);
  var ca:long = h[6]:long@4;
  a[0] = ca;
  var da:int = 32;
  var ea:int = h + da;
  stack_pointer = ea;
}

function fmt_formatBuf_anon_2234(a:int_ptr, b:int, c:int, d:int, e:long_ptr@4):int {
  var oa:int;
  var ya:int;
  var x:int;
  var hb:int;
  var mb:int;
  var wb:int;
  var id:int;
  var ld:int;
  var je:int;
  var ie:int;
  var f:int = stack_pointer;
  var g:int = 160;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = c;
  var j:int = b;
  h[3]:int = c;
  h[2]:int = b;
  var k:int = a[0];
  var l:int = 8;
  var m:long_ptr@4 = d + l;
  var n:long = m[0];
  h[2]:long = n;
  var o:int = h[20]:ubyte;
  var p:int = 0;
  var q:int = 255;
  var r:int = o & q;
  var s:int = 255;
  var t:int = p & s;
  var u:int = r != t;
  var v:int = 1;
  var w:int = u & v;
  if (eqz(w)) goto B_g;
  x = h[4]:int;
  h[7]:int = x;
  var y:int = 32;
  var z:int = h + y;
  var aa:int = z;
  unicode_utf8CountCodepoints(aa, a, j, i);
  var ba:int = h[18]:ushort;
  var ca:int = 0;
  var da:int = 65535;
  var ea:int = ba & da;
  var fa:int = 65535;
  var ga:int = ca & fa;
  var ha:int = ea == ga;
  var ia:int = 1;
  var ja:int = ha & ia;
  if (ja) goto B_f;
  goto B_e;
  label B_g:
  var ka:long = e[0];
  h[19]:long = ka;
  var la:int = 152;
  var ma:int = h + la;
  var na:int = ma;
  oa = io_Writer_writeAll(a, na, j, i);
  var pa:int = 0;
  var qa:int = 65535;
  var ra:int = oa & qa;
  var sa:int = 65535;
  var ta:int = pa & sa;
  var ua:int = ra != ta;
  var va:int = 1;
  var wa:int = ua & va;
  if (wa) goto B_d;
  goto B_c;
  label B_f:
  var xa:int = h[8]:int;
  ya = xa;
  goto B_b;
  label B_e:
  a[0] = k;
  ya = i;
  goto B_b;
  label B_d:
  builtin_returnError(a);
  var za:int = 160;
  var ab:int = h + za;
  stack_pointer = ab;
  return oa;
  label B_c:
  goto B_a;
  label B_b:
  var bb:int = ya;
  h[10]:int = bb;
  var cb:int = bb;
  var db:int = x;
  var eb:int = cb < db;
  var fb:int = 1;
  var gb:int = eb & fb;
  if (eqz(gb)) goto B_k;
  hb = x - bb;
  var ib:int = hb > x;
  var jb:int = 1;
  var kb:int = ib & jb;
  if (kb) goto B_j;
  goto B_i;
  label B_k:
  var lb:int = 0;
  mb = lb;
  goto B_h;
  label B_j:
  var nb:int = 1048710;
  var ob:int = 16;
  var pb:int = 0;
  var qb:int = 1049468;
  builtin_default_panic(nb, ob, pb, qb);
  unreachable;
  label B_i:
  mb = hb;
  label B_h:
  var rb:int = mb;
  h[11]:int = rb;
  if (rb) goto B_o;
  var sb:long = e[0];
  h[6]:long = sb;
  var tb:int = 48;
  var ub:int = h + tb;
  var vb:int = ub;
  wb = io_Writer_writeAll(a, vb, j, i);
  var xb:int = 0;
  var yb:int = 65535;
  var zb:int = wb & yb;
  var ac:int = 65535;
  var bc:int = xb & ac;
  var cc:int = zb == bc;
  var dc:int = 1;
  var ec:int = cc & dc;
  if (ec) goto B_n;
  goto B_m;
  label B_o:
  goto B_l;
  label B_n:
  var fc:int = 160;
  var gc:int = h + fc;
  stack_pointer = gc;
  return wb;
  label B_m:
  builtin_returnError(a);
  var hc:int = 160;
  var ic:int = h + hc;
  stack_pointer = ic;
  return wb;
  label B_l:
  var jc:int = -1431655766;
  h[14]:int = jc;
  var kc:int = 18;
  var lc:ubyte_ptr = d + kc;
  var mc:int = lc[0];
  var nc:int = 16;
  var oc:int = mc << nc;
  var pc:int = d[8]:ushort;
  var qc:int = pc | oc;
  var rc:int = 4;
  var sc:int = 56;
  var tc:int = h + sc;
  var uc:int = tc;
  var vc:int = 62;
  var wc:int = h + vc;
  wc;
  var xc:int = 62;
  var yc:int = h + xc;
  unicode_utf8Encode(yc, a, qc, uc, rc);
  var zc:int = h[31]:ushort;
  var ad:int = 0;
  var bd:int = 65535;
  var cd:int = zc & bd;
  var dd:int = 65535;
  var ed:int = ad & dd;
  var fd:int = cd == ed;
  var gd:int = 1;
  var hd:int = fd & gd;
  if (eqz(hd)) goto B_v;
  id = h[64]:ubyte;
  h[67]:byte = id;
  var jd:int = 56;
  var kd:int = h + jd;
  ld = kd;
  var md:int = 0;
  var nd:int = md;
  var od:int = id;
  var pd:int = nd <= od;
  var qd:int = 1;
  var rd:int = pd & qd;
  if (rd) goto B_u;
  goto B_t;
  label B_v:
  var sd:int = h[31]:ushort;
  var td:int = -11;
  var ud:int = sd + td;
  var vd:int = 65535;
  var wd:int = ud & vd;
  var xd:int = 2;
  var yd:int = wd < xd;
  if (yd) goto B_r;
  goto B_s;
  label B_u:
  goto B_q;
  label B_t:
  var zd:int = 0;
  builtin_panicStartGreaterThanEnd(zd, id);
  unreachable;
  label B_s:
  var ae:int = 1049126;
  var be:int = 23;
  var ce:int = 0;
  var de:int = 1049864;
  builtin_default_panic(ae, be, ce, de);
  unreachable;
  label B_r:
  var ee:int = 0;
  h[78]:byte = ee;
  var fe:int = 65533;
  h[38]:short = fe;
  a[0] = k;
  var ge:int = 3;
  var he:int = 1049860;
  ie = he;
  je = ge;
  goto B_p;
  label B_q:
  var ke:int = 4;
  var le:int = id;
  var me:int = ke;
  var ne:int = le <= me;
  var oe:int = 1;
  var pe:int = ne & oe;
  if (eqz(pe)) goto B_x;
  goto B_w;
  label B_x:
  var qe:int = 4;
  builtin_panicOutOfBounds(id, qe);
  unreachable;
  label B_w:
  var re:int = 0;
  var se:int = re;
  var te:int = id;
  var ue:int = se <= te;
  var ve:int = 1;
  var we:int = ue & ve;
  if (eqz(we)) goto B_z;
  goto B_y;
  label B_z:
  var xe:int = 0;
  builtin_panicOutOfBounds(xe, id);
  unreachable;
  label B_y:
  h[18]:int = id;
  h[17]:int = ld;
  var ye:int = h[18]:int;
  var ze:int = h[17]:int;
  ie = ze;
  je = ye;
  label B_p:
  var af:int = je;
  var bf:int = ie;
  h[20]:int = bf;
  h[21]:int = af;
  var cf:int = d[20]:ubyte;
  var df:int = 2;
  var ef:int = cf + df;
  var ff:int = 3;
  var gf:int = ef & ff;
  var hf:int = 0;
  if (hf) goto B_ea;
  br_table[B_ba, B_ea, B_da, B_ca, ..B_ba](gf);
  label B_ea:
  var if:int = 1049126;
  var jf:int = 23;
  var kf:int = 0;
  var lf:int = 1049864;
  builtin_default_panic(if, jf, kf, lf);
  unreachable;
  label B_da:
  var mf:long = e[0];
  h[11]:long = mf;
  var nf:int = 88;
  var of:int = h + nf;
  var pf:int = of;
  var qf:int = io_Writer_writeAll(a, pf, j, i);
  var rf:int = 0;
  var sf:int = 65535;
  var tf:int = qf & sf;
  var uf:int = 65535;
  var vf:int = rf & uf;
  var wf:int = tf != vf;
  var xf:int = 1;
  var yf:int = wf & xf;
  if (eqz(yf)) goto B_fa;
  builtin_returnError(a);
  var zf:int = 160;
  var ag:int = h + zf;
  stack_pointer = ag;
  return qf;
  label B_fa:
  var bg:long = e[0];
  h[12]:long = bg;
  var cg:int = 96;
  var dg:int = h + cg;
  var eg:int = dg;
  var fg:int = io_Writer_writeBytesNTimes(a, eg, bf, af, rb);
  var gg:int = 0;
  var hg:int = 65535;
  var ig:int = fg & hg;
  var jg:int = 65535;
  var kg:int = gg & jg;
  var lg:int = ig != kg;
  var mg:int = 1;
  var ng:int = lg & mg;
  if (eqz(ng)) goto B_ga;
  builtin_returnError(a);
  var og:int = 160;
  var pg:int = h + og;
  stack_pointer = pg;
  return fg;
  label B_ga:
  goto B_aa;
  label B_ca:
  var qg:int = 1;
  var rg:int = rb >> qg;
  h[26]:int = rg;
  var sg:int = 1;
  var tg:int = rb + sg;
  var ug:int = eqz(tg);
  var vg:int = 1;
  var wg:int = ug & vg;
  if (eqz(wg)) goto B_ha;
  var xg:int = 1048710;
  var yg:int = 16;
  var zg:int = 0;
  var ah:int = 1049468;
  builtin_default_panic(xg, yg, zg, ah);
  unreachable;
  label B_ha:
  var bh:int = 1;
  var ch:int = tg >> bh;
  h[27]:int = ch;
  var dh:long = e[0];
  h[14]:long = dh;
  var eh:int = 112;
  var fh:int = h + eh;
  var gh:int = fh;
  var hh:int = io_Writer_writeBytesNTimes(a, gh, bf, af, rg);
  var ih:int = 0;
  var jh:int = 65535;
  var kh:int = hh & jh;
  var lh:int = 65535;
  var mh:int = ih & lh;
  var nh:int = kh != mh;
  var oh:int = 1;
  var ph:int = nh & oh;
  if (eqz(ph)) goto B_ia;
  builtin_returnError(a);
  var qh:int = 160;
  var rh:int = h + qh;
  stack_pointer = rh;
  return hh;
  label B_ia:
  var sh:long = e[0];
  h[15]:long = sh;
  var th:int = 120;
  var uh:int = h + th;
  var vh:int = uh;
  var wh:int = io_Writer_writeAll(a, vh, j, i);
  var xh:int = 0;
  var yh:int = 65535;
  var zh:int = wh & yh;
  var ai:int = 65535;
  var bi:int = xh & ai;
  var ci:int = zh != bi;
  var di:int = 1;
  var ei:int = ci & di;
  if (eqz(ei)) goto B_ja;
  builtin_returnError(a);
  var fi:int = 160;
  var gi:int = h + fi;
  stack_pointer = gi;
  return wh;
  label B_ja:
  var hi:long = e[0];
  h[16]:long = hi;
  var ii:int = 128;
  var ji:int = h + ii;
  var ki:int = ji;
  var li:int = io_Writer_writeBytesNTimes(a, ki, bf, af, ch);
  var mi:int = 0;
  var ni:int = 65535;
  var oi:int = li & ni;
  var pi:int = 65535;
  var qi:int = mi & pi;
  var ri:int = oi != qi;
  var si:int = 1;
  var ti:int = ri & si;
  if (eqz(ti)) goto B_ka;
  builtin_returnError(a);
  var ui:int = 160;
  var vi:int = h + ui;
  stack_pointer = vi;
  return li;
  label B_ka:
  goto B_aa;
  label B_ba:
  var wi:long = e[0];
  h[17]:long = wi;
  var xi:int = 136;
  var yi:int = h + xi;
  var zi:int = yi;
  var aj:int = io_Writer_writeBytesNTimes(a, zi, bf, af, rb);
  var bj:int = 0;
  var cj:int = 65535;
  var dj:int = aj & cj;
  var ej:int = 65535;
  var fj:int = bj & ej;
  var gj:int = dj != fj;
  var hj:int = 1;
  var ij:int = gj & hj;
  if (eqz(ij)) goto B_la;
  builtin_returnError(a);
  var jj:int = 160;
  var kj:int = h + jj;
  stack_pointer = kj;
  return aj;
  label B_la:
  var lj:long = e[0];
  h[18]:long = lj;
  var mj:int = 144;
  var nj:int = h + mj;
  var oj:int = nj;
  var pj:int = io_Writer_writeAll(a, oj, j, i);
  var qj:int = 0;
  var rj:int = 65535;
  var sj:int = pj & rj;
  var tj:int = 65535;
  var uj:int = qj & tj;
  var vj:int = sj != uj;
  var wj:int = 1;
  var xj:int = vj & wj;
  if (eqz(xj)) goto B_ma;
  builtin_returnError(a);
  var yj:int = 160;
  var zj:int = h + yj;
  stack_pointer = zj;
  return pj;
  label B_ma:
  label B_aa:
  label B_a:
  var ak:int = 0;
  var bk:int = 160;
  var ck:int = h + bk;
  stack_pointer = ck;
  return ak;
}

function io_counting_writer_CountingWriter_write(a:long_ptr@4, b:int, c:int, d:int, e:int) {
  var f:int = stack_pointer;
  var g:int = 48;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = e;
  var j:int = d;
  h[0]:int = c;
  h[2]:int = e;
  h[1]:int = d;
  h[3]:int = c;
  h[5]:int = e;
  h[4]:int = d;
  var k:int = 24;
  var l:int = h + k;
  var m:int = l;
  io_dummyWrite(m, b, j, i);
  var n:int = 24;
  var o:int = h + n;
  var p:int = o;
  var q:int = p;
  var r:int_ptr = q;
  var s:int = r[0];
  h[8]:int = s;
  h[9]:int = c;
  var t:long_ptr = h[9]:int;
  var u:long = t[0];
  var v:int = s;
  var w:long = i64_extend_i32_u(v);
  var x:long = u + w;
  var y:int = x < u;
  var z:int = 1;
  var aa:int = y & z;
  if (eqz(aa)) goto B_a;
  var ba:int = 1048710;
  var ca:int = 16;
  var da:int = 0;
  var ea:int = 1049468;
  builtin_default_panic(ba, ca, da, ea);
  unreachable;
  label B_a:
  t[0] = x;
  var fa:int = 0;
  h[22]:short = fa;
  h[10]:int = s;
  var ga:long = h[10]:long@4;
  a[0] = ga;
  var ha:int = 48;
  var ia:int = h + ha;
  stack_pointer = ia;
}

function io_fixed_buffer_stream_FixedBufferStream_write(a:long_ptr@4, b:int, c:{ a:int, b:int, c:int }, d:int, e:int) {
  var f:int = stack_pointer;
  var g:int = 48;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = e;
  var j:int = d;
  h[2]:int = c;
  h[4]:int = e;
  h[3]:int = d;
  if (i) goto B_a;
  var k:long = 0L;
  a[0] = k;
  var l:int = 48;
  var m:int = h + l;
  stack_pointer = m;
  return ;
  label B_a:
  var n:int = c.c;
  var o:int = c.b;
  c.a;
  var p:int = n;
  var q:int = o;
  var r:int = p >= q;
  var s:int = 1;
  var t:int = r & s;
  if (eqz(t)) goto B_b;
  builtin_returnError(b);
  var u:long_ptr@4 = 0;
  var v:long = u[262468];
  a[0] = v;
  var w:int = 48;
  var x:int = h + w;
  stack_pointer = x;
  return ;
  label B_b:
  var y:int = c.b;
  c.a;
  var z:int = c.c;
  var aa:int = y - z;
  var ba:int = aa > y;
  var ca:int = 1;
  var da:int = ba & ca;
  if (eqz(da)) goto B_c;
  var ea:int = 1048710;
  var fa:int = 16;
  var ga:int = 0;
  var ha:int = 1049468;
  builtin_default_panic(ea, fa, ga, ha);
  unreachable;
  label B_c:
  var ia:int = aa < i;
  var ja:int = select_if(aa, i, ia);
  h[5]:int = ja;
  h[6]:int = c;
  var ka:{ a:int, b:int } = h[6]:int;
  var la:int = c.c;
  var ma:int = ka.b;
  var na:int = ka.a;
  var oa:int = na + la;
  var pa:int = la + ja;
  var qa:int = pa;
  var ra:int = ma;
  var sa:int = qa <= ra;
  var ta:int = 1;
  var ua:int = sa & ta;
  if (eqz(ua)) goto B_e;
  goto B_d;
  label B_e:
  builtin_panicOutOfBounds(pa, ma);
  unreachable;
  label B_d:
  var va:int = la;
  var wa:int = pa;
  var xa:int = va <= wa;
  var ya:int = 1;
  var za:int = xa & ya;
  if (eqz(za)) goto B_g;
  goto B_f;
  label B_g:
  builtin_panicOutOfBounds(la, pa);
  unreachable;
  label B_f:
  var ab:int = ja;
  var bb:int = oa;
  h[7]:int = j;
  h[8]:int = i;
  var cb:int = h[8]:int;
  var db:int = h[7]:int;
  var eb:int = 0;
  var fb:int = eb;
  var gb:int = ja;
  var hb:int = fb <= gb;
  var ib:int = 1;
  var jb:int = hb & ib;
  if (eqz(jb)) goto B_i;
  goto B_h;
  label B_i:
  var kb:int = 0;
  builtin_panicStartGreaterThanEnd(kb, ja);
  unreachable;
  label B_h:
  var lb:int = ja;
  var mb:int = cb;
  var nb:int = lb <= mb;
  var ob:int = 1;
  var pb:int = nb & ob;
  if (eqz(pb)) goto B_k;
  goto B_j;
  label B_k:
  builtin_panicOutOfBounds(ja, cb);
  unreachable;
  label B_j:
  var qb:int = 0;
  var rb:int = qb;
  var sb:int = ja;
  var tb:int = rb <= sb;
  var ub:int = 1;
  var vb:int = tb & ub;
  if (eqz(vb)) goto B_m;
  goto B_l;
  label B_m:
  var wb:int = 0;
  builtin_panicOutOfBounds(wb, ja);
  unreachable;
  label B_l:
  var xb:int = ja;
  var yb:int = db;
  var zb:int = ab;
  var ac:int = xb;
  var bc:int = zb == ac;
  var cc:int = 1;
  var dc:int = bc & cc;
  if (eqz(dc)) goto B_o;
  goto B_n;
  label B_o:
  var ec:int = 1048818;
  var fc:int = 40;
  var gc:int = 0;
  var hc:int = 1049880;
  builtin_default_panic(ec, fc, gc, hc);
  unreachable;
  label B_n:
  var ic:int = yb + ab;
  var jc:int = bb + ab;
  var kc:int = bb;
  var lc:int = ic;
  var mc:int = kc >= lc;
  var nc:int = yb;
  var oc:int = jc;
  var pc:int = nc >= oc;
  var qc:int = mc | pc;
  var rc:int = 1;
  var sc:int = qc & rc;
  if (eqz(sc)) goto B_q;
  goto B_p;
  label B_q:
  var tc:int = 1048859;
  var uc:int = 23;
  var vc:int = 0;
  var wc:int = 1049880;
  builtin_default_panic(tc, uc, vc, wc);
  unreachable;
  label B_p:
  memcpy(bb, yb, ab);
  h[9]:int = c;
  var xc:int_ptr = h[9]:int;
  var yc:int = 8;
  var zc:int_ptr = xc + yc;
  var ad:int = xc[2];
  var bd:int = ad + ja;
  var cd:int = bd < ad;
  var dd:int = 1;
  var ed:int = cd & dd;
  if (eqz(ed)) goto B_r;
  var fd:int = 1048710;
  var gd:int = 16;
  var hd:int = 0;
  var id:int = 1049468;
  builtin_default_panic(fd, gd, hd, id);
  unreachable;
  label B_r:
  zc[0] = bd;
  if (ja) goto B_s;
  builtin_returnError(b);
  var jd:long_ptr@4 = 0;
  var kd:long = jd[262468];
  a[0] = kd;
  var ld:int = 48;
  var md:int = h + ld;
  stack_pointer = md;
  return ;
  label B_s:
  var nd:int = 0;
  h[22]:short = nd;
  h[10]:int = ja;
  var od:long = h[10]:long@4;
  a[0] = od;
  var pd:int = 48;
  var qd:int = h + pd;
  stack_pointer = qd;
}

function fmt_format_anon_2235(a:int, b:long_ptr@4, c:{ a:int, b:int }):int {
  var d:int = stack_pointer;
  var e:int = 32;
  var f:int = d - e;
  stack_pointer = f;
  var g:long = b[0];
  f[0]:long = g;
  var h:int = 1048605;
  var i:int = 12;
  var j:int = f;
  var k:int = io_Writer_writeAll(a, j, h, i);
  var l:int = 0;
  var m:int = 65535;
  var n:int = k & m;
  var o:int = 65535;
  var p:int = l & o;
  var q:int = n != p;
  var r:int = 1;
  var s:int = q & r;
  if (eqz(s)) goto B_a;
  builtin_returnError(a);
  var t:int = 32;
  var u:int = f + t;
  stack_pointer = u;
  return k;
  label B_a:
  var v:int = 0;
  f[3]:int = v;
  var w:int = c.a;
  var x:int = 1049796;
  var y:int = 3;
  var z:int = fmt_formatType_anon_2231(a, w, x, b, y);
  var aa:int = 0;
  var ba:int = 65535;
  var ca:int = z & ba;
  var da:int = 65535;
  var ea:int = aa & da;
  var fa:int = ca != ea;
  var ga:int = 1;
  var ha:int = fa & ga;
  if (eqz(ha)) goto B_b;
  builtin_returnError(a);
  var ia:int = 32;
  var ja:int = f + ia;
  stack_pointer = ja;
  return z;
  label B_b:
  var ka:long = b[0];
  f[2]:long = ka;
  var la:int = 1048620;
  var ma:int = 26;
  var na:int = 16;
  var oa:int = f + na;
  var pa:int = oa;
  var qa:int = io_Writer_writeAll(a, pa, la, ma);
  var ra:int = 0;
  var sa:int = 65535;
  var ta:int = qa & sa;
  var ua:int = 65535;
  var va:int = ra & ua;
  var wa:int = ta != va;
  var xa:int = 1;
  var ya:int = wa & xa;
  if (eqz(ya)) goto B_c;
  builtin_returnError(a);
  var za:int = 32;
  var ab:int = f + za;
  stack_pointer = ab;
  return qa;
  label B_c:
  var bb:int = 1;
  f[7]:int = bb;
  var cb:int = c.b;
  var db:int = 1049796;
  var eb:int = 3;
  var fb:int = fmt_formatType_anon_2231(a, cb, db, b, eb);
  var gb:int = 0;
  var hb:int = 65535;
  var ib:int = fb & hb;
  var jb:int = 65535;
  var kb:int = gb & jb;
  var lb:int = ib != kb;
  var mb:int = 1;
  var nb:int = lb & mb;
  if (eqz(nb)) goto B_d;
  builtin_returnError(a);
  var ob:int = 32;
  var pb:int = f + ob;
  stack_pointer = pb;
  return fb;
  label B_d:
  var qb:int = 0;
  var rb:int = 32;
  var sb:int = f + rb;
  stack_pointer = sb;
  return qb;
}

function fmt_formatType_anon_2231(a:int, b:int, c:int, d:int, e:int):int {
  var f:int = stack_pointer;
  var g:int = 32;
  var h:{ a:int, b:int, c:int, d:int, e:int, f:int, g:int, h:int } = 
    f - g;
  stack_pointer = h;
  h.a = b;
  h.b = e;
  var i:int = 1;
  h.d = i;
  var j:int = 1049688;
  h.c = j;
  var k:int = 6;
  h.f = k;
  var l:int = 1048783;
  h.e = l;
  h.h = k;
  h.g = l;
  var m:int = fmt_formatValue_anon_2236(a, b, c, d);
  var n:int = 0;
  var o:int = 65535;
  var p:int = m & o;
  var q:int = 65535;
  var r:int = n & q;
  var s:int = p == r;
  var t:int = 1;
  var u:int = s & t;
  if (eqz(u)) goto B_a;
  var v:int = 32;
  var w:int = h + v;
  stack_pointer = w;
  return m;
  label B_a:
  builtin_returnError(a);
  var x:int = 32;
  var y:int = h + x;
  stack_pointer = y;
  return m;
}

function fmt_formatValue_anon_2236(a:int, b:int, c:int, d:int):int {
  var e:int = stack_pointer;
  var f:int = 16;
  var g:int_ptr = e - f;
  stack_pointer = g;
  g[3] = b;
  var h:int = fmt_formatIntValue_anon_2239(a, b, c, d);
  var i:int = 0;
  var j:int = 65535;
  var k:int = h & j;
  var l:int = 65535;
  var m:int = i & l;
  var n:int = k == m;
  var o:int = 1;
  var p:int = n & o;
  if (eqz(p)) goto B_a;
  var q:int = 16;
  var r:int = g + q;
  stack_pointer = r;
  return h;
  label B_a:
  builtin_returnError(a);
  var s:int = 16;
  var t:int = g + s;
  stack_pointer = t;
  return h;
}

function fmt_formatType_anon_2233(a:int, b:int, c:int, d:int, e:long_ptr@4, f:int):int {
  var v:int;
  var g:int = stack_pointer;
  var h:int = 48;
  var i:int = g - h;
  stack_pointer = i;
  var j:int = c;
  var k:int = b;
  i[2]:int = c;
  i[1]:int = b;
  i[3]:int = f;
  var l:int = 1;
  i[5]:int = l;
  var m:int = 1049592;
  i[4]:int = m;
  var n:int = 6;
  i[7]:int = n;
  var o:int = 1048783;
  i[6]:int = o;
  if (f) goto B_d;
  var p:long = e[0];
  i[4]:long = p;
  var q:int = 1048690;
  var r:int = 7;
  var s:int = 32;
  var t:int = i + s;
  var u:int = t;
  v = io_Writer_writeAll(a, u, q, r);
  var w:int = 0;
  var x:int = 65535;
  var y:int = v & x;
  var z:int = 65535;
  var aa:int = w & z;
  var ba:int = y == aa;
  var ca:int = 1;
  var da:int = ba & ca;
  if (da) goto B_c;
  goto B_b;
  label B_d:
  goto B_a;
  label B_c:
  var ea:int = 48;
  var fa:int = i + ea;
  stack_pointer = fa;
  return v;
  label B_b:
  builtin_returnError(a);
  var ga:int = 48;
  var ha:int = i + ga;
  stack_pointer = ha;
  return v;
  label B_a:
  i[10]:int = k;
  i[11]:int = j;
  var ia:int = i[11]:int;
  var ja:int = i[10]:int;
  var ka:int = fmt_formatBuf_anon_2234(a, ja, ia, d, e);
  var la:int = 0;
  var ma:int = 65535;
  var na:int = ka & ma;
  var oa:int = 65535;
  var pa:int = la & oa;
  var qa:int = na == pa;
  var ra:int = 1;
  var sa:int = qa & ra;
  if (eqz(sa)) goto B_e;
  var ta:int = 48;
  var ua:int = i + ta;
  stack_pointer = ua;
  return ka;
  label B_e:
  builtin_returnError(a);
  var va:int = 48;
  var wa:int = i + va;
  stack_pointer = wa;
  return ka;
}

function io_dummyWrite(a:long_ptr@4, b:int, c:int, d:int) {
  var e:int = stack_pointer;
  var f:int = 16;
  var g:int = e - f;
  stack_pointer = g;
  var h:int = d;
  c;
  g[1]:int = d;
  g[0]:int = c;
  var i:int = 0;
  g[6]:short = i;
  g[2]:int = h;
  var j:long = g[2]:long@4;
  a[0] = j;
  var k:int = 16;
  var l:int = g + k;
  stack_pointer = l;
}

function unicode_utf8CountCodepoints(a:long_ptr@4, b:int, c:int, d:int) {
  var la:int;
  var ha:int;
  var ja:int_ptr@1;
  var zb:int;
  var be:int;
  var wd:int;
  var vd:int;
  var ae:int;
  var yd:int;
  var e:int = stack_pointer;
  var f:int = 96;
  var g:int = e - f;
  stack_pointer = g;
  var h:int = d;
  var i:int = c;
  g[3]:int = d;
  g[2]:int = c;
  var j:int = 0;
  g[4]:int = j;
  var k:int = 0;
  g[5]:int = k;
  loop L_b {
    var l:int = g[5]:int;
    var m:int = l;
    var n:int = h;
    var o:int = m < n;
    var p:int = 1;
    var q:int = o & p;
    if (eqz(q)) goto B_d;
    goto B_c;
    label B_d:
    goto B_a;
    label B_c:
    loop L_e {
      var r:int = g[5]:int;
      var s:int = 4;
      var t:int = r + s;
      var u:int = t < r;
      var v:int = 1;
      var w:int = u & v;
      if (eqz(w)) goto B_f;
      var x:int = 1048710;
      var y:int = 16;
      var z:int = 0;
      var aa:int = 1049468;
      builtin_default_panic(x, y, z, aa);
      unreachable;
      label B_f:
      var ba:int = t;
      var ca:int = h;
      var da:int = ba <= ca;
      var ea:int = 1;
      var fa:int = da & ea;
      if (eqz(fa)) goto B_k;
      g[6]:int = i;
      g[7]:int = h;
      var ga:int = g[5]:int;
      ha = g[7]:int;
      var ia:int = g[6]:int;
      ja = ia + ga;
      var ka:int = 4;
      la = ga + ka;
      var ma:int = la;
      var na:int = ha;
      var oa:int = ma <= na;
      var pa:int = 1;
      var qa:int = oa & pa;
      if (qa) goto B_j;
      goto B_i;
      label B_k:
      goto B_g;
      label B_j:
      goto B_h;
      label B_i:
      builtin_panicOutOfBounds(la, ha);
      unreachable;
      label B_h:
      g[8]:int = ja;
      var ra:int = 1;
      var sa:int = 1;
      var ta:int = ra & sa;
      g[39]:byte = ta;
      var ua:int = ja[0];
      g[10]:int = ua;
      var va:int = ua;
      var wa:int = va;
      g[11]:int = wa;
      var xa:int = -2139062144;
      var ya:int = wa & xa;
      if (eqz(ya)) goto B_l;
      goto B_g;
      label B_l:
      var za:int = g[4]:int;
      var ab:int = 4;
      var bb:int = za + ab;
      var cb:int = bb < za;
      var db:int = 1;
      var eb:int = cb & db;
      if (eqz(eb)) goto B_m;
      var fb:int = 1048710;
      var gb:int = 16;
      var hb:int = 0;
      var ib:int = 1049468;
      builtin_default_panic(fb, gb, hb, ib);
      unreachable;
      label B_m:
      g[4]:int = bb;
      var jb:int = g[5]:int;
      var kb:int = 4;
      var lb:int = jb + kb;
      var mb:int = lb < jb;
      var nb:int = 1;
      var ob:int = mb & nb;
      if (eqz(ob)) goto B_n;
      var pb:int = 1048710;
      var qb:int = 16;
      var rb:int = 0;
      var sb:int = 1049468;
      builtin_default_panic(pb, qb, rb, sb);
      unreachable;
      label B_n:
      g[5]:int = lb;
      continue L_e;
      label B_g:
    }
    var tb:int = g[5]:int;
    var ub:int = tb;
    var vb:int = h;
    var wb:int = ub < vb;
    var xb:int = 1;
    var yb:int = wb & xb;
    if (eqz(yb)) goto B_s;
    zb = g[5]:int;
    var ac:int = zb;
    var bc:int = h;
    var cc:int = ac < bc;
    var dc:int = 1;
    var ec:int = cc & dc;
    if (ec) goto B_r;
    goto B_q;
    label B_s:
    goto B_o;
    label B_r:
    goto B_p;
    label B_q:
    builtin_panicOutOfBounds(zb, h);
    unreachable;
    label B_p:
    var fc:ubyte_ptr = i + zb;
    var gc:int = fc[0];
    var hc:int = 48;
    var ic:int = g + hc;
    var jc:int = ic;
    unicode_utf8ByteSequenceLength(jc, b, gc);
    var kc:int = g[24]:ushort;
    var lc:int = 0;
    var mc:int = 65535;
    var nc:int = kc & mc;
    var oc:int = 65535;
    var pc:int = lc & oc;
    var qc:int = nc != pc;
    var rc:int = 1;
    var sc:int = qc & rc;
    if (eqz(sc)) goto B_t;
    var tc:int = g[24]:ushort;
    g[28]:short = tc;
    builtin_returnError(b);
    var uc:long = g[13]:long@4;
    a[0] = uc;
    var vc:int = 96;
    var wc:int = g + vc;
    stack_pointer = wc;
    return ;
    label B_t:
    var xc:int = g[50]:ubyte;
    var yc:int = xc;
    g[63]:byte = xc;
    var zc:int = g[5]:int;
    var ad:int = zc + xc;
    var bd:int = ad < zc;
    var cd:int = 1;
    var dd:int = bd & cd;
    if (eqz(dd)) goto B_u;
    var ed:int = 1048710;
    var fd:int = 16;
    var gd:int = 0;
    var hd:int = 1049468;
    builtin_default_panic(ed, fd, gd, hd);
    unreachable;
    label B_u:
    var id:int = ad;
    var jd:int = h;
    var kd:int = id > jd;
    var ld:int = 1;
    var md:int = kd & ld;
    if (eqz(md)) goto B_v;
    builtin_returnError(b);
    var nd:long_ptr@4 = 0;
    var od:long = nd[262463];
    a[0] = od;
    var pd:int = 96;
    var qd:int = g + pd;
    stack_pointer = qd;
    return ;
    label B_v:
    var rd:int = 7;
    var sd:int = yc & rd;
    var td:int = 1;
    var ud:int = sd == td;
    if (ud) goto B_aa;
    g[16]:int = i;
    g[17]:int = h;
    vd = g[5]:int;
    wd = g[17]:int;
    var xd:int = g[16]:int;
    yd = xd + vd;
    var zd:int = 7;
    ae = yc & zd;
    be = vd + ae;
    var ce:int = be;
    var de:int = wd;
    var ee:int = ce <= de;
    var fe:int = 1;
    var ge:int = ee & fe;
    if (ge) goto B_z;
    goto B_y;
    label B_aa:
    goto B_w;
    label B_z:
    goto B_x;
    label B_y:
    builtin_panicOutOfBounds(be, wd);
    unreachable;
    label B_x:
    var he:int = vd;
    var ie:int = be;
    var je:int = he <= ie;
    var ke:int = 1;
    var le:int = je & ke;
    if (eqz(le)) goto B_ca;
    goto B_ba;
    label B_ca:
    builtin_panicOutOfBounds(vd, be);
    unreachable;
    label B_ba:
    var me:int = ae;
    var ne:int = yd;
    var oe:int = 72;
    var pe:int = g + oe;
    var qe:int = pe;
    unicode_utf8Decode(qe, b, ne, me);
    var re:int = g[38]:ushort;
    var se:int = 0;
    var te:int = 65535;
    var ue:int = re & te;
    var ve:int = 65535;
    var we:int = se & ve;
    var xe:int = ue != we;
    var ye:int = 1;
    var ze:int = xe & ye;
    if (eqz(ze)) goto B_da;
    var af:int = g[38]:ushort;
    g[42]:short = af;
    builtin_returnError(b);
    var bf:long = g[20]:long@4;
    a[0] = bf;
    var cf:int = 96;
    var df:int = g + cf;
    stack_pointer = df;
    return ;
    label B_da:
    label B_w:
    var ef:int = g[5]:int;
    var ff:int = 7;
    var gf:int = yc & ff;
    var hf:int = ef + gf;
    var if:int = hf < ef;
    var jf:int = 1;
    var kf:int = if & jf;
    if (eqz(kf)) goto B_ea;
    var lf:int = 1048710;
    var mf:int = 16;
    var nf:int = 0;
    var of:int = 1049468;
    builtin_default_panic(lf, mf, nf, of);
    unreachable;
    label B_ea:
    g[5]:int = hf;
    var pf:int = g[4]:int;
    var qf:int = 1;
    var rf:int = pf + qf;
    var sf:int = eqz(rf);
    var tf:int = 1;
    var uf:int = sf & tf;
    if (eqz(uf)) goto B_fa;
    var vf:int = 1048710;
    var wf:int = 16;
    var xf:int = 0;
    var yf:int = 1049468;
    builtin_default_panic(vf, wf, xf, yf);
    unreachable;
    label B_fa:
    g[4]:int = rf;
    label B_o:
    continue L_b;
  }
  label B_a:
  var zf:int = g[4]:int;
  var ag:int = 0;
  g[46]:short = ag;
  g[22]:int = zf;
  var bg:long = g[22]:long@4;
  a[0] = bg;
  var cg:int = 96;
  var dg:int = g + cg;
  stack_pointer = dg;
}

function unicode_utf8Encode(a:int_ptr@2, b:int, c:int, d:int, e:int) {
  var f:int = stack_pointer;
  var g:int = 16;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = e;
  var j:int = d;
  h[0]:short = c;
  var k:int = 2097151;
  var l:int = c & k;
  var m:int = 16;
  var n:int = l >> m;
  h[2]:byte = n;
  h[2]:int = e;
  h[1]:int = d;
  var o:int = 12;
  var p:int = h + o;
  p;
  var q:int = 12;
  var r:int = h + q;
  unicode_utf8EncodeImpl_anon_2242(r, b, c, j, i);
  var s:int = h[6]:ushort;
  var t:int = 0;
  var u:int = 65535;
  var v:int = s & u;
  var w:int = 65535;
  var x:int = t & w;
  var y:int = v == x;
  var z:int = 1;
  var aa:int = y & z;
  if (eqz(aa)) goto B_a;
  var ba:int = h[6]:int@2;
  a[0] = ba;
  var ca:int = 16;
  var da:int = h + ca;
  stack_pointer = da;
  return ;
  label B_a:
  builtin_returnError(b);
  var ea:int = h[6]:int@2;
  a[0] = ea;
  var fa:int = 16;
  var ga:int = h + fa;
  stack_pointer = ga;
}

function io_Writer_writeBytesNTimes(a:int, b:long_ptr@4, c:int, d:int, e:int):int {
  var v:int;
  var f:int = stack_pointer;
  var g:int = 32;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = d;
  var j:int = c;
  h[3]:int = d;
  h[2]:int = c;
  h[4]:int = e;
  var k:int = 0;
  h[5]:int = k;
  loop L_b {
    var l:int = h[5]:int;
    var m:int = l;
    var n:int = e;
    var o:int = m < n;
    var p:int = 1;
    var q:int = o & p;
    if (eqz(q)) goto B_e;
    var r:long = b[0];
    h[3]:long = r;
    var s:int = 24;
    var t:int = h + s;
    var u:int = t;
    v = io_Writer_writeAll(a, u, j, i);
    var w:int = 0;
    var x:int = 65535;
    var y:int = v & x;
    var z:int = 65535;
    var aa:int = w & z;
    var ba:int = y != aa;
    var ca:int = 1;
    var da:int = ba & ca;
    if (da) goto B_d;
    goto B_c;
    label B_e:
    goto B_a;
    label B_d:
    builtin_returnError(a);
    var ea:int = 32;
    var fa:int = h + ea;
    stack_pointer = fa;
    return v;
    label B_c:
    var ga:int = h[5]:int;
    var ha:int = 1;
    var ia:int = ga + ha;
    var ja:int = eqz(ia);
    var ka:int = 1;
    var la:int = ja & ka;
    if (eqz(la)) goto B_f;
    var ma:int = 1048710;
    var na:int = 16;
    var oa:int = 0;
    var pa:int = 1049468;
    builtin_default_panic(ma, na, oa, pa);
    unreachable;
    label B_f:
    h[5]:int = ia;
    continue L_b;
  }
  label B_a:
  var qa:int = 0;
  var ra:int = 32;
  var sa:int = h + ra;
  stack_pointer = sa;
  return qa;
}

function fmt_formatIntValue_anon_2239(a:int, b:int, c:int, d:int):int {
  var e:int = stack_pointer;
  var f:int = 16;
  var g:int_ptr = e - f;
  stack_pointer = g;
  g[2] = b;
  g[3] = b;
  var h:int = 10;
  var i:int = 0;
  var j:int = fmt_formatInt_anon_2241(a, b, h, i, c, d);
  var k:int = 0;
  var l:int = 65535;
  var m:int = j & l;
  var n:int = 65535;
  var o:int = k & n;
  var p:int = m == o;
  var q:int = 1;
  var r:int = p & q;
  if (eqz(r)) goto B_a;
  var s:int = 16;
  var t:int = g + s;
  stack_pointer = t;
  return j;
  label B_a:
  builtin_returnError(a);
  var u:int = 16;
  var v:int = g + u;
  stack_pointer = v;
  return j;
}

function unicode_utf8ByteSequenceLength(a:int_ptr@2, b:int, c:int) {
  var w:int;
  var d:int = stack_pointer;
  var e:int = 16;
  var f:byte_ptr = d - e;
  stack_pointer = f;
  f[15] = c;
  var g:int = 0;
  var h:int = 255;
  var i:int = c & h;
  var j:int = 255;
  var k:int = g & j;
  var l:int = i >= k;
  var m:int = 127;
  var n:int = 255;
  var o:int = c & n;
  var p:int = 255;
  var q:int = m & p;
  var r:int = o <= q;
  var s:int = l & r;
  var t:int = 1;
  var u:int = s & t;
  if (eqz(u)) goto B_b;
  var v:int = 1049832;
  w = v;
  goto B_a;
  label B_b:
  var x:int = 192;
  var y:int = 255;
  var z:int = c & y;
  var aa:int = 255;
  var ba:int = x & aa;
  var ca:int = z >= ba;
  var da:int = 223;
  var ea:int = 255;
  var fa:int = c & ea;
  var ga:int = 255;
  var ha:int = da & ga;
  var ia:int = fa <= ha;
  var ja:int = ca & ia;
  var ka:int = 1;
  var la:int = ja & ka;
  if (eqz(la)) goto B_c;
  var ma:int = 1049836;
  w = ma;
  goto B_a;
  label B_c:
  var na:int = 224;
  var oa:int = 255;
  var pa:int = c & oa;
  var qa:int = 255;
  var ra:int = na & qa;
  var sa:int = pa >= ra;
  var ta:int = 239;
  var ua:int = 255;
  var va:int = c & ua;
  var wa:int = 255;
  var xa:int = ta & wa;
  var ya:int = va <= xa;
  var za:int = sa & ya;
  var ab:int = 1;
  var bb:int = za & ab;
  if (eqz(bb)) goto B_d;
  var cb:int = 1049840;
  w = cb;
  goto B_a;
  label B_d:
  var db:int = 240;
  var eb:int = 255;
  var fb:int = c & eb;
  var gb:int = 255;
  var hb:int = db & gb;
  var ib:int = fb >= hb;
  var jb:int = 247;
  var kb:int = 255;
  var lb:int = c & kb;
  var mb:int = 255;
  var nb:int = jb & mb;
  var ob:int = lb <= nb;
  var pb:int = ib & ob;
  var qb:int = 1;
  var rb:int = pb & qb;
  if (eqz(rb)) goto B_e;
  var sb:int = 1049844;
  w = sb;
  goto B_a;
  label B_e:
  var tb:int = 1049848;
  w = tb;
  label B_a:
  var ub:int = w;
  var vb:int = ub[0]:ushort;
  var wb:int = 0;
  var xb:int = 65535;
  var yb:int = vb & xb;
  var zb:int = 65535;
  var ac:int = wb & zb;
  var bc:int = yb == ac;
  var cc:int = 1;
  var dc:int = bc & cc;
  if (eqz(dc)) goto B_f;
  var ec:int = ub[0]:int@2;
  a[0] = ec;
  var fc:int = 16;
  var gc:int = f + fc;
  stack_pointer = gc;
  return ;
  label B_f:
  builtin_returnError(b);
  var hc:int = ub[0]:int@2;
  a[0] = hc;
  var ic:int = 16;
  var jc:int = f + ic;
  stack_pointer = jc;
}

function unicode_utf8Decode(a:long_ptr@4, b:int, c:int, d:int) {
  var da:int;
  var e:int = stack_pointer;
  var f:int = 48;
  var g:int = e - f;
  stack_pointer = g;
  var h:int = d;
  var i:ubyte_ptr = c;
  g[3]:int = d;
  g[2]:int = c;
  var j:int = -1;
  var k:int = d + j;
  var l:int = 3;
  k > l;
  br_table[B_f, B_e, B_d, B_c, ..B_g](k)
  label B_g:
  var m:int = 1049193;
  var n:int = 24;
  var o:int = 0;
  var p:int = 1049896;
  builtin_default_panic(m, n, o, p);
  unreachable;
  label B_f:
  var q:int = 0;
  var r:int = q;
  var s:int = h;
  var t:int = r < s;
  var u:int = 1;
  var v:int = t & u;
  if (eqz(v)) goto B_h;
  goto B_b;
  label B_h:
  var w:int = 0;
  builtin_panicOutOfBounds(w, h);
  unreachable;
  label B_e:
  var x:int = 24;
  var y:int = g + x;
  var z:int = y;
  unicode_utf8Decode2(z, b, i, h);
  var aa:int = 24;
  var ba:int = g + aa;
  var ca:int = ba;
  da = ca;
  goto B_a;
  label B_d:
  var ea:int = 32;
  var fa:int = g + ea;
  var ga:int = fa;
  unicode_utf8Decode3(ga, b, i, h);
  var ha:int = 32;
  var ia:int = g + ha;
  var ja:int = ia;
  da = ja;
  goto B_a;
  label B_c:
  var ka:int = 40;
  var la:int = g + ka;
  var ma:int = la;
  unicode_utf8Decode4(ma, b, i, h);
  var na:int = 40;
  var oa:int = g + na;
  var pa:int = oa;
  da = pa;
  goto B_a;
  label B_b:
  var qa:int = i[0];
  var ra:int = 0;
  g[10]:short = ra;
  g[18]:byte = ra;
  g[8]:short = qa;
  var sa:int = 16;
  var ta:int = g + sa;
  var ua:int = ta;
  da = ua;
  label B_a:
  var va:int = da;
  var wa:int = va[2]:ushort;
  var xa:int = 0;
  var ya:int = 65535;
  var za:int = wa & ya;
  var ab:int = 65535;
  var bb:int = xa & ab;
  var cb:int = za == bb;
  var db:int = 1;
  var eb:int = cb & db;
  if (eqz(eb)) goto B_i;
  var fb:long = va[0]:long@4;
  a[0] = fb;
  var gb:int = 48;
  var hb:int = g + gb;
  stack_pointer = hb;
  return ;
  label B_i:
  builtin_returnError(b);
  var ib:long = va[0]:long@4;
  a[0] = ib;
  var jb:int = 48;
  var kb:int = g + jb;
  stack_pointer = kb;
}

function unicode_utf8Decode2(a:long_ptr@4, b:int, c:int, d:int) {
  var e:int = stack_pointer;
  var f:int = 32;
  var g:int = e - f;
  stack_pointer = g;
  var h:int = d;
  var i:{ a:ubyte, b:ubyte } = c;
  g[4]:int = d;
  g[3]:int = c;
  var j:int = 2;
  var k:int = h;
  var l:int = j;
  var m:int = k == l;
  debug_assert(m);
  var n:int = 0;
  var o:int = n;
  var p:int = h;
  var q:int = o < p;
  var r:int = 1;
  var s:int = q & r;
  if (eqz(s)) goto B_b;
  goto B_a;
  label B_b:
  var t:int = 0;
  builtin_panicOutOfBounds(t, h);
  unreachable;
  label B_a:
  var u:int = i.a;
  var v:int = -32;
  var w:int = u & v;
  var x:int = 192;
  var y:int = 255;
  var z:int = w & y;
  var aa:int = 255;
  var ba:int = x & aa;
  var ca:int = z == ba;
  debug_assert(ca);
  var da:int = 0;
  var ea:int = da;
  var fa:int = h;
  var ga:int = ea < fa;
  var ha:int = 1;
  var ia:int = ga & ha;
  if (eqz(ia)) goto B_d;
  goto B_c;
  label B_d:
  var ja:int = 0;
  builtin_panicOutOfBounds(ja, h);
  unreachable;
  label B_c:
  var ka:int = i.a;
  var la:int = 31;
  var ma:int = ka & la;
  var na:int = 0;
  g[22]:byte = na;
  g[10]:short = ma;
  var oa:int = 1;
  var pa:int = oa;
  var qa:int = h;
  var ra:int = pa < qa;
  var sa:int = 1;
  var ta:int = ra & sa;
  if (eqz(ta)) goto B_f;
  goto B_e;
  label B_f:
  var ua:int = 1;
  builtin_panicOutOfBounds(ua, h);
  unreachable;
  label B_e:
  var va:int = i.b;
  var wa:int = -64;
  var xa:int = va & wa;
  var ya:int = 128;
  var za:int = 255;
  var ab:int = xa & za;
  var bb:int = 255;
  var cb:int = ya & bb;
  var db:int = ab != cb;
  var eb:int = 1;
  var fb:int = db & eb;
  if (eqz(fb)) goto B_g;
  builtin_returnError(b);
  var gb:long_ptr@4 = 0;
  var hb:long = gb[262486];
  a[0] = hb;
  var ib:int = 32;
  var jb:int = g + ib;
  stack_pointer = jb;
  return ;
  label B_g:
  var kb:int = g[22]:ubyte;
  var lb:int = 16;
  var mb:int = kb << lb;
  var nb:int = g[10]:ushort;
  var ob:int = nb | mb;
  var pb:int = 1;
  var qb:int = 1;
  var rb:int = pb & qb;
  if (eqz(rb)) goto B_i;
  goto B_h;
  label B_i:
  var sb:int = 1049083;
  var tb:int = 42;
  var ub:int = 0;
  var vb:int = 1049952;
  builtin_default_panic(sb, tb, ub, vb);
  unreachable;
  label B_h:
  var wb:int = 6;
  var xb:int = ob << wb;
  g[10]:short = xb;
  var yb:int = 2097088;
  var zb:int = xb & yb;
  var ac:int = 16;
  var bc:int = zb >> ac;
  g[22]:byte = bc;
  var cc:int = g[22]:ubyte;
  var dc:int = cc << ac;
  var ec:int = g[10]:ushort;
  var fc:int = ec | dc;
  var gc:int = 1;
  var hc:int = gc;
  var ic:int = h;
  var jc:int = hc < ic;
  var kc:int = 1;
  var lc:int = jc & kc;
  if (eqz(lc)) goto B_k;
  goto B_j;
  label B_k:
  var mc:int = 1;
  builtin_panicOutOfBounds(mc, h);
  unreachable;
  label B_j:
  var nc:int = i.b;
  var oc:int = 63;
  var pc:int = nc & oc;
  var qc:int = fc | pc;
  g[10]:short = qc;
  var rc:int = 2097151;
  var sc:int = qc & rc;
  var tc:int = 16;
  var uc:int = sc >> tc;
  g[22]:byte = uc;
  var vc:int = g[22]:ubyte;
  var wc:int = vc << tc;
  var xc:int = g[10]:ushort;
  var yc:int = xc | wc;
  var zc:int = 128;
  var ad:int = yc < zc;
  var bd:int = 1;
  var cd:int = ad & bd;
  if (eqz(cd)) goto B_l;
  builtin_returnError(b);
  var dd:long_ptr@4 = 0;
  var ed:long = dd[262490];
  a[0] = ed;
  var fd:int = 32;
  var gd:int = g + fd;
  stack_pointer = gd;
  return ;
  label B_l:
  var hd:int = g[22]:ubyte;
  var id:int = 16;
  var jd:int = hd << id;
  var kd:int = g[10]:ushort;
  var ld:int = kd | jd;
  var md:int = 0;
  g[14]:short = md;
  g[12]:short = kd;
  var nd:int = 2097151;
  var od:int = ld & nd;
  var pd:int = od >> id;
  g[26]:byte = pd;
  var qd:long = g[6]:long@4;
  a[0] = qd;
  var rd:int = 32;
  var sd:int = g + rd;
  stack_pointer = sd;
}

function unicode_utf8Decode3(a:long_ptr@4, b:int, c:int, d:int) {
  var na:int;
  var e:int = stack_pointer;
  var f:int = 48;
  var g:int = e - f;
  stack_pointer = g;
  var h:int = d;
  var i:int = c;
  g[4]:int = d;
  g[3]:int = c;
  var j:int = 20;
  var k:int = g + j;
  var l:int = k;
  unicode_utf8Decode3AllowSurrogateHalf(l, b, i, h);
  var m:int = g[12]:ushort;
  var n:int = 0;
  var o:int = 65535;
  var p:int = m & o;
  var q:int = 65535;
  var r:int = n & q;
  var s:int = p != r;
  var t:int = 1;
  var u:int = s & t;
  if (eqz(u)) goto B_a;
  var v:int = g[12]:ushort;
  g[16]:short = v;
  builtin_returnError(b);
  var w:long = g[7]:long@4;
  a[0] = w;
  var x:int = 48;
  var y:int = g + x;
  stack_pointer = y;
  return ;
  label B_a:
  var z:int = g[22]:ubyte;
  var aa:int = 16;
  var ba:int = z << aa;
  var ca:int = g[10]:ushort;
  var da:int = ca | ba;
  g[18]:short = da;
  var ea:int = da >> aa;
  g[38]:byte = ea;
  var fa:int = 55295;
  var ga:int = da > fa;
  var ha:int = 1;
  var ia:int = ga & ha;
  if (eqz(ia)) goto B_c;
  var ja:int = 2097151;
  var ka:int = da & ja;
  var la:int = 57344;
  var ma:int = ka < la;
  na = ma;
  goto B_b;
  label B_c:
  var oa:int = 0;
  na = oa;
  label B_b:
  var pa:int = na;
  var qa:int = 1;
  var ra:int = pa & qa;
  if (eqz(ra)) goto B_d;
  builtin_returnError(b);
  var sa:long_ptr@4 = 0;
  var ta:long = sa[262492];
  a[0] = ta;
  var ua:int = 48;
  var va:int = g + ua;
  stack_pointer = va;
  return ;
  label B_d:
  var wa:int = 0;
  g[22]:short = wa;
  g[20]:short = da;
  var xa:int = 2097151;
  var ya:int = da & xa;
  var za:int = 16;
  var ab:int = ya >> za;
  g[42]:byte = ab;
  var bb:long = g[10]:long@4;
  a[0] = bb;
  var cb:int = 48;
  var db:int = g + cb;
  stack_pointer = db;
}

function unicode_utf8Decode4(a:long_ptr@4, b:int, c:int, d:int) {
  var e:int = stack_pointer;
  var f:int = 32;
  var g:int = e - f;
  stack_pointer = g;
  var h:int = d;
  var i:{ a:ubyte, b:ubyte, c:ubyte, d:ubyte } = c;
  g[4]:int = d;
  g[3]:int = c;
  var j:int = 4;
  var k:int = h;
  var l:int = j;
  var m:int = k == l;
  debug_assert(m);
  var n:int = 0;
  var o:int = n;
  var p:int = h;
  var q:int = o < p;
  var r:int = 1;
  var s:int = q & r;
  if (eqz(s)) goto B_b;
  goto B_a;
  label B_b:
  var t:int = 0;
  builtin_panicOutOfBounds(t, h);
  unreachable;
  label B_a:
  var u:int = i.a;
  var v:int = -8;
  var w:int = u & v;
  var x:int = 240;
  var y:int = 255;
  var z:int = w & y;
  var aa:int = 255;
  var ba:int = x & aa;
  var ca:int = z == ba;
  debug_assert(ca);
  var da:int = 0;
  var ea:int = da;
  var fa:int = h;
  var ga:int = ea < fa;
  var ha:int = 1;
  var ia:int = ga & ha;
  if (eqz(ia)) goto B_d;
  goto B_c;
  label B_d:
  var ja:int = 0;
  builtin_panicOutOfBounds(ja, h);
  unreachable;
  label B_c:
  var ka:int = i.a;
  var la:int = 7;
  var ma:int = ka & la;
  var na:int = 0;
  g[22]:byte = na;
  g[10]:short = ma;
  var oa:int = 1;
  var pa:int = oa;
  var qa:int = h;
  var ra:int = pa < qa;
  var sa:int = 1;
  var ta:int = ra & sa;
  if (eqz(ta)) goto B_f;
  goto B_e;
  label B_f:
  var ua:int = 1;
  builtin_panicOutOfBounds(ua, h);
  unreachable;
  label B_e:
  var va:int = i.b;
  var wa:int = -64;
  var xa:int = va & wa;
  var ya:int = 128;
  var za:int = 255;
  var ab:int = xa & za;
  var bb:int = 255;
  var cb:int = ya & bb;
  var db:int = ab != cb;
  var eb:int = 1;
  var fb:int = db & eb;
  if (eqz(fb)) goto B_g;
  builtin_returnError(b);
  var gb:long_ptr@4 = 0;
  var hb:long = gb[262494];
  a[0] = hb;
  var ib:int = 32;
  var jb:int = g + ib;
  stack_pointer = jb;
  return ;
  label B_g:
  var kb:int = g[22]:ubyte;
  var lb:int = 16;
  var mb:int = kb << lb;
  var nb:int = g[10]:ushort;
  var ob:int = nb | mb;
  var pb:int = 1;
  var qb:int = 1;
  var rb:int = pb & qb;
  if (eqz(rb)) goto B_i;
  goto B_h;
  label B_i:
  var sb:int = 1049083;
  var tb:int = 42;
  var ub:int = 0;
  var vb:int = 1049984;
  builtin_default_panic(sb, tb, ub, vb);
  unreachable;
  label B_h:
  var wb:int = 6;
  var xb:int = ob << wb;
  g[10]:short = xb;
  var yb:int = 2097088;
  var zb:int = xb & yb;
  var ac:int = 16;
  var bc:int = zb >> ac;
  g[22]:byte = bc;
  var cc:int = g[22]:ubyte;
  var dc:int = cc << ac;
  var ec:int = g[10]:ushort;
  var fc:int = ec | dc;
  var gc:int = 1;
  var hc:int = gc;
  var ic:int = h;
  var jc:int = hc < ic;
  var kc:int = 1;
  var lc:int = jc & kc;
  if (eqz(lc)) goto B_k;
  goto B_j;
  label B_k:
  var mc:int = 1;
  builtin_panicOutOfBounds(mc, h);
  unreachable;
  label B_j:
  var nc:int = i.b;
  var oc:int = 63;
  var pc:int = nc & oc;
  var qc:int = fc | pc;
  g[10]:short = qc;
  var rc:int = 2097151;
  var sc:int = qc & rc;
  var tc:int = 16;
  var uc:int = sc >> tc;
  g[22]:byte = uc;
  var vc:int = 2;
  var wc:int = vc;
  var xc:int = h;
  var yc:int = wc < xc;
  var zc:int = 1;
  var ad:int = yc & zc;
  if (eqz(ad)) goto B_m;
  goto B_l;
  label B_m:
  var bd:int = 2;
  builtin_panicOutOfBounds(bd, h);
  unreachable;
  label B_l:
  var cd:int = i.c;
  var dd:int = -64;
  var ed:int = cd & dd;
  var fd:int = 128;
  var gd:int = 255;
  var hd:int = ed & gd;
  var id:int = 255;
  var jd:int = fd & id;
  var kd:int = hd != jd;
  var ld:int = 1;
  var md:int = kd & ld;
  if (eqz(md)) goto B_n;
  builtin_returnError(b);
  var nd:long_ptr@4 = 0;
  var od:long = nd[262494];
  a[0] = od;
  var pd:int = 32;
  var qd:int = g + pd;
  stack_pointer = qd;
  return ;
  label B_n:
  var rd:int = g[22]:ubyte;
  var sd:int = 16;
  var td:int = rd << sd;
  var ud:int = g[10]:ushort;
  var vd:int = ud | td;
  var wd:int = 1;
  var xd:int = 1;
  var yd:int = wd & xd;
  if (eqz(yd)) goto B_p;
  goto B_o;
  label B_p:
  var zd:int = 1049083;
  var ae:int = 42;
  var be:int = 0;
  var ce:int = 1049984;
  builtin_default_panic(zd, ae, be, ce);
  unreachable;
  label B_o:
  var de:int = 6;
  var ee:int = vd << de;
  g[10]:short = ee;
  var fe:int = 2097088;
  var ge:int = ee & fe;
  var he:int = 16;
  var ie:int = ge >> he;
  g[22]:byte = ie;
  var je:int = g[22]:ubyte;
  var ke:int = je << he;
  var le:int = g[10]:ushort;
  var me:int = le | ke;
  var ne:int = 2;
  var oe:int = ne;
  var pe:int = h;
  var qe:int = oe < pe;
  var re:int = 1;
  var se:int = qe & re;
  if (eqz(se)) goto B_r;
  goto B_q;
  label B_r:
  var te:int = 2;
  builtin_panicOutOfBounds(te, h);
  unreachable;
  label B_q:
  var ue:int = i.c;
  var ve:int = 63;
  var we:int = ue & ve;
  var xe:int = me | we;
  g[10]:short = xe;
  var ye:int = 2097151;
  var ze:int = xe & ye;
  var af:int = 16;
  var bf:int = ze >> af;
  g[22]:byte = bf;
  var cf:int = 3;
  var df:int = cf;
  var ef:int = h;
  var ff:int = df < ef;
  var gf:int = 1;
  var hf:int = ff & gf;
  if (eqz(hf)) goto B_t;
  goto B_s;
  label B_t:
  var if:int = 3;
  builtin_panicOutOfBounds(if, h);
  unreachable;
  label B_s:
  var jf:int = i.d;
  var kf:int = -64;
  var lf:int = jf & kf;
  var mf:int = 128;
  var nf:int = 255;
  var of:int = lf & nf;
  var pf:int = 255;
  var qf:int = mf & pf;
  var rf:int = of != qf;
  var sf:int = 1;
  var tf:int = rf & sf;
  if (eqz(tf)) goto B_u;
  builtin_returnError(b);
  var uf:long_ptr@4 = 0;
  var vf:long = uf[262494];
  a[0] = vf;
  var wf:int = 32;
  var xf:int = g + wf;
  stack_pointer = xf;
  return ;
  label B_u:
  var yf:int = g[22]:ubyte;
  var zf:int = 16;
  var ag:int = yf << zf;
  var bg:int = g[10]:ushort;
  var cg:int = bg | ag;
  var dg:int = 1;
  var eg:int = 1;
  var fg:int = dg & eg;
  if (eqz(fg)) goto B_w;
  goto B_v;
  label B_w:
  var gg:int = 1049083;
  var hg:int = 42;
  var ig:int = 0;
  var jg:int = 1049984;
  builtin_default_panic(gg, hg, ig, jg);
  unreachable;
  label B_v:
  var kg:int = 6;
  var lg:int = cg << kg;
  g[10]:short = lg;
  var mg:int = 2097088;
  var ng:int = lg & mg;
  var og:int = 16;
  var pg:int = ng >> og;
  g[22]:byte = pg;
  var qg:int = g[22]:ubyte;
  var rg:int = qg << og;
  var sg:int = g[10]:ushort;
  var tg:int = sg | rg;
  var ug:int = 3;
  var vg:int = ug;
  var wg:int = h;
  var xg:int = vg < wg;
  var yg:int = 1;
  var zg:int = xg & yg;
  if (eqz(zg)) goto B_y;
  goto B_x;
  label B_y:
  var ah:int = 3;
  builtin_panicOutOfBounds(ah, h);
  unreachable;
  label B_x:
  var bh:int = i.d;
  var ch:int = 63;
  var dh:int = bh & ch;
  var eh:int = tg | dh;
  g[10]:short = eh;
  var fh:int = 2097151;
  var gh:int = eh & fh;
  var hh:int = 16;
  var ih:int = gh >> hh;
  g[22]:byte = ih;
  var jh:int = g[22]:ubyte;
  var kh:int = jh << hh;
  var lh:int = g[10]:ushort;
  var mh:int = lh | kh;
  var nh:int = 65536;
  var oh:int = mh < nh;
  var ph:int = 1;
  var qh:int = oh & ph;
  if (eqz(qh)) goto B_z;
  builtin_returnError(b);
  var rh:long_ptr@4 = 0;
  var sh:long = rh[262498];
  a[0] = sh;
  var th:int = 32;
  var uh:int = g + th;
  stack_pointer = uh;
  return ;
  label B_z:
  var vh:int = g[22]:ubyte;
  var wh:int = 16;
  var xh:int = vh << wh;
  var yh:int = g[10]:ushort;
  var zh:int = yh | xh;
  var ai:int = 1114111;
  var bi:int = zh > ai;
  var ci:int = 1;
  var di:int = bi & ci;
  if (eqz(di)) goto B_aa;
  builtin_returnError(b);
  var ei:long_ptr@4 = 0;
  var fi:long = ei[262500];
  a[0] = fi;
  var gi:int = 32;
  var hi:int = g + gi;
  stack_pointer = hi;
  return ;
  label B_aa:
  var ii:int = g[22]:ubyte;
  var ji:int = 16;
  var ki:int = ii << ji;
  var li:int = g[10]:ushort;
  var mi:int = li | ki;
  var ni:int = 0;
  g[14]:short = ni;
  g[12]:short = li;
  var oi:int = 2097151;
  var pi:int = mi & oi;
  var qi:int = pi >> ji;
  g[26]:byte = qi;
  var ri:long = g[6]:long@4;
  a[0] = ri;
  var si:int = 32;
  var ti:int = g + si;
  stack_pointer = ti;
}

function unicode_utf8EncodeImpl_anon_2242(a:int_ptr@2, b:int, c:int, d:int, e:int) {
  var ab:int;
  var ra:int;
  var f:int = stack_pointer;
  var g:int = 112;
  var h:int = f - g;
  stack_pointer = h;
  var i:int = e;
  var j:int = d;
  h[2]:short = c;
  var k:int = 2097151;
  var l:int = c & k;
  var m:int = 16;
  var n:int = l >> m;
  h[6]:byte = n;
  h[3]:int = e;
  h[2]:int = d;
  var o:int = 18;
  var p:int = h + o;
  p;
  var q:int = 18;
  var r:int = h + q;
  unicode_utf8CodepointSequenceLength(r, b, c);
  var s:int = h[9]:ushort;
  var t:int = 0;
  var u:int = 65535;
  var v:int = s & u;
  var w:int = 65535;
  var x:int = t & w;
  var y:int = v != x;
  var z:int = 1;
  var aa:int = y & z;
  if (eqz(aa)) goto B_a;
  var ba:int = h[9]:ushort;
  h[11]:short = ba;
  builtin_returnError(b);
  var ca:int = h[11]:int@2;
  a[0] = ca;
  var da:int = 112;
  var ea:int = h + da;
  stack_pointer = ea;
  return ;
  label B_a:
  var fa:int = h[20]:ubyte;
  h[27]:byte = fa;
  var ga:int = i >= fa;
  debug_assert(ga);
  var ha:int = 4;
  var ia:int = fa + ha;
  var ja:int = 7;
  var ka:int = ia & ja;
  var la:int = 0;
  if (la) goto B_j;
  br_table[B_f, B_j, B_j, B_j, B_j, B_i, B_h, B_g, ..B_f](ka);
  label B_j:
  var ma:int = 1049193;
  var na:int = 24;
  var oa:int = 0;
  var pa:int = 1049924;
  builtin_default_panic(ma, na, oa, pa);
  unreachable;
  label B_i:
  h[7]:int = j;
  h[8]:int = i;
  var qa:int = h[8]:int;
  ra = h[7]:int;
  var sa:int = 0;
  var ta:int = sa;
  var ua:int = qa;
  var va:int = ta < ua;
  var wa:int = 1;
  var xa:int = va & wa;
  if (eqz(xa)) goto B_k;
  goto B_c;
  label B_k:
  var ya:int = 0;
  builtin_panicOutOfBounds(ya, qa);
  unreachable;
  label B_h:
  h[9]:int = j;
  h[10]:int = i;
  var za:int = h[10]:int;
  ab = h[9]:int;
  var bb:int = 0;
  var cb:int = bb;
  var db:int = za;
  var eb:int = cb < db;
  var fb:int = 1;
  var gb:int = eb & fb;
  if (eqz(gb)) goto B_l;
  goto B_d;
  label B_l:
  var hb:int = 0;
  builtin_panicOutOfBounds(hb, za);
  unreachable;
  label B_g:
  var ib:int = unicode_isSurrogateCodepoint(c);
  var jb:int = 1;
  var kb:int = ib & jb;
  if (eqz(kb)) goto B_m;
  builtin_returnError(b);
  var lb:int_ptr@2 = 0;
  var mb:int = lb[524966];
  a[0] = mb;
  var nb:int = 112;
  var ob:int = h + nb;
  stack_pointer = ob;
  return ;
  label B_m:
  goto B_e;
  label B_f:
  h[19]:int = j;
  h[20]:int = i;
  var pb:int = h[20]:int;
  var qb:int = h[19]:int;
  var rb:int = 0;
  var sb:int = rb;
  var tb:int = pb;
  var ub:int = sb < tb;
  var vb:int = 1;
  var wb:int = ub & vb;
  if (eqz(wb)) goto B_o;
  goto B_n;
  label B_o:
  var xb:int = 0;
  builtin_panicOutOfBounds(xb, pb);
  unreachable;
  label B_n:
  var yb:byte_ptr = qb;
  var zb:int = 1835008;
  var ac:int = c & zb;
  var bc:int = 18;
  var cc:int = ac >> bc;
  var dc:int = 1;
  var ec:int = 1;
  var fc:int = dc & ec;
  if (eqz(fc)) goto B_q;
  goto B_p;
  label B_q:
  var gc:int = 1049083;
  var hc:int = 42;
  var ic:int = 0;
  var jc:int = 1049924;
  builtin_default_panic(gc, hc, ic, jc);
  unreachable;
  label B_p:
  var kc:int = 240;
  var lc:int = cc | kc;
  var mc:int = 2097151;
  var nc:int = lc & mc;
  var oc:int = 256;
  var pc:int = nc < oc;
  var qc:int = 1;
  var rc:int = pc & qc;
  if (eqz(rc)) goto B_s;
  goto B_r;
  label B_s:
  var sc:int = 1048790;
  var tc:int = 27;
  var uc:int = 0;
  var vc:int = 1049924;
  builtin_default_panic(sc, tc, uc, vc);
  unreachable;
  label B_r:
  yb[0] = lc;
  h[22]:int = i;
  h[21]:int = j;
  var wc:int = h[22]:int;
  var xc:int = h[21]:int;
  var yc:int = 1;
  var zc:int = yc;
  var ad:int = wc;
  var bd:int = zc < ad;
  var cd:int = 1;
  var dd:int = bd & cd;
  if (eqz(dd)) goto B_u;
  goto B_t;
  label B_u:
  var ed:int = 1;
  builtin_panicOutOfBounds(ed, wc);
  unreachable;
  label B_t:
  var fd:int = 1;
  var gd:byte_ptr = xc + fd;
  var hd:int = 2093056;
  var id:int = c & hd;
  var jd:int = 12;
  var kd:int = id >> jd;
  var ld:int = 1;
  var md:int = fd & ld;
  if (eqz(md)) goto B_w;
  goto B_v;
  label B_w:
  var nd:int = 1049083;
  var od:int = 42;
  var pd:int = 0;
  var qd:int = 1049924;
  builtin_default_panic(nd, od, pd, qd);
  unreachable;
  label B_v:
  var rd:int = 63;
  var sd:int = kd & rd;
  var td:int = 128;
  var ud:int = sd | td;
  var vd:int = 256;
  var wd:int = ud < vd;
  var xd:int = 1;
  var yd:int = wd & xd;
  if (eqz(yd)) goto B_y;
  goto B_x;
  label B_y:
  var zd:int = 1048790;
  var ae:int = 27;
  var be:int = 0;
  var ce:int = 1049924;
  builtin_default_panic(zd, ae, be, ce);
  unreachable;
  label B_x:
  gd[0] = ud;
  h[24]:int = i;
  h[23]:int = j;
  var de:int = h[24]:int;
  var ee:int = h[23]:int;
  var fe:int = 2;
  var ge:int = fe;
  var he:int = de;
  var ie:int = ge < he;
  var je:int = 1;
  var ke:int = ie & je;
  if (eqz(ke)) goto B_aa;
  goto B_z;
  label B_aa:
  var le:int = 2;
  builtin_panicOutOfBounds(le, de);
  unreachable;
  label B_z:
  var me:int = 2;
  var ne:byte_ptr = ee + me;
  var oe:int = 2097088;
  var pe:int = c & oe;
  var qe:int = 6;
  var re:int = pe >> qe;
  var se:int = 1;
  var te:int = 1;
  var ue:int = se & te;
  if (eqz(ue)) goto B_ca;
  goto B_ba;
  label B_ca:
  var ve:int = 1049083;
  var we:int = 42;
  var xe:int = 0;
  var ye:int = 1049924;
  builtin_default_panic(ve, we, xe, ye);
  unreachable;
  label B_ba:
  var ze:int = 63;
  var af:int = re & ze;
  var bf:int = 128;
  var cf:int = af | bf;
  var df:int = 256;
  var ef:int = cf < df;
  var ff:int = 1;
  var gf:int = ef & ff;
  if (eqz(gf)) goto B_ea;
  goto B_da;
  label B_ea:
  var hf:int = 1048790;
  var if:int = 27;
  var jf:int = 0;
  var kf:int = 1049924;
  builtin_default_panic(hf, if, jf, kf);
  unreachable;
  label B_da:
  ne[0] = cf;
  h[26]:int = i;
  h[25]:int = j;
  var lf:int = h[26]:int;
  var mf:int = h[25]:int;
  var nf:int = 3;
  var of:int = nf;
  var pf:int = lf;
  var qf:int = of < pf;
  var rf:int = 1;
  var sf:int = qf & rf;
  if (eqz(sf)) goto B_ga;
  goto B_fa;
  label B_ga:
  var tf:int = 3;
  builtin_panicOutOfBounds(tf, lf);
  unreachable;
  label B_fa:
  var uf:int = 3;
  var vf:byte_ptr = mf + uf;
  var wf:int = 63;
  var xf:int = c & wf;
  var yf:int = 128;
  var zf:int = xf | yf;
  var ag:int = 256;
  var bg:int = zf < ag;
  var cg:int = 1;
  var dg:int = bg & cg;
  if (eqz(dg)) goto B_ia;
  goto B_ha;
  label B_ia:
  var eg:int = 1048790;
  var fg:int = 27;
  var gg:int = 0;
  var hg:int = 1049924;
  builtin_default_panic(eg, fg, gg, hg);
  unreachable;
  label B_ha:
  var ig:int = zf;
  vf[0] = ig;
  goto B_b;
  label B_e:
  h[13]:int = j;
  h[14]:int = i;
  var jg:int = h[14]:int;
  var kg:int = h[13]:int;
  var lg:int = 0;
  var mg:int = lg;
  var ng:int = jg;
  var og:int = mg < ng;
  var pg:int = 1;
  var qg:int = og & pg;
  if (eqz(qg)) goto B_ka;
  goto B_ja;
  label B_ka:
  var rg:int = 0;
  builtin_panicOutOfBounds(rg, jg);
  unreachable;
  label B_ja:
  var sg:byte_ptr = kg;
  var tg:int = 2093056;
  var ug:int = c & tg;
  var vg:int = 12;
  var wg:int = ug >> vg;
  var xg:int = 1;
  var yg:int = 1;
  var zg:int = xg & yg;
  if (eqz(zg)) goto B_ma;
  goto B_la;
  label B_ma:
  var ah:int = 1049083;
  var bh:int = 42;
  var ch:int = 0;
  var dh:int = 1049924;
  builtin_default_panic(ah, bh, ch, dh);
  unreachable;
  label B_la:
  var eh:int = 224;
  var fh:int = wg | eh;
  var gh:int = 2097151;
  var hh:int = fh & gh;
  var ih:int = 256;
  var jh:int = hh < ih;
  var kh:int = 1;
  var lh:int = jh & kh;
  if (eqz(lh)) goto B_oa;
  goto B_na;
  label B_oa:
  var mh:int = 1048790;
  var nh:int = 27;
  var oh:int = 0;
  var ph:int = 1049924;
  builtin_default_panic(mh, nh, oh, ph);
  unreachable;
  label B_na:
  sg[0] = fh;
  h[16]:int = i;
  h[15]:int = j;
  var qh:int = h[16]:int;
  var rh:int = h[15]:int;
  var sh:int = 1;
  var th:int = sh;
  var uh:int = qh;
  var vh:int = th < uh;
  var wh:int = 1;
  var xh:int = vh & wh;
  if (eqz(xh)) goto B_qa;
  goto B_pa;
  label B_qa:
  var yh:int = 1;
  builtin_panicOutOfBounds(yh, qh);
  unreachable;
  label B_pa:
  var zh:int = 1;
  var ai:byte_ptr = rh + zh;
  var bi:int = 2097088;
  var ci:int = c & bi;
  var di:int = 6;
  var ei:int = ci >> di;
  var fi:int = 1;
  var gi:int = zh & fi;
  if (eqz(gi)) goto B_sa;
  goto B_ra;
  label B_sa:
  var hi:int = 1049083;
  var ii:int = 42;
  var ji:int = 0;
  var ki:int = 1049924;
  builtin_default_panic(hi, ii, ji, ki);
  unreachable;
  label B_ra:
  var li:int = 63;
  var mi:int = ei & li;
  var ni:int = 128;
  var oi:int = mi | ni;
  var pi:int = 256;
  var qi:int = oi < pi;
  var ri:int = 1;
  var si:int = qi & ri;
  if (eqz(si)) goto B_ua;
  goto B_ta;
  label B_ua:
  var ti:int = 1048790;
  var ui:int = 27;
  var vi:int = 0;
  var wi:int = 1049924;
  builtin_default_panic(ti, ui, vi, wi);
  unreachable;
  label B_ta:
  ai[0] = oi;
  h[18]:int = i;
  h[17]:int = j;
  var xi:int = h[18]:int;
  var yi:int = h[17]:int;
  var zi:int = 2;
  var aj:int = zi;
  var bj:int = xi;
  var cj:int = aj < bj;
  var dj:int = 1;
  var ej:int = cj & dj;
  if (eqz(ej)) goto B_wa;
  goto B_va;
  label B_wa:
  var fj:int = 2;
  builtin_panicOutOfBounds(fj, xi);
  unreachable;
  label B_va:
  var gj:int = 2;
  var hj:byte_ptr = yi + gj;
  var ij:int = 63;
  var jj:int = c & ij;
  var kj:int = 128;
  var lj:int = jj | kj;
  var mj:int = 256;
  var nj:int = lj < mj;
  var oj:int = 1;
  var pj:int = nj & oj;
  if (eqz(pj)) goto B_ya;
  goto B_xa;
  label B_ya:
  var qj:int = 1048790;
  var rj:int = 27;
  var sj:int = 0;
  var tj:int = 1049924;
  builtin_default_panic(qj, rj, sj, tj);
  unreachable;
  label B_xa:
  var uj:int = lj;
  hj[0] = uj;
  goto B_b;
  label B_d:
  var vj:byte_ptr = ab;
  var wj:int = 2097088;
  var xj:int = c & wj;
  var yj:int = 6;
  var zj:int = xj >> yj;
  var ak:int = 1;
  var bk:int = 1;
  var ck:int = ak & bk;
  if (eqz(ck)) goto B_ab;
  goto B_za;
  label B_ab:
  var dk:int = 1049083;
  var ek:int = 42;
  var fk:int = 0;
  var gk:int = 1049924;
  builtin_default_panic(dk, ek, fk, gk);
  unreachable;
  label B_za:
  var hk:int = 192;
  var ik:int = zj | hk;
  var jk:int = 2097151;
  var kk:int = ik & jk;
  var lk:int = 256;
  var mk:int = kk < lk;
  var nk:int = 1;
  var ok:int = mk & nk;
  if (eqz(ok)) goto B_cb;
  goto B_bb;
  label B_cb:
  var pk:int = 1048790;
  var qk:int = 27;
  var rk:int = 0;
  var sk:int = 1049924;
  builtin_default_panic(pk, qk, rk, sk);
  unreachable;
  label B_bb:
  vj[0] = ik;
  h[12]:int = i;
  h[11]:int = j;
  var tk:int = h[12]:int;
  var uk:int = h[11]:int;
  var vk:int = 1;
  var wk:int = vk;
  var xk:int = tk;
  var yk:int = wk < xk;
  var zk:int = 1;
  var al:int = yk & zk;
  if (eqz(al)) goto B_eb;
  goto B_db;
  label B_eb:
  var bl:int = 1;
  builtin_panicOutOfBounds(bl, tk);
  unreachable;
  label B_db:
  var cl:int = 1;
  var dl:byte_ptr = uk + cl;
  var el:int = 63;
  var fl:int = c & el;
  var gl:int = 128;
  var hl:int = fl | gl;
  var il:int = 256;
  var jl:int = hl < il;
  var kl:int = 1;
  var ll:int = jl & kl;
  if (eqz(ll)) goto B_gb;
  goto B_fb;
  label B_gb:
  var ml:int = 1048790;
  var nl:int = 27;
  var ol:int = 0;
  var pl:int = 1049924;
  builtin_default_panic(ml, nl, ol, pl);
  unreachable;
  label B_fb:
  var ql:int = hl;
  dl[0] = ql;
  goto B_b;
  label B_c:
  var rl:byte_ptr = ra;
  var sl:int = 2097151;
  var tl:int = c & sl;
  var ul:int = 256;
  var vl:int = tl < ul;
  var wl:int = 1;
  var xl:int = vl & wl;
  if (eqz(xl)) goto B_ib;
  goto B_hb;
  label B_ib:
  var yl:int = 1048790;
  var zl:int = 27;
  var am:int = 0;
  var bm:int = 1049924;
  builtin_default_panic(yl, zl, am, bm);
  unreachable;
  label B_hb:
  var cm:int = c;
  rl[0] = cm;
  label B_b:
  var dm:int = 0;
  h[54]:short = dm;
  var em:int = 7;
  var fm:int = fa & em;
  h[110]:byte = fm;
  var gm:int = h[54]:int@2;
  a[0] = gm;
  var hm:int = 112;
  var im:int = h + hm;
  stack_pointer = im;
}

function fmt_formatInt_anon_2241(a:int, b:int, c:int, d:int, e:int, f:int):int {
  var ra:int;
  var ee:int;
  var ke:int;
  var se:int;
  var g:int = stack_pointer;
  var h:int = 96;
  var i:int = g - h;
  stack_pointer = i;
  i[3]:int = b;
  i[18]:byte = c;
  var j:int = 255;
  var k:int = c & j;
  var l:int = 1;
  var m:int = d & l;
  i[19]:byte = m;
  var n:int = k > l;
  debug_assert(n);
  i[5]:int = b;
  var o:int = 32;
  i[27]:byte = o;
  i[7]:int = b;
  var p:int = 64;
  var q:byte_ptr = i + p;
  var r:int = -86;
  q[0] = r;
  var s:int = 56;
  var t:long_ptr = i + s;
  var u:long = -6148914691236517206L;
  t[0] = u;
  var v:int = 48;
  var w:long_ptr = i + v;
  w[0] = u;
  var x:int = 40;
  var y:long_ptr = i + x;
  y[0] = u;
  i[4]:long = u;
  i[18]:int = b;
  var z:int = 33;
  i[19]:int = z;
  var aa:int = 10;
  var ba:int = 255;
  var ca:int = c & ba;
  var da:int = 255;
  var ea:int = aa & da;
  var fa:int = ca == ea;
  var ga:int = 1;
  var ha:int = fa & ga;
  if (eqz(ha)) goto B_e;
  goto B_d;
  label B_e:
  goto B_c;
  label B_d:
  loop L_f {
    var ia:int = i[18]:int;
    var ja:int = 100;
    var ka:int = ia;
    var la:int = ja;
    var ma:int = ka >= la;
    var na:int = 1;
    var oa:int = ma & na;
    if (eqz(oa)) goto B_i;
    var pa:int = i[19]:int;
    var qa:int = -2;
    ra = pa + qa;
    var sa:int = ra > pa;
    var ta:int = 1;
    var ua:int = sa & ta;
    if (ua) goto B_h;
    goto B_g;
    label B_i:
    goto B_b;
    label B_h:
    var va:int = 1048710;
    var wa:int = 16;
    var xa:int = 0;
    var ya:int = 1049468;
    builtin_default_panic(va, wa, xa, ya);
    unreachable;
    label B_g:
    i[19]:int = ra;
    var za:int = i[19]:int;
    var ab:int = 32;
    var bb:int = i + ab;
    var cb:int = bb;
    var db:short_ptr@1 = cb + za;
    var eb:int = 2;
    var fb:int = za + eb;
    var gb:int = 33;
    var hb:int = fb;
    var ib:int = gb;
    var jb:int = hb <= ib;
    var kb:int = 1;
    var lb:int = jb & kb;
    if (eqz(lb)) goto B_k;
    goto B_j;
    label B_k:
    var mb:int = 33;
    builtin_panicOutOfBounds(fb, mb);
    unreachable;
    label B_j:
    var nb:int = i[18]:int;
    var ob:int = 100;
    var pb:int = nb % ob;
    var qb:int = 80;
    var rb:int = i + qb;
    var sb:int = rb;
    fmt_digits2(sb, pb);
    var tb:int = i[80]:ushort@1;
    db[0] = tb;
    var ub:int = i[18]:int;
    var vb:int = 100;
    var wb:int = ub / vb;
    i[18]:int = wb;
    continue L_f;
  }
  label B_c:
  loop L_l {
    var xb:int = i[18]:int;
    var yb:int = 255;
    var zb:int = c & yb;
    if (eqz(zb)) goto B_n;
    goto B_m;
    label B_n:
    var ac:int = 1048934;
    var bc:int = 16;
    var cc:int = 0;
    var dc:int = 1049888;
    builtin_default_panic(ac, bc, cc, dc);
    unreachable;
    label B_m:
    var ec:int = xb % zb;
    i[21]:int = ec;
    var fc:int = i[19]:int;
    var gc:int = -1;
    var hc:int = fc + gc;
    var ic:int = hc > fc;
    var jc:int = 1;
    var kc:int = ic & jc;
    if (eqz(kc)) goto B_o;
    var lc:int = 1048710;
    var mc:int = 16;
    var nc:int = 0;
    var oc:int = 1049468;
    builtin_default_panic(lc, mc, nc, oc);
    unreachable;
    label B_o:
    i[19]:int = hc;
    var pc:int = i[19]:int;
    var qc:int = 33;
    var rc:int = pc;
    var sc:int = qc;
    var tc:int = rc < sc;
    var uc:int = 1;
    var vc:int = tc & uc;
    if (eqz(vc)) goto B_q;
    goto B_p;
    label B_q:
    var wc:int = 33;
    builtin_panicOutOfBounds(pc, wc);
    unreachable;
    label B_p:
    var xc:int = 32;
    var yc:int = i + xc;
    var zc:int = yc;
    var ad:byte_ptr = zc + pc;
    var bd:int = 255;
    var cd:int = ec;
    var dd:int = bd;
    var ed:int = cd <= dd;
    var fd:int = 1;
    var gd:int = ed & fd;
    if (eqz(gd)) goto B_s;
    goto B_r;
    label B_s:
    var hd:int = 1048790;
    var id:int = 27;
    var jd:int = 0;
    var kd:int = 1049888;
    builtin_default_panic(hd, id, jd, kd);
    unreachable;
    label B_r:
    var ld:int = fmt_digitToChar(ec, d);
    ad[0] = ld;
    var md:int = i[18]:int;
    var nd:int = 255;
    var od:int = c & nd;
    if (eqz(od)) goto B_u;
    goto B_t;
    label B_u:
    var pd:int = 1048934;
    var qd:int = 16;
    var rd:int = 0;
    var sd:int = 1049888;
    builtin_default_panic(pd, qd, rd, sd);
    unreachable;
    label B_t:
    var td:int = md / od;
    i[18]:int = td;
    var ud:int = i[18]:int;
    if (ud) goto B_w;
    goto B_v;
    label B_w:
    continue L_l;
    label B_v:
  }
  goto B_a;
  label B_b:
  var vd:int = i[18]:int;
  var wd:int = 10;
  var xd:int = vd;
  var yd:int = wd;
  var zd:int = xd < yd;
  var ae:int = 1;
  var be:int = zd & ae;
  if (eqz(be)) goto B_da;
  var ce:int = i[19]:int;
  var de:int = -1;
  ee = ce + de;
  var fe:int = ee > ce;
  var ge:int = 1;
  var he:int = fe & ge;
  if (he) goto B_ca;
  goto B_ba;
  label B_da:
  var ie:int = i[19]:int;
  var je:int = -2;
  ke = ie + je;
  var le:int = ke > ie;
  var me:int = 1;
  var ne:int = le & me;
  if (ne) goto B_aa;
  goto B_z;
  label B_ca:
  var oe:int = 1048710;
  var pe:int = 16;
  var qe:int = 0;
  var re:int = 1049468;
  builtin_default_panic(oe, pe, qe, re);
  unreachable;
  label B_ba:
  i[19]:int = ee;
  se = i[19]:int;
  var te:int = 33;
  var ue:int = se;
  var ve:int = te;
  var we:int = ue < ve;
  var xe:int = 1;
  var ye:int = we & xe;
  if (eqz(ye)) goto B_ea;
  goto B_y;
  label B_ea:
  var ze:int = 33;
  builtin_panicOutOfBounds(se, ze);
  unreachable;
  label B_aa:
  var af:int = 1048710;
  var bf:int = 16;
  var cf:int = 0;
  var df:int = 1049468;
  builtin_default_panic(af, bf, cf, df);
  unreachable;
  label B_z:
  i[19]:int = ke;
  var ef:int = i[19]:int;
  var ff:int = 32;
  var gf:int = i + ff;
  var hf:int = gf;
  var if:short_ptr@1 = hf + ef;
  var jf:int = 2;
  var kf:int = ef + jf;
  var lf:int = 33;
  var mf:int = kf;
  var nf:int = lf;
  var of:int = mf <= nf;
  var pf:int = 1;
  var qf:int = of & pf;
  if (eqz(qf)) goto B_ga;
  goto B_fa;
  label B_ga:
  var rf:int = 33;
  builtin_panicOutOfBounds(kf, rf);
  unreachable;
  label B_fa:
  var sf:int = i[18]:int;
  var tf:int = 82;
  var uf:int = i + tf;
  var vf:int = uf;
  fmt_digits2(vf, sf);
  var wf:int = i[82]:ushort@1;
  if[0] = wf;
  goto B_x;
  label B_y:
  var xf:int = 32;
  var yf:int = i + xf;
  var zf:int = yf;
  var ag:byte_ptr = zf + se;
  var bg:int = i[18]:int;
  var cg:int = 255;
  var dg:int = bg;
  var eg:int = cg;
  var fg:int = dg <= eg;
  var gg:int = 1;
  var hg:int = fg & gg;
  if (eqz(hg)) goto B_ia;
  goto B_ha;
  label B_ia:
  var ig:int = 1048790;
  var jg:int = 27;
  var kg:int = 0;
  var lg:int = 1049888;
  builtin_default_panic(ig, jg, kg, lg);
  unreachable;
  label B_ha:
  var mg:int = 255;
  var ng:int = bg & mg;
  var og:int = 48;
  var pg:int = ng + og;
  var qg:int = pg & mg;
  var rg:int = qg != pg;
  var sg:int = 1;
  var tg:int = rg & sg;
  if (eqz(tg)) goto B_ja;
  var ug:int = 1048710;
  var vg:int = 16;
  var wg:int = 0;
  var xg:int = 1049468;
  builtin_default_panic(ug, vg, wg, xg);
  unreachable;
  label B_ja:
  var yg:int = pg;
  ag[0] = yg;
  label B_x:
  label B_a:
  var zg:int = i[19]:int;
  var ah:int = 32;
  var bh:int = i + ah;
  var ch:int = bh;
  var dh:int = ch + zg;
  var eh:int = 33;
  var fh:int = zg;
  var gh:int = eh;
  var hh:int = fh <= gh;
  var ih:int = 1;
  var jh:int = hh & ih;
  if (eqz(jh)) goto B_la;
  goto B_ka;
  label B_la:
  var kh:int = 33;
  builtin_panicStartGreaterThanEnd(zg, kh);
  unreachable;
  label B_ka:
  var lh:int = 33;
  var mh:int = lh - zg;
  var nh:int = 33;
  var oh:int = nh;
  var ph:int = nh;
  var qh:int = oh <= ph;
  var rh:int = 1;
  var sh:int = qh & rh;
  if (eqz(sh)) goto B_na;
  goto B_ma;
  label B_na:
  var th:int = 33;
  builtin_panicOutOfBounds(th, th);
  unreachable;
  label B_ma:
  var uh:int = 33;
  var vh:int = zg;
  var wh:int = uh;
  var xh:int = vh <= wh;
  var yh:int = 1;
  var zh:int = xh & yh;
  if (eqz(zh)) goto B_pa;
  goto B_oa;
  label B_pa:
  var ai:int = 33;
  builtin_panicOutOfBounds(zg, ai);
  unreachable;
  label B_oa:
  i[23]:int = mh;
  i[22]:int = dh;
  var bi:int = i[23]:int;
  var ci:int = i[22]:int;
  var di:int = fmt_formatBuf_anon_2234(a, ci, bi, e, f);
  var ei:int = 0;
  var fi:int = 65535;
  var gi:int = di & fi;
  var hi:int = 65535;
  var ii:int = ei & hi;
  var ji:int = gi == ii;
  var ki:int = 1;
  var li:int = ji & ki;
  if (eqz(li)) goto B_qa;
  var mi:int = 96;
  var ni:int = i + mi;
  stack_pointer = ni;
  return di;
  label B_qa:
  builtin_returnError(a);
  var oi:int = 96;
  var pi:int = i + oi;
  stack_pointer = pi;
  return di;
}

function fmt_digits2(a:short_ptr@1, b:int) {
  var c:int = stack_pointer;
  var d:int = 16;
  var e:int_ptr = c - d;
  stack_pointer = e;
  e[3] = b;
  var f:int = b + b;
  var g:int = f < b;
  var h:int = 1;
  var i:int = g & h;
  if (eqz(i)) goto B_a;
  var j:int = 1048710;
  var k:int = 16;
  var l:int = 0;
  var m:int = 1049468;
  builtin_default_panic(j, k, l, m);
  unreachable;
  label B_a:
  var n:int = 1049218;
  var o:ushort_ptr@1 = n + f;
  var p:int = 2;
  var q:int = f + p;
  var r:int = 201;
  var s:int = q;
  var t:int = r;
  var u:int = s <= t;
  var v:int = 1;
  var w:int = u & v;
  if (eqz(w)) goto B_c;
  goto B_b;
  label B_c:
  var x:int = 201;
  builtin_panicOutOfBounds(q, x);
  unreachable;
  label B_b:
  var y:int = o[0];
  a[0] = y;
  var z:int = 16;
  var aa:int = e + z;
  stack_pointer = aa;
}

function fmt_digitToChar(a:int, b:int):int {
  var z:int;
  var mb:int;
  var ya:int;
  var c:int = stack_pointer;
  var d:int = 16;
  var e:byte_ptr = c - d;
  stack_pointer = e;
  e[14] = a;
  var f:int = 1;
  var g:int = b & f;
  e[15] = g;
  var h:int = 0;
  var i:int = 255;
  var j:int = a & i;
  var k:int = 255;
  var l:int = h & k;
  var m:int = j >= l;
  var n:int = 9;
  var o:int = 255;
  var p:int = a & o;
  var q:int = 255;
  var r:int = n & q;
  var s:int = p <= r;
  var t:int = m & s;
  var u:int = 1;
  var v:int = t & u;
  if (eqz(v)) goto B_i;
  var w:int = 255;
  var x:int = a & w;
  var y:int = 48;
  z = x + y;
  var aa:int = z & w;
  var ba:int = aa != z;
  var ca:int = 1;
  var da:int = ba & ca;
  if (da) goto B_h;
  goto B_g;
  label B_i:
  var ea:int = 10;
  var fa:int = 255;
  var ga:int = a & fa;
  var ha:int = 255;
  var ia:int = ea & ha;
  var ja:int = ga >= ia;
  var ka:int = 35;
  var la:int = 255;
  var ma:int = a & la;
  var na:int = 255;
  var oa:int = ka & na;
  var pa:int = ma <= oa;
  var qa:int = ja & pa;
  var ra:int = 1;
  var sa:int = qa & ra;
  if (sa) goto B_f;
  goto B_e;
  label B_h:
  var ta:int = 1048710;
  var ua:int = 16;
  var va:int = 0;
  var wa:int = 1049468;
  builtin_default_panic(ta, ua, va, wa);
  unreachable;
  label B_g:
  var xa:int = z;
  ya = xa;
  goto B_a;
  label B_f:
  var za:int = 1;
  var ab:int = 1;
  var bb:int = b & ab;
  var cb:int = 1;
  var db:int = za & cb;
  var eb:int = bb == db;
  var fb:int = 1;
  var gb:int = eb & fb;
  if (gb) goto B_d;
  goto B_c;
  label B_e:
  var hb:int = 1049193;
  var ib:int = 24;
  var jb:int = 0;
  var kb:int = 1049936;
  builtin_default_panic(hb, ib, jb, kb);
  unreachable;
  label B_d:
  var lb:int = 65;
  mb = lb;
  goto B_b;
  label B_c:
  var nb:int = 97;
  mb = nb;
  label B_b:
  var ob:int = mb;
  var pb:int = 255;
  var qb:int = ob & pb;
  var rb:int = -10;
  var sb:int = qb + rb;
  var tb:int = sb & pb;
  var ub:int = tb != sb;
  var vb:int = 1;
  var wb:int = ub & vb;
  if (eqz(wb)) goto B_j;
  var xb:int = 1048710;
  var yb:int = 16;
  var zb:int = 0;
  var ac:int = 1049468;
  builtin_default_panic(xb, yb, zb, ac);
  unreachable;
  label B_j:
  var bc:int = sb;
  var cc:int = 255;
  var dc:int = bc & cc;
  var ec:int = a & cc;
  var fc:int = ec + dc;
  var gc:int = fc & cc;
  var hc:int = gc != fc;
  var ic:int = 1;
  var jc:int = hc & ic;
  if (eqz(jc)) goto B_k;
  var kc:int = 1048710;
  var lc:int = 16;
  var mc:int = 0;
  var nc:int = 1049468;
  builtin_default_panic(kc, lc, mc, nc);
  unreachable;
  label B_k:
  var oc:int = fc;
  ya = oc;
  label B_a:
  var pc:int = ya;
  var qc:int = 16;
  var rc:int = e + qc;
  stack_pointer = rc;
  return pc;
}

function unicode_utf8Decode3AllowSurrogateHalf(a:long_ptr@4, b:int, c:int, d:int) {
  var e:int = stack_pointer;
  var f:int = 32;
  var g:int = e - f;
  stack_pointer = g;
  var h:int = d;
  var i:{ a:ubyte, b:ubyte, c:ubyte } = c;
  g[4]:int = d;
  g[3]:int = c;
  var j:int = 3;
  var k:int = h;
  var l:int = j;
  var m:int = k == l;
  debug_assert(m);
  var n:int = 0;
  var o:int = n;
  var p:int = h;
  var q:int = o < p;
  var r:int = 1;
  var s:int = q & r;
  if (eqz(s)) goto B_b;
  goto B_a;
  label B_b:
  var t:int = 0;
  builtin_panicOutOfBounds(t, h);
  unreachable;
  label B_a:
  var u:int = i.a;
  var v:int = -16;
  var w:int = u & v;
  var x:int = 224;
  var y:int = 255;
  var z:int = w & y;
  var aa:int = 255;
  var ba:int = x & aa;
  var ca:int = z == ba;
  debug_assert(ca);
  var da:int = 0;
  var ea:int = da;
  var fa:int = h;
  var ga:int = ea < fa;
  var ha:int = 1;
  var ia:int = ga & ha;
  if (eqz(ia)) goto B_d;
  goto B_c;
  label B_d:
  var ja:int = 0;
  builtin_panicOutOfBounds(ja, h);
  unreachable;
  label B_c:
  var ka:int = i.a;
  var la:int = 15;
  var ma:int = ka & la;
  var na:int = 0;
  g[22]:byte = na;
  g[10]:short = ma;
  var oa:int = 1;
  var pa:int = oa;
  var qa:int = h;
  var ra:int = pa < qa;
  var sa:int = 1;
  var ta:int = ra & sa;
  if (eqz(ta)) goto B_f;
  goto B_e;
  label B_f:
  var ua:int = 1;
  builtin_panicOutOfBounds(ua, h);
  unreachable;
  label B_e:
  var va:int = i.b;
  var wa:int = -64;
  var xa:int = va & wa;
  var ya:int = 128;
  var za:int = 255;
  var ab:int = xa & za;
  var bb:int = 255;
  var cb:int = ya & bb;
  var db:int = ab != cb;
  var eb:int = 1;
  var fb:int = db & eb;
  if (eqz(fb)) goto B_g;
  builtin_returnError(b);
  var gb:long_ptr@4 = 0;
  var hb:long = gb[262502];
  a[0] = hb;
  var ib:int = 32;
  var jb:int = g + ib;
  stack_pointer = jb;
  return ;
  label B_g:
  var kb:int = g[22]:ubyte;
  var lb:int = 16;
  var mb:int = kb << lb;
  var nb:int = g[10]:ushort;
  var ob:int = nb | mb;
  var pb:int = 1;
  var qb:int = 1;
  var rb:int = pb & qb;
  if (eqz(rb)) goto B_i;
  goto B_h;
  label B_i:
  var sb:int = 1049083;
  var tb:int = 42;
  var ub:int = 0;
  var vb:int = 1050016;
  builtin_default_panic(sb, tb, ub, vb);
  unreachable;
  label B_h:
  var wb:int = 6;
  var xb:int = ob << wb;
  g[10]:short = xb;
  var yb:int = 2097088;
  var zb:int = xb & yb;
  var ac:int = 16;
  var bc:int = zb >> ac;
  g[22]:byte = bc;
  var cc:int = g[22]:ubyte;
  var dc:int = cc << ac;
  var ec:int = g[10]:ushort;
  var fc:int = ec | dc;
  var gc:int = 1;
  var hc:int = gc;
  var ic:int = h;
  var jc:int = hc < ic;
  var kc:int = 1;
  var lc:int = jc & kc;
  if (eqz(lc)) goto B_k;
  goto B_j;
  label B_k:
  var mc:int = 1;
  builtin_panicOutOfBounds(mc, h);
  unreachable;
  label B_j:
  var nc:int = i.b;
  var oc:int = 63;
  var pc:int = nc & oc;
  var qc:int = fc | pc;
  g[10]:short = qc;
  var rc:int = 2097151;
  var sc:int = qc & rc;
  var tc:int = 16;
  var uc:int = sc >> tc;
  g[22]:byte = uc;
  var vc:int = 2;
  var wc:int = vc;
  var xc:int = h;
  var yc:int = wc < xc;
  var zc:int = 1;
  var ad:int = yc & zc;
  if (eqz(ad)) goto B_m;
  goto B_l;
  label B_m:
  var bd:int = 2;
  builtin_panicOutOfBounds(bd, h);
  unreachable;
  label B_l:
  var cd:int = i.c;
  var dd:int = -64;
  var ed:int = cd & dd;
  var fd:int = 128;
  var gd:int = 255;
  var hd:int = ed & gd;
  var id:int = 255;
  var jd:int = fd & id;
  var kd:int = hd != jd;
  var ld:int = 1;
  var md:int = kd & ld;
  if (eqz(md)) goto B_n;
  builtin_returnError(b);
  var nd:long_ptr@4 = 0;
  var od:long = nd[262502];
  a[0] = od;
  var pd:int = 32;
  var qd:int = g + pd;
  stack_pointer = qd;
  return ;
  label B_n:
  var rd:int = g[22]:ubyte;
  var sd:int = 16;
  var td:int = rd << sd;
  var ud:int = g[10]:ushort;
  var vd:int = ud | td;
  var wd:int = 1;
  var xd:int = 1;
  var yd:int = wd & xd;
  if (eqz(yd)) goto B_p;
  goto B_o;
  label B_p:
  var zd:int = 1049083;
  var ae:int = 42;
  var be:int = 0;
  var ce:int = 1050016;
  builtin_default_panic(zd, ae, be, ce);
  unreachable;
  label B_o:
  var de:int = 6;
  var ee:int = vd << de;
  g[10]:short = ee;
  var fe:int = 2097088;
  var ge:int = ee & fe;
  var he:int = 16;
  var ie:int = ge >> he;
  g[22]:byte = ie;
  var je:int = g[22]:ubyte;
  var ke:int = je << he;
  var le:int = g[10]:ushort;
  var me:int = le | ke;
  var ne:int = 2;
  var oe:int = ne;
  var pe:int = h;
  var qe:int = oe < pe;
  var re:int = 1;
  var se:int = qe & re;
  if (eqz(se)) goto B_r;
  goto B_q;
  label B_r:
  var te:int = 2;
  builtin_panicOutOfBounds(te, h);
  unreachable;
  label B_q:
  var ue:int = i.c;
  var ve:int = 63;
  var we:int = ue & ve;
  var xe:int = me | we;
  g[10]:short = xe;
  var ye:int = 2097151;
  var ze:int = xe & ye;
  var af:int = 16;
  var bf:int = ze >> af;
  g[22]:byte = bf;
  var cf:int = g[22]:ubyte;
  var df:int = cf << af;
  var ef:int = g[10]:ushort;
  var ff:int = ef | df;
  var gf:int = 2048;
  var hf:int = ff < gf;
  var if:int = 1;
  var jf:int = hf & if;
  if (eqz(jf)) goto B_s;
  builtin_returnError(b);
  var kf:long_ptr@4 = 0;
  var lf:long = kf[262506];
  a[0] = lf;
  var mf:int = 32;
  var nf:int = g + mf;
  stack_pointer = nf;
  return ;
  label B_s:
  var of:int = g[22]:ubyte;
  var pf:int = 16;
  var qf:int = of << pf;
  var rf:int = g[10]:ushort;
  var sf:int = rf | qf;
  var tf:int = 0;
  g[14]:short = tf;
  g[12]:short = rf;
  var uf:int = 2097151;
  var vf:int = sf & uf;
  var wf:int = vf >> pf;
  g[26]:byte = wf;
  var xf:long = g[6]:long@4;
  a[0] = xf;
  var yf:int = 32;
  var zf:int = g + yf;
  stack_pointer = zf;
}

function unicode_utf8CodepointSequenceLength(a:int_ptr@2, b:int, c:int) {
  var d:int = stack_pointer;
  var e:int = 16;
  var f:int = d - e;
  stack_pointer = f;
  f[6]:short = c;
  var g:int = 2097151;
  var h:int = c & g;
  var i:int = 16;
  var j:int = h >> i;
  f[14]:byte = j;
  var k:int = 128;
  var l:int = h < k;
  var m:int = 1;
  var n:int = l & m;
  if (eqz(n)) goto B_a;
  var o:int_ptr@2 = 0;
  var p:int = o[524952];
  a[0] = p;
  var q:int = 16;
  var r:int = f + q;
  stack_pointer = r;
  return ;
  label B_a:
  var s:int = 2097151;
  var t:int = c & s;
  var u:int = 2048;
  var v:int = t < u;
  var w:int = 1;
  var x:int = v & w;
  if (eqz(x)) goto B_b;
  var y:int_ptr@2 = 0;
  var z:int = y[524954];
  a[0] = z;
  var aa:int = 16;
  var ba:int = f + aa;
  stack_pointer = ba;
  return ;
  label B_b:
  var ca:int = 2097151;
  var da:int = c & ca;
  var ea:int = 65536;
  var fa:int = da < ea;
  var ga:int = 1;
  var ha:int = fa & ga;
  if (eqz(ha)) goto B_c;
  var ia:int_ptr@2 = 0;
  var ja:int = ia[524956];
  a[0] = ja;
  var ka:int = 16;
  var la:int = f + ka;
  stack_pointer = la;
  return ;
  label B_c:
  var ma:int = 2097151;
  var na:int = c & ma;
  var oa:int = 1114112;
  var pa:int = na < oa;
  var qa:int = 1;
  var ra:int = pa & qa;
  if (eqz(ra)) goto B_d;
  var sa:int_ptr@2 = 0;
  var ta:int = sa[524958];
  a[0] = ta;
  var ua:int = 16;
  var va:int = f + ua;
  stack_pointer = va;
  return ;
  label B_d:
  builtin_returnError(b);
  var wa:int_ptr@2 = 0;
  var xa:int = wa[524960];
  a[0] = xa;
  var ya:int = 16;
  var za:int = f + ya;
  stack_pointer = za;
}

function unicode_isSurrogateCodepoint(a:int):int {
  var s:int;
  var b:int = stack_pointer;
  var c:int = 16;
  var d:int = b - c;
  stack_pointer = d;
  d[6]:short = a;
  var e:int = 2097151;
  var f:int = a & e;
  var g:int = 16;
  var h:int = f >> g;
  d[14]:byte = h;
  var i:int = 2097151;
  var j:int = a & i;
  var k:int = 55295;
  var l:int = j > k;
  var m:int = 57344;
  var n:int = j < m;
  var o:int = l & n;
  var p:int = 1;
  var q:int = o & p;
  if (eqz(q)) goto B_b;
  var r:int = 1;
  s = r;
  goto B_a;
  label B_b:
  var t:int = 0;
  s = t;
  label B_a:
  var u:int = s;
  var v:int = 16;
  var w:int = d + v;
  stack_pointer = w;
  return u;
}

function memset(a:int, b:int, c:int):int {
  if (eqz(c)) goto B_a;
  var d:byte_ptr = a;
  loop L_b {
    d[0] = b;
    d = d + 1;
    c = c + -1;
    if (c) continue L_b;
  }
  label B_a:
  return a;
}

function memcpy(a:int, b:ubyte_ptr, c:int):int {
  if (eqz(c)) goto B_a;
  c = c + -1;
  var d:byte_ptr = a;
  loop L_b {
    d[0] = b[0];
    if (eqz(c)) goto B_a;
    c = c + -1;
    b = b + 1;
    d = d + 1;
    continue L_b;
  }
  label B_a:
  return a;
}

