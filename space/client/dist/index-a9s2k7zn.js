// node_modules/@clockworklabs/spacetimedb-sdk/dist/browser/index.js
var BinaryReader = class {
  #buffer;
  #offset = 0;
  constructor(input) {
    this.#buffer = new DataView(input.buffer);
    this.#offset = input.byteOffset;
  }
  get offset() {
    return this.#offset;
  }
  readUInt8Array() {
    const length = this.readU32();
    const value = new Uint8Array(this.#buffer.buffer, this.#offset, length);
    this.#offset += length;
    return value;
  }
  readBool() {
    const value = this.#buffer.getUint8(this.#offset);
    this.#offset += 1;
    return value !== 0;
  }
  readByte() {
    const value = this.#buffer.getUint8(this.#offset);
    this.#offset += 1;
    return value;
  }
  readBytes(length) {
    const value = new DataView(this.#buffer.buffer, this.#offset, length);
    this.#offset += length;
    return new Uint8Array(value.buffer);
  }
  readI8() {
    const value = this.#buffer.getInt8(this.#offset);
    this.#offset += 1;
    return value;
  }
  readU8() {
    const value = this.#buffer.getUint8(this.#offset);
    this.#offset += 1;
    return value;
  }
  readI16() {
    const value = this.#buffer.getInt16(this.#offset, true);
    this.#offset += 2;
    return value;
  }
  readU16() {
    const value = this.#buffer.getUint16(this.#offset, true);
    this.#offset += 2;
    return value;
  }
  readI32() {
    const value = this.#buffer.getInt32(this.#offset, true);
    this.#offset += 4;
    return value;
  }
  readU32() {
    const value = this.#buffer.getUint32(this.#offset, true);
    this.#offset += 4;
    return value;
  }
  readI64() {
    const value = this.#buffer.getBigInt64(this.#offset, true);
    this.#offset += 8;
    return value;
  }
  readU64() {
    const value = this.#buffer.getBigUint64(this.#offset, true);
    this.#offset += 8;
    return value;
  }
  readU128() {
    const lowerPart = this.#buffer.getBigUint64(this.#offset, true);
    const upperPart = this.#buffer.getBigUint64(this.#offset + 8, true);
    this.#offset += 16;
    return (upperPart << BigInt(64)) + lowerPart;
  }
  readI128() {
    const lowerPart = this.#buffer.getBigUint64(this.#offset, true);
    const upperPart = this.#buffer.getBigInt64(this.#offset + 8, true);
    this.#offset += 16;
    return (upperPart << BigInt(64)) + lowerPart;
  }
  readU256() {
    const p0 = this.#buffer.getBigUint64(this.#offset, true);
    const p1 = this.#buffer.getBigUint64(this.#offset + 8, true);
    const p2 = this.#buffer.getBigUint64(this.#offset + 16, true);
    const p3 = this.#buffer.getBigUint64(this.#offset + 24, true);
    this.#offset += 32;
    return (p3 << BigInt(3 * 64)) + (p2 << BigInt(2 * 64)) + (p1 << BigInt(1 * 64)) + p0;
  }
  readI256() {
    const p0 = this.#buffer.getBigUint64(this.#offset, true);
    const p1 = this.#buffer.getBigUint64(this.#offset + 8, true);
    const p2 = this.#buffer.getBigUint64(this.#offset + 16, true);
    const p3 = this.#buffer.getBigInt64(this.#offset + 24, true);
    this.#offset += 32;
    return (p3 << BigInt(3 * 64)) + (p2 << BigInt(2 * 64)) + (p1 << BigInt(1 * 64)) + p0;
  }
  readF32() {
    const value = this.#buffer.getFloat32(this.#offset, true);
    this.#offset += 4;
    return value;
  }
  readF64() {
    const value = this.#buffer.getFloat64(this.#offset, true);
    this.#offset += 8;
    return value;
  }
  readString() {
    const length = this.readU32();
    const uint8Array = new Uint8Array(this.#buffer.buffer, this.#offset, length);
    const decoder = new TextDecoder("utf-8");
    const value = decoder.decode(uint8Array);
    this.#offset += length;
    return value;
  }
};
var BinaryWriter = class {
  #buffer;
  #view;
  #offset = 0;
  constructor(size) {
    this.#buffer = new Uint8Array(size);
    this.#view = new DataView(this.#buffer.buffer);
  }
  #expandBuffer(additionalCapacity) {
    const minCapacity = this.#offset + additionalCapacity + 1;
    if (minCapacity <= this.#buffer.length)
      return;
    let newCapacity = this.#buffer.length * 2;
    if (newCapacity < minCapacity)
      newCapacity = minCapacity;
    const newBuffer = new Uint8Array(newCapacity);
    newBuffer.set(this.#buffer);
    this.#buffer = newBuffer;
    this.#view = new DataView(this.#buffer.buffer);
  }
  getBuffer() {
    return this.#buffer.slice(0, this.#offset);
  }
  writeUInt8Array(value) {
    const length = value.length;
    this.#expandBuffer(4 + length);
    this.writeU32(length);
    this.#buffer.set(value, this.#offset);
    this.#offset += value.length;
  }
  writeBool(value) {
    this.#expandBuffer(1);
    this.#view.setUint8(this.#offset, value ? 1 : 0);
    this.#offset += 1;
  }
  writeByte(value) {
    this.#expandBuffer(1);
    this.#view.setUint8(this.#offset, value);
    this.#offset += 1;
  }
  writeI8(value) {
    this.#expandBuffer(1);
    this.#view.setInt8(this.#offset, value);
    this.#offset += 1;
  }
  writeU8(value) {
    this.#expandBuffer(1);
    this.#view.setUint8(this.#offset, value);
    this.#offset += 1;
  }
  writeI16(value) {
    this.#expandBuffer(2);
    this.#view.setInt16(this.#offset, value, true);
    this.#offset += 2;
  }
  writeU16(value) {
    this.#expandBuffer(2);
    this.#view.setUint16(this.#offset, value, true);
    this.#offset += 2;
  }
  writeI32(value) {
    this.#expandBuffer(4);
    this.#view.setInt32(this.#offset, value, true);
    this.#offset += 4;
  }
  writeU32(value) {
    this.#expandBuffer(4);
    this.#view.setUint32(this.#offset, value, true);
    this.#offset += 4;
  }
  writeI64(value) {
    this.#expandBuffer(8);
    this.#view.setBigInt64(this.#offset, value, true);
    this.#offset += 8;
  }
  writeU64(value) {
    this.#expandBuffer(8);
    this.#view.setBigUint64(this.#offset, value, true);
    this.#offset += 8;
  }
  writeU128(value) {
    this.#expandBuffer(16);
    const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
    const upperPart = value >> BigInt(64);
    this.#view.setBigUint64(this.#offset, lowerPart, true);
    this.#view.setBigUint64(this.#offset + 8, upperPart, true);
    this.#offset += 16;
  }
  writeI128(value) {
    this.#expandBuffer(16);
    const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
    const upperPart = value >> BigInt(64);
    this.#view.setBigInt64(this.#offset, lowerPart, true);
    this.#view.setBigInt64(this.#offset + 8, upperPart, true);
    this.#offset += 16;
  }
  writeU256(value) {
    this.#expandBuffer(32);
    const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
    const p0 = value & low_64_mask;
    const p1 = value >> BigInt(64 * 1) & low_64_mask;
    const p2 = value >> BigInt(64 * 2) & low_64_mask;
    const p3 = value >> BigInt(64 * 3);
    this.#view.setBigUint64(this.#offset + 8 * 0, p0, true);
    this.#view.setBigUint64(this.#offset + 8 * 1, p1, true);
    this.#view.setBigUint64(this.#offset + 8 * 2, p2, true);
    this.#view.setBigUint64(this.#offset + 8 * 3, p3, true);
    this.#offset += 32;
  }
  writeI256(value) {
    this.#expandBuffer(32);
    const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
    const p0 = value & low_64_mask;
    const p1 = value >> BigInt(64 * 1) & low_64_mask;
    const p2 = value >> BigInt(64 * 2) & low_64_mask;
    const p3 = value >> BigInt(64 * 3);
    this.#view.setBigUint64(this.#offset + 8 * 0, p0, true);
    this.#view.setBigUint64(this.#offset + 8 * 1, p1, true);
    this.#view.setBigUint64(this.#offset + 8 * 2, p2, true);
    this.#view.setBigInt64(this.#offset + 8 * 3, p3, true);
    this.#offset += 32;
  }
  writeF32(value) {
    this.#expandBuffer(4);
    this.#view.setFloat32(this.#offset, value, true);
    this.#offset += 4;
  }
  writeF64(value) {
    this.#expandBuffer(8);
    this.#view.setFloat64(this.#offset, value, true);
    this.#offset += 8;
  }
  writeString(value) {
    const encoder = new TextEncoder;
    const encodedString = encoder.encode(value);
    this.writeU32(encodedString.length);
    this.#expandBuffer(encodedString.length);
    this.#buffer.set(encodedString, this.#offset);
    this.#offset += encodedString.length;
  }
};
function deepEqual(obj1, obj2) {
  if (obj1 === obj2)
    return true;
  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length)
    return false;
  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}
function uint8ArrayToHexString(array) {
  return Array.prototype.map.call(array, (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
function uint8ArrayToU128(array) {
  if (array.length != 16) {
    throw new Error(`Uint8Array is not 16 bytes long: ${array}`);
  }
  return new BinaryReader(array).readU128();
}
function uint8ArrayToU256(array) {
  if (array.length != 32) {
    throw new Error(`Uint8Array is not 32 bytes long: [${array}]`);
  }
  return new BinaryReader(array).readU256();
}
function hexStringToUint8Array(str) {
  if (str.startsWith("0x")) {
    str = str.slice(2);
  }
  let matches = str.match(/.{1,2}/g) || [];
  let data = Uint8Array.from(matches.map((byte) => parseInt(byte, 16)));
  if (data.length != 32) {
    return new Uint8Array(0);
  }
  return data;
}
function hexStringToU128(str) {
  return uint8ArrayToU128(hexStringToUint8Array(str));
}
function hexStringToU256(str) {
  return uint8ArrayToU256(hexStringToUint8Array(str));
}
function u128ToUint8Array(data) {
  let writer = new BinaryWriter(16);
  writer.writeU128(data);
  return writer.getBuffer();
}
function u128ToHexString(data) {
  return uint8ArrayToHexString(u128ToUint8Array(data));
}
function u256ToUint8Array(data) {
  let writer = new BinaryWriter(32);
  writer.writeU256(data);
  return writer.getBuffer();
}
function u256ToHexString(data) {
  return uint8ArrayToHexString(u256ToUint8Array(data));
}
var ConnectionId = class _ConnectionId {
  data;
  get __connection_id__() {
    return this.data;
  }
  constructor(data) {
    this.data = data;
  }
  isZero() {
    return this.data === BigInt(0);
  }
  static nullIfZero(addr) {
    if (addr.isZero()) {
      return null;
    } else {
      return addr;
    }
  }
  static random() {
    function randomU8() {
      return Math.floor(Math.random() * 255);
    }
    let result = BigInt(0);
    for (let i = 0;i < 16; i++) {
      result = result << BigInt(8) | BigInt(randomU8());
    }
    return new _ConnectionId(result);
  }
  isEqual(other) {
    return this.data == other.data;
  }
  toHexString() {
    return u128ToHexString(this.data);
  }
  toUint8Array() {
    return u128ToUint8Array(this.data);
  }
  static fromString(str) {
    return new _ConnectionId(hexStringToU128(str));
  }
  static fromStringOrNull(str) {
    let addr = _ConnectionId.fromString(str);
    if (addr.isZero()) {
      return null;
    } else {
      return addr;
    }
  }
};
var TimeDuration = class _TimeDuration {
  __time_duration_micros__;
  static MICROS_PER_MILLIS = 1000n;
  get micros() {
    return this.__time_duration_micros__;
  }
  get millis() {
    return Number(this.micros / _TimeDuration.MICROS_PER_MILLIS);
  }
  constructor(micros) {
    this.__time_duration_micros__ = micros;
  }
  static fromMillis(millis) {
    return new _TimeDuration(BigInt(millis) * _TimeDuration.MICROS_PER_MILLIS);
  }
};
var Timestamp = class _Timestamp {
  __timestamp_micros_since_unix_epoch__;
  static MICROS_PER_MILLIS = 1000n;
  get microsSinceUnixEpoch() {
    return this.__timestamp_micros_since_unix_epoch__;
  }
  constructor(micros) {
    this.__timestamp_micros_since_unix_epoch__ = micros;
  }
  static UNIX_EPOCH = new _Timestamp(0n);
  static now() {
    return _Timestamp.fromDate(/* @__PURE__ */ new Date);
  }
  static fromDate(date) {
    const millis = date.getTime();
    const micros = BigInt(millis) * _Timestamp.MICROS_PER_MILLIS;
    return new _Timestamp(micros);
  }
  toDate() {
    const micros = this.__timestamp_micros_since_unix_epoch__;
    const millis = micros / _Timestamp.MICROS_PER_MILLIS;
    if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) {
      throw new RangeError("Timestamp is outside of the representable range of JS's Date");
    }
    return new Date(Number(millis));
  }
};
var Identity = class _Identity {
  data;
  get __identity__() {
    return this.data;
  }
  constructor(data) {
    this.data = typeof data === "string" ? hexStringToU256(data) : data;
  }
  isEqual(other) {
    return this.toHexString() === other.toHexString();
  }
  toHexString() {
    return u256ToHexString(this.data);
  }
  toUint8Array() {
    return u256ToUint8Array(this.data);
  }
  static fromString(str) {
    return new _Identity(str);
  }
};
var ScheduleAt;
((ScheduleAt2) => {
  function getAlgebraicType() {
    return AlgebraicType.createSumType([
      new SumTypeVariant("Interval", AlgebraicType.createU64Type()),
      new SumTypeVariant("Time", AlgebraicType.createU64Type())
    ]);
  }
  ScheduleAt2.getAlgebraicType = getAlgebraicType;
  function serialize(value) {
    switch (value.tag) {
      case "Interval":
        return { Interval: value.value };
      case "Time":
        return { Time: value.value };
      default:
        throw "unreachable";
    }
  }
  ScheduleAt2.serialize = serialize;
  ScheduleAt2.Interval = (value) => ({
    tag: "Interval",
    value
  });
  ScheduleAt2.Time = (value) => ({ tag: "Time", value });
  function fromValue(value) {
    let sumValue = value.asSumValue();
    switch (sumValue.tag) {
      case 0:
        return { tag: "Interval", value: sumValue.value.asBigInt() };
      case 1:
        return { tag: "Time", value: sumValue.value.asBigInt() };
      default:
        throw "unreachable";
    }
  }
  ScheduleAt2.fromValue = fromValue;
})(ScheduleAt || (ScheduleAt = {}));
var schedule_at_default = ScheduleAt;
var SumTypeVariant = class {
  name;
  algebraicType;
  constructor(name, algebraicType) {
    this.name = name;
    this.algebraicType = algebraicType;
  }
};
var SumType = class {
  variants;
  constructor(variants) {
    this.variants = variants;
  }
  serialize = (writer, value) => {
    if (this.variants.length == 2 && this.variants[0].name === "some" && this.variants[1].name === "none") {
      if (value) {
        writer.writeByte(0);
        this.variants[0].algebraicType.serialize(writer, value);
      } else {
        writer.writeByte(1);
      }
    } else {
      let variant = value["tag"];
      const index = this.variants.findIndex((v) => v.name === variant);
      if (index < 0) {
        throw `Can't serialize a sum type, couldn't find ${value.tag} tag`;
      }
      writer.writeU8(index);
      this.variants[index].algebraicType.serialize(writer, value["value"]);
    }
  };
  deserialize = (reader) => {
    let tag = reader.readU8();
    if (this.variants.length == 2 && this.variants[0].name === "some" && this.variants[1].name === "none") {
      if (tag === 0) {
        return this.variants[0].algebraicType.deserialize(reader);
      } else if (tag === 1) {
        return;
      } else {
        throw `Can't deserialize an option type, couldn't find ${tag} tag`;
      }
    } else {
      let variant = this.variants[tag];
      let value = variant.algebraicType.deserialize(reader);
      return { tag: variant.name, value };
    }
  };
};
var ProductTypeElement = class {
  name;
  algebraicType;
  constructor(name, algebraicType) {
    this.name = name;
    this.algebraicType = algebraicType;
  }
};
var ProductType = class {
  elements;
  constructor(elements) {
    this.elements = elements;
  }
  isEmpty() {
    return this.elements.length === 0;
  }
  serialize = (writer, value) => {
    for (let element of this.elements) {
      element.algebraicType.serialize(writer, value[element.name]);
    }
  };
  deserialize = (reader) => {
    let result = {};
    if (this.elements.length === 1) {
      if (this.elements[0].name === "__time_duration_micros__") {
        return new TimeDuration(reader.readI64());
      }
      if (this.elements[0].name === "__timestamp_micros_since_unix_epoch__") {
        return new Timestamp(reader.readI64());
      }
      if (this.elements[0].name === "__identity__") {
        return new Identity(reader.readU256());
      }
      if (this.elements[0].name === "__connection_id__") {
        return new ConnectionId(reader.readU128());
      }
    }
    for (let element of this.elements) {
      result[element.name] = element.algebraicType.deserialize(reader);
    }
    return result;
  };
};
var MapType = class {
  keyType;
  valueType;
  constructor(keyType, valueType) {
    this.keyType = keyType;
    this.valueType = valueType;
  }
};
var AlgebraicType = class _AlgebraicType {
  type;
  type_;
  #setter(type, payload) {
    this.type_ = payload;
    this.type = payload === undefined ? Type.None : type;
  }
  get product() {
    if (this.type !== Type.ProductType) {
      throw "product type was requested, but the type is not ProductType";
    }
    return this.type_;
  }
  set product(value) {
    this.#setter(Type.ProductType, value);
  }
  get sum() {
    if (this.type !== Type.SumType) {
      throw "sum type was requested, but the type is not SumType";
    }
    return this.type_;
  }
  set sum(value) {
    this.#setter(Type.SumType, value);
  }
  get array() {
    if (this.type !== Type.ArrayType) {
      throw "array type was requested, but the type is not ArrayType";
    }
    return this.type_;
  }
  set array(value) {
    this.#setter(Type.ArrayType, value);
  }
  get map() {
    if (this.type !== Type.MapType) {
      throw "map type was requested, but the type is not MapType";
    }
    return this.type_;
  }
  set map(value) {
    this.#setter(Type.MapType, value);
  }
  static #createType(type, payload) {
    let at = new _AlgebraicType;
    at.#setter(type, payload);
    return at;
  }
  static createProductType(elements) {
    return this.#createType(Type.ProductType, new ProductType(elements));
  }
  static createSumType(variants) {
    return this.#createType(Type.SumType, new SumType(variants));
  }
  static createArrayType(elementType) {
    return this.#createType(Type.ArrayType, elementType);
  }
  static createMapType(key, val) {
    return this.#createType(Type.MapType, new MapType(key, val));
  }
  static createBoolType() {
    return this.#createType(Type.Bool, null);
  }
  static createI8Type() {
    return this.#createType(Type.I8, null);
  }
  static createU8Type() {
    return this.#createType(Type.U8, null);
  }
  static createI16Type() {
    return this.#createType(Type.I16, null);
  }
  static createU16Type() {
    return this.#createType(Type.U16, null);
  }
  static createI32Type() {
    return this.#createType(Type.I32, null);
  }
  static createU32Type() {
    return this.#createType(Type.U32, null);
  }
  static createI64Type() {
    return this.#createType(Type.I64, null);
  }
  static createU64Type() {
    return this.#createType(Type.U64, null);
  }
  static createI128Type() {
    return this.#createType(Type.I128, null);
  }
  static createU128Type() {
    return this.#createType(Type.U128, null);
  }
  static createI256Type() {
    return this.#createType(Type.I256, null);
  }
  static createU256Type() {
    return this.#createType(Type.U256, null);
  }
  static createF32Type() {
    return this.#createType(Type.F32, null);
  }
  static createF64Type() {
    return this.#createType(Type.F64, null);
  }
  static createStringType() {
    return this.#createType(Type.String, null);
  }
  static createBytesType() {
    return this.createArrayType(this.createU8Type());
  }
  static createOptionType(innerType) {
    return this.createSumType([
      new SumTypeVariant("some", innerType),
      new SumTypeVariant("none", this.createProductType([]))
    ]);
  }
  static createIdentityType() {
    return this.createProductType([
      new ProductTypeElement("__identity__", this.createU256Type())
    ]);
  }
  static createConnectionIdType() {
    return this.createProductType([
      new ProductTypeElement("__connection_id__", this.createU128Type())
    ]);
  }
  static createScheduleAtType() {
    return schedule_at_default.getAlgebraicType();
  }
  static createTimestampType() {
    return this.createProductType([
      new ProductTypeElement("__timestamp_micros_since_unix_epoch__", this.createI64Type())
    ]);
  }
  static createTimeDurationType() {
    return this.createProductType([
      new ProductTypeElement("__time_duration_micros__", this.createI64Type())
    ]);
  }
  isProductType() {
    return this.type === Type.ProductType;
  }
  isSumType() {
    return this.type === Type.SumType;
  }
  isArrayType() {
    return this.type === Type.ArrayType;
  }
  isMapType() {
    return this.type === Type.MapType;
  }
  #isBytes() {
    return this.isArrayType() && this.array.type == Type.U8;
  }
  #isBytesNewtype(tag) {
    return this.isProductType() && this.product.elements.length === 1 && (this.product.elements[0].algebraicType.type == Type.U128 || this.product.elements[0].algebraicType.type == Type.U256) && this.product.elements[0].name === tag;
  }
  #isI64Newtype(tag) {
    return this.isProductType() && this.product.elements.length === 1 && this.product.elements[0].algebraicType.type === Type.I64 && this.product.elements[0].name === tag;
  }
  isIdentity() {
    return this.#isBytesNewtype("__identity__");
  }
  isConnectionId() {
    return this.#isBytesNewtype("__connection_id__");
  }
  isScheduleAt() {
    return this.isSumType() && this.sum.variants.length === 2 && this.sum.variants[0].name === "Interval" && this.sum.variants[0].algebraicType.type === Type.U64 && this.sum.variants[1].name === "Time" && this.sum.variants[1].algebraicType.type === Type.U64;
  }
  isTimestamp() {
    return this.#isI64Newtype("__timestamp_micros_since_unix_epoch__");
  }
  isTimeDuration() {
    return this.#isI64Newtype("__time_duration_micros__");
  }
  serialize(writer, value) {
    switch (this.type) {
      case Type.ProductType:
        this.product.serialize(writer, value);
        break;
      case Type.SumType:
        this.sum.serialize(writer, value);
        break;
      case Type.ArrayType:
        if (this.#isBytes()) {
          writer.writeUInt8Array(value);
        } else {
          const elemType = this.array;
          writer.writeU32(value.length);
          for (let elem of value) {
            elemType.serialize(writer, elem);
          }
        }
        break;
      case Type.MapType:
        throw new Error("not implemented");
      case Type.Bool:
        writer.writeBool(value);
        break;
      case Type.I8:
        writer.writeI8(value);
        break;
      case Type.U8:
        writer.writeU8(value);
        break;
      case Type.I16:
        writer.writeI16(value);
        break;
      case Type.U16:
        writer.writeU16(value);
        break;
      case Type.I32:
        writer.writeI32(value);
        break;
      case Type.U32:
        writer.writeU32(value);
        break;
      case Type.I64:
        writer.writeI64(value);
        break;
      case Type.U64:
        writer.writeU64(value);
        break;
      case Type.I128:
        writer.writeI128(value);
        break;
      case Type.U128:
        writer.writeU128(value);
        break;
      case Type.I256:
        writer.writeI256(value);
        break;
      case Type.U256:
        writer.writeU256(value);
        break;
      case Type.F32:
        writer.writeF32(value);
        break;
      case Type.F64:
        writer.writeF64(value);
        break;
      case Type.String:
        writer.writeString(value);
        break;
      default:
        throw new Error(`not implemented, ${this.type}`);
    }
  }
  deserialize(reader) {
    switch (this.type) {
      case Type.ProductType:
        return this.product.deserialize(reader);
      case Type.SumType:
        return this.sum.deserialize(reader);
      case Type.ArrayType:
        if (this.#isBytes()) {
          return reader.readUInt8Array();
        } else {
          const elemType = this.array;
          const length = reader.readU32();
          let result = [];
          for (let i = 0;i < length; i++) {
            result.push(elemType.deserialize(reader));
          }
          return result;
        }
      case Type.MapType:
        throw new Error("not implemented");
      case Type.Bool:
        return reader.readBool();
      case Type.I8:
        return reader.readI8();
      case Type.U8:
        return reader.readU8();
      case Type.I16:
        return reader.readI16();
      case Type.U16:
        return reader.readU16();
      case Type.I32:
        return reader.readI32();
      case Type.U32:
        return reader.readU32();
      case Type.I64:
        return reader.readI64();
      case Type.U64:
        return reader.readU64();
      case Type.I128:
        return reader.readI128();
      case Type.U128:
        return reader.readU128();
      case Type.U256:
        return reader.readU256();
      case Type.F32:
        return reader.readF32();
      case Type.F64:
        return reader.readF64();
      case Type.String:
        return reader.readString();
      default:
        throw new Error(`not implemented, ${this.type}`);
    }
  }
};
((AlgebraicType3) => {
  ((Type3) => {
    Type3["SumType"] = "SumType";
    Type3["ProductType"] = "ProductType";
    Type3["ArrayType"] = "ArrayType";
    Type3["MapType"] = "MapType";
    Type3["Bool"] = "Bool";
    Type3["I8"] = "I8";
    Type3["U8"] = "U8";
    Type3["I16"] = "I16";
    Type3["U16"] = "U16";
    Type3["I32"] = "I32";
    Type3["U32"] = "U32";
    Type3["I64"] = "I64";
    Type3["U64"] = "U64";
    Type3["I128"] = "I128";
    Type3["U128"] = "U128";
    Type3["I256"] = "I256";
    Type3["U256"] = "U256";
    Type3["F32"] = "F32";
    Type3["F64"] = "F64";
    Type3["String"] = "String";
    Type3["None"] = "None";
  })(AlgebraicType3.Type || (AlgebraicType3.Type = {}));
})(AlgebraicType || (AlgebraicType = {}));
var Type = AlgebraicType.Type;
function parseValue(ty, src) {
  const reader = new BinaryReader(src);
  return ty.deserialize(reader);
}
var RowSizeHint;
((RowSizeHint2) => {
  RowSizeHint2.FixedSize = (value) => ({
    tag: "FixedSize",
    value
  });
  RowSizeHint2.RowOffsets = (value) => ({
    tag: "RowOffsets",
    value
  });
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createSumType([
      new SumTypeVariant("FixedSize", AlgebraicType.createU16Type()),
      new SumTypeVariant("RowOffsets", AlgebraicType.createArrayType(AlgebraicType.createU64Type()))
    ]);
  }
  RowSizeHint2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    RowSizeHint2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  RowSizeHint2.serialize = serialize;
  function deserialize(reader) {
    return RowSizeHint2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  RowSizeHint2.deserialize = deserialize;
})(RowSizeHint || (RowSizeHint = {}));
var BsatnRowList;
((BsatnRowList2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("sizeHint", RowSizeHint.getTypeScriptAlgebraicType()),
      new ProductTypeElement("rowsData", AlgebraicType.createArrayType(AlgebraicType.createU8Type()))
    ]);
  }
  BsatnRowList2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    BsatnRowList2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  BsatnRowList2.serialize = serialize;
  function deserialize(reader) {
    return BsatnRowList2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  BsatnRowList2.deserialize = deserialize;
})(BsatnRowList || (BsatnRowList = {}));
var CallReducer;
((CallReducer2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("reducer", AlgebraicType.createStringType()),
      new ProductTypeElement("args", AlgebraicType.createArrayType(AlgebraicType.createU8Type())),
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("flags", AlgebraicType.createU8Type())
    ]);
  }
  CallReducer2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    CallReducer2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  CallReducer2.serialize = serialize;
  function deserialize(reader) {
    return CallReducer2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  CallReducer2.deserialize = deserialize;
})(CallReducer || (CallReducer = {}));
var Subscribe;
((Subscribe2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("queryStrings", AlgebraicType.createArrayType(AlgebraicType.createStringType())),
      new ProductTypeElement("requestId", AlgebraicType.createU32Type())
    ]);
  }
  Subscribe2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    Subscribe2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  Subscribe2.serialize = serialize;
  function deserialize(reader) {
    return Subscribe2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  Subscribe2.deserialize = deserialize;
})(Subscribe || (Subscribe = {}));
var OneOffQuery;
((OneOffQuery2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("messageId", AlgebraicType.createArrayType(AlgebraicType.createU8Type())),
      new ProductTypeElement("queryString", AlgebraicType.createStringType())
    ]);
  }
  OneOffQuery2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    OneOffQuery2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  OneOffQuery2.serialize = serialize;
  function deserialize(reader) {
    return OneOffQuery2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  OneOffQuery2.deserialize = deserialize;
})(OneOffQuery || (OneOffQuery = {}));
var QueryId;
((QueryId2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("id", AlgebraicType.createU32Type())
    ]);
  }
  QueryId2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    QueryId2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  QueryId2.serialize = serialize;
  function deserialize(reader) {
    return QueryId2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  QueryId2.deserialize = deserialize;
})(QueryId || (QueryId = {}));
var SubscribeSingle;
((SubscribeSingle2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("query", AlgebraicType.createStringType()),
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("queryId", QueryId.getTypeScriptAlgebraicType())
    ]);
  }
  SubscribeSingle2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    SubscribeSingle2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  SubscribeSingle2.serialize = serialize;
  function deserialize(reader) {
    return SubscribeSingle2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  SubscribeSingle2.deserialize = deserialize;
})(SubscribeSingle || (SubscribeSingle = {}));
var SubscribeMulti;
((SubscribeMulti2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("queryStrings", AlgebraicType.createArrayType(AlgebraicType.createStringType())),
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("queryId", QueryId.getTypeScriptAlgebraicType())
    ]);
  }
  SubscribeMulti2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    SubscribeMulti2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  SubscribeMulti2.serialize = serialize;
  function deserialize(reader) {
    return SubscribeMulti2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  SubscribeMulti2.deserialize = deserialize;
})(SubscribeMulti || (SubscribeMulti = {}));
var Unsubscribe;
((Unsubscribe2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("queryId", QueryId.getTypeScriptAlgebraicType())
    ]);
  }
  Unsubscribe2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    Unsubscribe2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  Unsubscribe2.serialize = serialize;
  function deserialize(reader) {
    return Unsubscribe2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  Unsubscribe2.deserialize = deserialize;
})(Unsubscribe || (Unsubscribe = {}));
var UnsubscribeMulti;
((UnsubscribeMulti2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("queryId", QueryId.getTypeScriptAlgebraicType())
    ]);
  }
  UnsubscribeMulti2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    UnsubscribeMulti2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  UnsubscribeMulti2.serialize = serialize;
  function deserialize(reader) {
    return UnsubscribeMulti2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  UnsubscribeMulti2.deserialize = deserialize;
})(UnsubscribeMulti || (UnsubscribeMulti = {}));
var ClientMessage;
((ClientMessage2) => {
  ClientMessage2.CallReducer = (value) => ({
    tag: "CallReducer",
    value
  });
  ClientMessage2.Subscribe = (value) => ({
    tag: "Subscribe",
    value
  });
  ClientMessage2.OneOffQuery = (value) => ({
    tag: "OneOffQuery",
    value
  });
  ClientMessage2.SubscribeSingle = (value) => ({
    tag: "SubscribeSingle",
    value
  });
  ClientMessage2.SubscribeMulti = (value) => ({
    tag: "SubscribeMulti",
    value
  });
  ClientMessage2.Unsubscribe = (value) => ({
    tag: "Unsubscribe",
    value
  });
  ClientMessage2.UnsubscribeMulti = (value) => ({ tag: "UnsubscribeMulti", value });
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createSumType([
      new SumTypeVariant("CallReducer", CallReducer.getTypeScriptAlgebraicType()),
      new SumTypeVariant("Subscribe", Subscribe.getTypeScriptAlgebraicType()),
      new SumTypeVariant("OneOffQuery", OneOffQuery.getTypeScriptAlgebraicType()),
      new SumTypeVariant("SubscribeSingle", SubscribeSingle.getTypeScriptAlgebraicType()),
      new SumTypeVariant("SubscribeMulti", SubscribeMulti.getTypeScriptAlgebraicType()),
      new SumTypeVariant("Unsubscribe", Unsubscribe.getTypeScriptAlgebraicType()),
      new SumTypeVariant("UnsubscribeMulti", UnsubscribeMulti.getTypeScriptAlgebraicType())
    ]);
  }
  ClientMessage2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    ClientMessage2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  ClientMessage2.serialize = serialize;
  function deserialize(reader) {
    return ClientMessage2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  ClientMessage2.deserialize = deserialize;
})(ClientMessage || (ClientMessage = {}));
var QueryUpdate;
((QueryUpdate2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("deletes", BsatnRowList.getTypeScriptAlgebraicType()),
      new ProductTypeElement("inserts", BsatnRowList.getTypeScriptAlgebraicType())
    ]);
  }
  QueryUpdate2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    QueryUpdate2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  QueryUpdate2.serialize = serialize;
  function deserialize(reader) {
    return QueryUpdate2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  QueryUpdate2.deserialize = deserialize;
})(QueryUpdate || (QueryUpdate = {}));
var CompressableQueryUpdate;
((CompressableQueryUpdate2) => {
  CompressableQueryUpdate2.Uncompressed = (value) => ({ tag: "Uncompressed", value });
  CompressableQueryUpdate2.Brotli = (value) => ({
    tag: "Brotli",
    value
  });
  CompressableQueryUpdate2.Gzip = (value) => ({
    tag: "Gzip",
    value
  });
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createSumType([
      new SumTypeVariant("Uncompressed", QueryUpdate.getTypeScriptAlgebraicType()),
      new SumTypeVariant("Brotli", AlgebraicType.createArrayType(AlgebraicType.createU8Type())),
      new SumTypeVariant("Gzip", AlgebraicType.createArrayType(AlgebraicType.createU8Type()))
    ]);
  }
  CompressableQueryUpdate2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    CompressableQueryUpdate2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  CompressableQueryUpdate2.serialize = serialize;
  function deserialize(reader) {
    return CompressableQueryUpdate2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  CompressableQueryUpdate2.deserialize = deserialize;
})(CompressableQueryUpdate || (CompressableQueryUpdate = {}));
var TableUpdate;
((TableUpdate2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("tableId", AlgebraicType.createU32Type()),
      new ProductTypeElement("tableName", AlgebraicType.createStringType()),
      new ProductTypeElement("numRows", AlgebraicType.createU64Type()),
      new ProductTypeElement("updates", AlgebraicType.createArrayType(CompressableQueryUpdate.getTypeScriptAlgebraicType()))
    ]);
  }
  TableUpdate2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    TableUpdate2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  TableUpdate2.serialize = serialize;
  function deserialize(reader) {
    return TableUpdate2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  TableUpdate2.deserialize = deserialize;
})(TableUpdate || (TableUpdate = {}));
var DatabaseUpdate;
((DatabaseUpdate2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("tables", AlgebraicType.createArrayType(TableUpdate.getTypeScriptAlgebraicType()))
    ]);
  }
  DatabaseUpdate2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    DatabaseUpdate2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  DatabaseUpdate2.serialize = serialize;
  function deserialize(reader) {
    return DatabaseUpdate2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  DatabaseUpdate2.deserialize = deserialize;
})(DatabaseUpdate || (DatabaseUpdate = {}));
var EnergyQuanta;
((EnergyQuanta2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("quanta", AlgebraicType.createU128Type())
    ]);
  }
  EnergyQuanta2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    EnergyQuanta2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  EnergyQuanta2.serialize = serialize;
  function deserialize(reader) {
    return EnergyQuanta2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  EnergyQuanta2.deserialize = deserialize;
})(EnergyQuanta || (EnergyQuanta = {}));
var IdentityToken;
((IdentityToken2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("identity", AlgebraicType.createIdentityType()),
      new ProductTypeElement("token", AlgebraicType.createStringType()),
      new ProductTypeElement("connectionId", AlgebraicType.createConnectionIdType())
    ]);
  }
  IdentityToken2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    IdentityToken2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  IdentityToken2.serialize = serialize;
  function deserialize(reader) {
    return IdentityToken2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  IdentityToken2.deserialize = deserialize;
})(IdentityToken || (IdentityToken = {}));
var InitialSubscription;
((InitialSubscription2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("databaseUpdate", DatabaseUpdate.getTypeScriptAlgebraicType()),
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("totalHostExecutionDuration", AlgebraicType.createTimeDurationType())
    ]);
  }
  InitialSubscription2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    InitialSubscription2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  InitialSubscription2.serialize = serialize;
  function deserialize(reader) {
    return InitialSubscription2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  InitialSubscription2.deserialize = deserialize;
})(InitialSubscription || (InitialSubscription = {}));
var OneOffTable;
((OneOffTable2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("tableName", AlgebraicType.createStringType()),
      new ProductTypeElement("rows", BsatnRowList.getTypeScriptAlgebraicType())
    ]);
  }
  OneOffTable2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    OneOffTable2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  OneOffTable2.serialize = serialize;
  function deserialize(reader) {
    return OneOffTable2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  OneOffTable2.deserialize = deserialize;
})(OneOffTable || (OneOffTable = {}));
var OneOffQueryResponse;
((OneOffQueryResponse2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("messageId", AlgebraicType.createArrayType(AlgebraicType.createU8Type())),
      new ProductTypeElement("error", AlgebraicType.createOptionType(AlgebraicType.createStringType())),
      new ProductTypeElement("tables", AlgebraicType.createArrayType(OneOffTable.getTypeScriptAlgebraicType())),
      new ProductTypeElement("totalHostExecutionDuration", AlgebraicType.createTimeDurationType())
    ]);
  }
  OneOffQueryResponse2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    OneOffQueryResponse2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  OneOffQueryResponse2.serialize = serialize;
  function deserialize(reader) {
    return OneOffQueryResponse2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  OneOffQueryResponse2.deserialize = deserialize;
})(OneOffQueryResponse || (OneOffQueryResponse = {}));
var ReducerCallInfo;
((ReducerCallInfo2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("reducerName", AlgebraicType.createStringType()),
      new ProductTypeElement("reducerId", AlgebraicType.createU32Type()),
      new ProductTypeElement("args", AlgebraicType.createArrayType(AlgebraicType.createU8Type())),
      new ProductTypeElement("requestId", AlgebraicType.createU32Type())
    ]);
  }
  ReducerCallInfo2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    ReducerCallInfo2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  ReducerCallInfo2.serialize = serialize;
  function deserialize(reader) {
    return ReducerCallInfo2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  ReducerCallInfo2.deserialize = deserialize;
})(ReducerCallInfo || (ReducerCallInfo = {}));
var UpdateStatus;
((UpdateStatus2) => {
  UpdateStatus2.Committed = (value) => ({
    tag: "Committed",
    value
  });
  UpdateStatus2.Failed = (value) => ({
    tag: "Failed",
    value
  });
  UpdateStatus2.OutOfEnergy = { tag: "OutOfEnergy" };
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createSumType([
      new SumTypeVariant("Committed", DatabaseUpdate.getTypeScriptAlgebraicType()),
      new SumTypeVariant("Failed", AlgebraicType.createStringType()),
      new SumTypeVariant("OutOfEnergy", AlgebraicType.createProductType([]))
    ]);
  }
  UpdateStatus2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    UpdateStatus2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  UpdateStatus2.serialize = serialize;
  function deserialize(reader) {
    return UpdateStatus2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  UpdateStatus2.deserialize = deserialize;
})(UpdateStatus || (UpdateStatus = {}));
var TransactionUpdate;
((TransactionUpdate2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("status", UpdateStatus.getTypeScriptAlgebraicType()),
      new ProductTypeElement("timestamp", AlgebraicType.createTimestampType()),
      new ProductTypeElement("callerIdentity", AlgebraicType.createIdentityType()),
      new ProductTypeElement("callerConnectionId", AlgebraicType.createConnectionIdType()),
      new ProductTypeElement("reducerCall", ReducerCallInfo.getTypeScriptAlgebraicType()),
      new ProductTypeElement("energyQuantaUsed", EnergyQuanta.getTypeScriptAlgebraicType()),
      new ProductTypeElement("totalHostExecutionDuration", AlgebraicType.createTimeDurationType())
    ]);
  }
  TransactionUpdate2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    TransactionUpdate2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  TransactionUpdate2.serialize = serialize;
  function deserialize(reader) {
    return TransactionUpdate2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  TransactionUpdate2.deserialize = deserialize;
})(TransactionUpdate || (TransactionUpdate = {}));
var TransactionUpdateLight;
((TransactionUpdateLight2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("update", DatabaseUpdate.getTypeScriptAlgebraicType())
    ]);
  }
  TransactionUpdateLight2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    TransactionUpdateLight2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  TransactionUpdateLight2.serialize = serialize;
  function deserialize(reader) {
    return TransactionUpdateLight2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  TransactionUpdateLight2.deserialize = deserialize;
})(TransactionUpdateLight || (TransactionUpdateLight = {}));
var SubscribeRows;
((SubscribeRows2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("tableId", AlgebraicType.createU32Type()),
      new ProductTypeElement("tableName", AlgebraicType.createStringType()),
      new ProductTypeElement("tableRows", TableUpdate.getTypeScriptAlgebraicType())
    ]);
  }
  SubscribeRows2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    SubscribeRows2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  SubscribeRows2.serialize = serialize;
  function deserialize(reader) {
    return SubscribeRows2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  SubscribeRows2.deserialize = deserialize;
})(SubscribeRows || (SubscribeRows = {}));
var SubscribeApplied;
((SubscribeApplied2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("totalHostExecutionDurationMicros", AlgebraicType.createU64Type()),
      new ProductTypeElement("queryId", QueryId.getTypeScriptAlgebraicType()),
      new ProductTypeElement("rows", SubscribeRows.getTypeScriptAlgebraicType())
    ]);
  }
  SubscribeApplied2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    SubscribeApplied2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  SubscribeApplied2.serialize = serialize;
  function deserialize(reader) {
    return SubscribeApplied2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  SubscribeApplied2.deserialize = deserialize;
})(SubscribeApplied || (SubscribeApplied = {}));
var UnsubscribeApplied;
((UnsubscribeApplied2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("totalHostExecutionDurationMicros", AlgebraicType.createU64Type()),
      new ProductTypeElement("queryId", QueryId.getTypeScriptAlgebraicType()),
      new ProductTypeElement("rows", SubscribeRows.getTypeScriptAlgebraicType())
    ]);
  }
  UnsubscribeApplied2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    UnsubscribeApplied2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  UnsubscribeApplied2.serialize = serialize;
  function deserialize(reader) {
    return UnsubscribeApplied2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  UnsubscribeApplied2.deserialize = deserialize;
})(UnsubscribeApplied || (UnsubscribeApplied = {}));
var SubscriptionError;
((SubscriptionError2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("totalHostExecutionDurationMicros", AlgebraicType.createU64Type()),
      new ProductTypeElement("requestId", AlgebraicType.createOptionType(AlgebraicType.createU32Type())),
      new ProductTypeElement("queryId", AlgebraicType.createOptionType(AlgebraicType.createU32Type())),
      new ProductTypeElement("tableId", AlgebraicType.createOptionType(AlgebraicType.createU32Type())),
      new ProductTypeElement("error", AlgebraicType.createStringType())
    ]);
  }
  SubscriptionError2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    SubscriptionError2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  SubscriptionError2.serialize = serialize;
  function deserialize(reader) {
    return SubscriptionError2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  SubscriptionError2.deserialize = deserialize;
})(SubscriptionError || (SubscriptionError = {}));
var SubscribeMultiApplied;
((SubscribeMultiApplied2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("totalHostExecutionDurationMicros", AlgebraicType.createU64Type()),
      new ProductTypeElement("queryId", QueryId.getTypeScriptAlgebraicType()),
      new ProductTypeElement("update", DatabaseUpdate.getTypeScriptAlgebraicType())
    ]);
  }
  SubscribeMultiApplied2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    SubscribeMultiApplied2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  SubscribeMultiApplied2.serialize = serialize;
  function deserialize(reader) {
    return SubscribeMultiApplied2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  SubscribeMultiApplied2.deserialize = deserialize;
})(SubscribeMultiApplied || (SubscribeMultiApplied = {}));
var UnsubscribeMultiApplied;
((UnsubscribeMultiApplied2) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("requestId", AlgebraicType.createU32Type()),
      new ProductTypeElement("totalHostExecutionDurationMicros", AlgebraicType.createU64Type()),
      new ProductTypeElement("queryId", QueryId.getTypeScriptAlgebraicType()),
      new ProductTypeElement("update", DatabaseUpdate.getTypeScriptAlgebraicType())
    ]);
  }
  UnsubscribeMultiApplied2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    UnsubscribeMultiApplied2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  UnsubscribeMultiApplied2.serialize = serialize;
  function deserialize(reader) {
    return UnsubscribeMultiApplied2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  UnsubscribeMultiApplied2.deserialize = deserialize;
})(UnsubscribeMultiApplied || (UnsubscribeMultiApplied = {}));
var ServerMessage;
((ServerMessage2) => {
  ServerMessage2.InitialSubscription = (value) => ({ tag: "InitialSubscription", value });
  ServerMessage2.TransactionUpdate = (value) => ({ tag: "TransactionUpdate", value });
  ServerMessage2.TransactionUpdateLight = (value) => ({ tag: "TransactionUpdateLight", value });
  ServerMessage2.IdentityToken = (value) => ({
    tag: "IdentityToken",
    value
  });
  ServerMessage2.OneOffQueryResponse = (value) => ({ tag: "OneOffQueryResponse", value });
  ServerMessage2.SubscribeApplied = (value) => ({ tag: "SubscribeApplied", value });
  ServerMessage2.UnsubscribeApplied = (value) => ({ tag: "UnsubscribeApplied", value });
  ServerMessage2.SubscriptionError = (value) => ({ tag: "SubscriptionError", value });
  ServerMessage2.SubscribeMultiApplied = (value) => ({ tag: "SubscribeMultiApplied", value });
  ServerMessage2.UnsubscribeMultiApplied = (value) => ({ tag: "UnsubscribeMultiApplied", value });
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createSumType([
      new SumTypeVariant("InitialSubscription", InitialSubscription.getTypeScriptAlgebraicType()),
      new SumTypeVariant("TransactionUpdate", TransactionUpdate.getTypeScriptAlgebraicType()),
      new SumTypeVariant("TransactionUpdateLight", TransactionUpdateLight.getTypeScriptAlgebraicType()),
      new SumTypeVariant("IdentityToken", IdentityToken.getTypeScriptAlgebraicType()),
      new SumTypeVariant("OneOffQueryResponse", OneOffQueryResponse.getTypeScriptAlgebraicType()),
      new SumTypeVariant("SubscribeApplied", SubscribeApplied.getTypeScriptAlgebraicType()),
      new SumTypeVariant("UnsubscribeApplied", UnsubscribeApplied.getTypeScriptAlgebraicType()),
      new SumTypeVariant("SubscriptionError", SubscriptionError.getTypeScriptAlgebraicType()),
      new SumTypeVariant("SubscribeMultiApplied", SubscribeMultiApplied.getTypeScriptAlgebraicType()),
      new SumTypeVariant("UnsubscribeMultiApplied", UnsubscribeMultiApplied.getTypeScriptAlgebraicType())
    ]);
  }
  ServerMessage2.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    ServerMessage2.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  ServerMessage2.serialize = serialize;
  function deserialize(reader) {
    return ServerMessage2.getTypeScriptAlgebraicType().deserialize(reader);
  }
  ServerMessage2.deserialize = deserialize;
})(ServerMessage || (ServerMessage = {}));
var EventEmitter = class {
  #events = /* @__PURE__ */ new Map;
  on(event, callback) {
    let callbacks = this.#events.get(event);
    if (!callbacks) {
      callbacks = /* @__PURE__ */ new Set;
      this.#events.set(event, callbacks);
    }
    callbacks.add(callback);
  }
  off(event, callback) {
    let callbacks = this.#events.get(event);
    if (!callbacks) {
      return;
    }
    callbacks.delete(callback);
  }
  emit(event, ...args) {
    let callbacks = this.#events.get(event);
    if (!callbacks) {
      return;
    }
    for (let callback of callbacks) {
      callback(...args);
    }
  }
};
var OperationsMap = class {
  #items = [];
  #isEqual(a, b) {
    if (a && typeof a === "object" && "isEqual" in a) {
      return a.isEqual(b);
    }
    return a === b;
  }
  set(key, value) {
    const existingIndex = this.#items.findIndex(({ key: k }) => this.#isEqual(k, key));
    if (existingIndex > -1) {
      this.#items[existingIndex].value = value;
    } else {
      this.#items.push({ key, value });
    }
  }
  get(key) {
    const item = this.#items.find(({ key: k }) => this.#isEqual(k, key));
    return item ? item.value : undefined;
  }
  delete(key) {
    const existingIndex = this.#items.findIndex(({ key: k }) => this.#isEqual(k, key));
    if (existingIndex > -1) {
      this.#items.splice(existingIndex, 1);
      return true;
    }
    return false;
  }
  has(key) {
    return this.#items.some(({ key: k }) => this.#isEqual(k, key));
  }
  values() {
    return this.#items.map((i) => i.value);
  }
  entries() {
    return this.#items;
  }
  [Symbol.iterator]() {
    let index = 0;
    const items = this.#items;
    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false };
        } else {
          return { value: null, done: true };
        }
      }
    };
  }
};
var LogLevelIdentifierIcon = {
  component: "\uD83D\uDCE6",
  info: "ℹ️",
  warn: "⚠️",
  error: "❌",
  debug: "\uD83D\uDC1B"
};
var LogStyle = {
  component: "color: #fff; background-color: #8D6FDD; padding: 2px 5px; border-radius: 3px;",
  info: "color: #fff; background-color: #007bff; padding: 2px 5px; border-radius: 3px;",
  warn: "color: #fff; background-color: #ffc107; padding: 2px 5px; border-radius: 3px;",
  error: "color: #fff; background-color: #dc3545; padding: 2px 5px; border-radius: 3px;",
  debug: "color: #fff; background-color: #28a745; padding: 2px 5px; border-radius: 3px;"
};
var LogTextStyle = {
  component: "color: #8D6FDD;",
  info: "color: #007bff;",
  warn: "color: #ffc107;",
  error: "color: #dc3545;",
  debug: "color: #28a745;"
};
var stdbLogger = (level, message) => {
  console.log(`%c${LogLevelIdentifierIcon[level]} ${level.toUpperCase()}%c ${message}`, LogStyle[level], LogTextStyle[level]);
};
var TableCache33 = class {
  rows;
  tableTypeInfo;
  emitter;
  constructor(tableTypeInfo) {
    this.tableTypeInfo = tableTypeInfo;
    this.rows = /* @__PURE__ */ new Map;
    this.emitter = new EventEmitter;
  }
  count() {
    return this.rows.size;
  }
  iter() {
    return Array.from(this.rows.values()).map(([row]) => row);
  }
  applyOperations = (operations, ctx) => {
    const pendingCallbacks = [];
    if (this.tableTypeInfo.primaryKey !== undefined) {
      const primaryKey = this.tableTypeInfo.primaryKey;
      const insertMap = new OperationsMap;
      const deleteMap = new OperationsMap;
      for (const op of operations) {
        if (op.type === "insert") {
          const [_, prevCount] = insertMap.get(op.row[primaryKey]) || [op, 0];
          insertMap.set(op.row[primaryKey], [op, prevCount + 1]);
        } else {
          const [_, prevCount] = deleteMap.get(op.row[primaryKey]) || [op, 0];
          deleteMap.set(op.row[primaryKey], [op, prevCount + 1]);
        }
      }
      for (const {
        key: primaryKey2,
        value: [insertOp, refCount]
      } of insertMap) {
        const deleteEntry = deleteMap.get(primaryKey2);
        if (deleteEntry) {
          const [deleteOp, deleteCount] = deleteEntry;
          const refCountDelta = refCount - deleteCount;
          const maybeCb = this.update(ctx, insertOp, deleteOp, refCountDelta);
          if (maybeCb) {
            pendingCallbacks.push(maybeCb);
          }
          deleteMap.delete(primaryKey2);
        } else {
          const maybeCb = this.insert(ctx, insertOp, refCount);
          if (maybeCb) {
            pendingCallbacks.push(maybeCb);
          }
        }
      }
      for (const [deleteOp, refCount] of deleteMap.values()) {
        const maybeCb = this.delete(ctx, deleteOp, refCount);
        if (maybeCb) {
          pendingCallbacks.push(maybeCb);
        }
      }
    } else {
      for (const op of operations) {
        if (op.type === "insert") {
          const maybeCb = this.insert(ctx, op);
          if (maybeCb) {
            pendingCallbacks.push(maybeCb);
          }
        } else {
          const maybeCb = this.delete(ctx, op);
          if (maybeCb) {
            pendingCallbacks.push(maybeCb);
          }
        }
      }
    }
    return pendingCallbacks;
  };
  update = (ctx, newDbOp, oldDbOp, refCountDelta = 0) => {
    const [oldRow, previousCount] = this.rows.get(oldDbOp.rowId) || [
      oldDbOp.row,
      0
    ];
    const refCount = Math.max(1, previousCount + refCountDelta);
    this.rows.delete(oldDbOp.rowId);
    this.rows.set(newDbOp.rowId, [newDbOp.row, refCount]);
    if (previousCount === 0) {
      stdbLogger("error", "Updating a row that was not present in the cache");
      return {
        type: "insert",
        table: this.tableTypeInfo.tableName,
        cb: () => {
          this.emitter.emit("insert", ctx, newDbOp.row);
        }
      };
    } else if (previousCount + refCountDelta <= 0) {
      stdbLogger("error", "Negative reference count for row");
    }
    return {
      type: "update",
      table: this.tableTypeInfo.tableName,
      cb: () => {
        this.emitter.emit("update", ctx, oldRow, newDbOp.row);
      }
    };
  };
  insert = (ctx, operation, count = 1) => {
    const [_, previousCount] = this.rows.get(operation.rowId) || [
      operation.row,
      0
    ];
    this.rows.set(operation.rowId, [operation.row, previousCount + count]);
    if (previousCount === 0) {
      return {
        type: "insert",
        table: this.tableTypeInfo.tableName,
        cb: () => {
          this.emitter.emit("insert", ctx, operation.row);
        }
      };
    }
    return;
  };
  delete = (ctx, operation, count = 1) => {
    const [_, previousCount] = this.rows.get(operation.rowId) || [
      operation.row,
      0
    ];
    if (previousCount === 0) {
      stdbLogger("warn", "Deleting a row that was not present in the cache");
      return;
    }
    if (previousCount <= count) {
      this.rows.delete(operation.rowId);
      return {
        type: "delete",
        table: this.tableTypeInfo.tableName,
        cb: () => {
          this.emitter.emit("delete", ctx, operation.row);
        }
      };
    }
    this.rows.set(operation.rowId, [operation.row, previousCount - count]);
    return;
  };
  onInsert = (cb) => {
    this.emitter.on("insert", cb);
  };
  onDelete = (cb) => {
    this.emitter.on("delete", cb);
  };
  onUpdate = (cb) => {
    this.emitter.on("update", cb);
  };
  removeOnInsert = (cb) => {
    this.emitter.off("insert", cb);
  };
  removeOnDelete = (cb) => {
    this.emitter.off("delete", cb);
  };
  removeOnUpdate = (cb) => {
    this.emitter.off("update", cb);
  };
};
var ClientCache = class {
  tables;
  constructor() {
    this.tables = /* @__PURE__ */ new Map;
  }
  getTable(name) {
    const table = this.tables.get(name);
    if (!table) {
      console.error("The table has not been registered for this client. Please register the table before using it. If you have registered global tables using the SpacetimeDBClient.registerTables() or `registerTable()` method, please make sure that is executed first!");
      throw new Error(`Table ${name} does not exist`);
    }
    return table;
  }
  getOrCreateTable(tableTypeInfo) {
    let table;
    if (!this.tables.has(tableTypeInfo.tableName)) {
      table = new TableCache33(tableTypeInfo);
      this.tables.set(tableTypeInfo.tableName, table);
    } else {
      table = this.tables.get(tableTypeInfo.tableName);
    }
    return table;
  }
};
async function decompress(buffer, type, chunkSize = 128 * 1024) {
  let offset = 0;
  const readableStream = new ReadableStream({
    pull(controller) {
      if (offset < buffer.length) {
        const chunk = buffer.subarray(offset, Math.min(offset + chunkSize, buffer.length));
        controller.enqueue(chunk);
        offset += chunkSize;
      } else {
        controller.close();
      }
    }
  });
  const decompressionStream = new DecompressionStream(type);
  const decompressedStream = readableStream.pipeThrough(decompressionStream);
  const reader = decompressedStream.getReader();
  const chunks = [];
  let totalLength = 0;
  let result;
  while (!(result = await reader.read()).done) {
    chunks.push(result.value);
    totalLength += result.value.length;
  }
  const decompressedArray = new Uint8Array(totalLength);
  let chunkOffset = 0;
  for (const chunk of chunks) {
    decompressedArray.set(chunk, chunkOffset);
    chunkOffset += chunk.length;
  }
  return decompressedArray;
}
var WebsocketDecompressAdapter = class _WebsocketDecompressAdapter {
  onclose;
  onopen;
  onmessage;
  onerror;
  #ws;
  async#handleOnMessage(msg) {
    const buffer = new Uint8Array(msg.data);
    let decompressed;
    if (buffer[0] === 0) {
      decompressed = buffer.slice(1);
    } else if (buffer[0] === 1) {
      throw new Error("Brotli Compression not supported. Please use gzip or none compression in withCompression method on DbConnection.");
    } else if (buffer[0] === 2) {
      decompressed = await decompress(buffer.slice(1), "gzip");
    } else {
      throw new Error("Unexpected Compression Algorithm. Please use `gzip` or `none`");
    }
    this.onmessage?.({ data: decompressed });
  }
  #handleOnOpen(msg) {
    this.onopen?.(msg);
  }
  #handleOnError(msg) {
    this.onerror?.(msg);
  }
  send(msg) {
    this.#ws.send(msg);
  }
  close() {
    this.#ws.close();
  }
  constructor(ws) {
    this.onmessage = undefined;
    this.onopen = undefined;
    this.onmessage = undefined;
    this.onerror = undefined;
    ws.onmessage = this.#handleOnMessage.bind(this);
    ws.onerror = this.#handleOnError.bind(this);
    ws.onclose = this.#handleOnError.bind(this);
    ws.onopen = this.#handleOnOpen.bind(this);
    ws.binaryType = "arraybuffer";
    this.#ws = ws;
  }
  static async createWebSocketFn({
    url,
    wsProtocol,
    authToken,
    compression,
    lightMode
  }) {
    const headers = new Headers;
    let WS;
    {
      WS = WebSocket;
    }
    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
      const tokenUrl = new URL("/v1/identity/websocket-token", url);
      tokenUrl.protocol = url.protocol === "wss:" ? "https:" : "http:";
      const response = await fetch(tokenUrl, { method: "POST", headers });
      if (response.ok) {
        const { token } = await response.json();
        url.searchParams.set("token", token);
      }
    }
    url.searchParams.set("compression", compression === "gzip" ? "Gzip" : "None");
    if (lightMode) {
      url.searchParams.set("light", "true");
    }
    const ws = new WS(url, wsProtocol);
    return new _WebsocketDecompressAdapter(ws);
  }
};
var DbConnectionBuilder32 = class {
  constructor(remoteModule, dbConnectionConstructor) {
    this.remoteModule = remoteModule;
    this.dbConnectionConstructor = dbConnectionConstructor;
    this.#createWSFn = WebsocketDecompressAdapter.createWebSocketFn;
  }
  #uri;
  #nameOrAddress;
  #identity;
  #token;
  #emitter = new EventEmitter;
  #compression = "gzip";
  #lightMode = false;
  #createWSFn;
  withUri(uri) {
    this.#uri = new URL(uri);
    return this;
  }
  withModuleName(nameOrAddress) {
    this.#nameOrAddress = nameOrAddress;
    return this;
  }
  withToken(token) {
    this.#token = token;
    return this;
  }
  withWSFn(createWSFn) {
    this.#createWSFn = createWSFn;
    return this;
  }
  withCompression(compression) {
    this.#compression = compression;
    return this;
  }
  withLightMode(lightMode) {
    this.#lightMode = lightMode;
    return this;
  }
  onConnect(callback) {
    this.#emitter.on("connect", callback);
    return this;
  }
  onConnectError(callback) {
    this.#emitter.on("connectError", callback);
    return this;
  }
  onDisconnect(callback) {
    this.#emitter.on("disconnect", callback);
    return this;
  }
  build() {
    if (!this.#uri) {
      throw new Error("URI is required to connect to SpacetimeDB");
    }
    if (!this.#nameOrAddress) {
      throw new Error("Database name or address is required to connect to SpacetimeDB");
    }
    return this.dbConnectionConstructor(new DbConnectionImpl32({
      uri: this.#uri,
      nameOrAddress: this.#nameOrAddress,
      identity: this.#identity,
      token: this.#token,
      emitter: this.#emitter,
      compression: this.#compression,
      lightMode: this.#lightMode,
      createWSFn: this.#createWSFn,
      remoteModule: this.remoteModule
    }));
  }
};
var SubscriptionBuilderImpl32 = class {
  constructor(db) {
    this.db = db;
  }
  #onApplied = undefined;
  #onError = undefined;
  onApplied(cb) {
    this.#onApplied = cb;
    return this;
  }
  onError(cb) {
    this.#onError = cb;
    return this;
  }
  subscribe(query_sql) {
    const queries = Array.isArray(query_sql) ? query_sql : [query_sql];
    if (queries.length === 0) {
      throw new Error("Subscriptions must have at least one query");
    }
    return new SubscriptionHandleImpl(this.db, queries, this.#onApplied, this.#onError);
  }
  subscribeToAllTables() {
    this.subscribe("SELECT * FROM *");
  }
};
var SubscriptionManager = class {
  subscriptions = /* @__PURE__ */ new Map;
};
var SubscriptionHandleImpl = class {
  constructor(db, querySql, onApplied, onError) {
    this.db = db;
    this.onError = onError;
    this.#emitter.on("applied", (ctx) => {
      this.#activeState = true;
      if (onApplied) {
        onApplied(ctx);
      }
    });
    this.#emitter.on("error", (ctx, error) => {
      if (this.onError) {
        this.onError(ctx, error);
      }
    });
    this.#queryId = this.db.registerSubscription(this, this.#emitter, querySql);
  }
  #queryId;
  #unsubscribeCalled = false;
  #endedState = false;
  #activeState = false;
  #emitter = new EventEmitter;
  unsubscribe() {
    if (this.#unsubscribeCalled) {
      throw new Error("Unsubscribe has already been called");
    }
    this.#unsubscribeCalled = true;
    this.db.unregisterSubscription(this.#queryId);
    this.db["unsubscribe"](this.#queryId);
  }
  unsubscribeThen(onEnd) {
    if (this.#endedState) {
      throw new Error("Subscription has already ended");
    }
    if (this.#unsubscribeCalled) {
      throw new Error("Unsubscribe has already been called");
    }
    this.#unsubscribeCalled = true;
    this.#emitter.on("end", (ctx) => {
      this.#endedState = true;
      this.#activeState = false;
      onEnd(ctx);
    });
  }
  isEnded() {
    return this.#endedState;
  }
  isActive() {
    return this.#activeState;
  }
};
function callReducerFlagsToNumber(flags) {
  switch (flags) {
    case "FullUpdate":
      return 0;
    case "NoSuccessNotify":
      return 1;
  }
}
var DbConnectionImpl32 = class {
  isActive = false;
  identity = undefined;
  token = undefined;
  db;
  reducers;
  setReducerFlags;
  connectionId = ConnectionId.random();
  #queryId = 0;
  #emitter;
  #reducerEmitter = new EventEmitter;
  #onApplied;
  #remoteModule;
  #messageQueue = Promise.resolve();
  #subscriptionManager = new SubscriptionManager;
  clientCache;
  ws;
  wsPromise;
  constructor({
    uri,
    nameOrAddress,
    identity,
    token,
    emitter,
    remoteModule,
    createWSFn,
    compression,
    lightMode
  }) {
    stdbLogger("info", "Connecting to SpacetimeDB WS...");
    let url = new URL(`v1/database/${nameOrAddress}/subscribe`, uri);
    if (!/^wss?:/.test(uri.protocol)) {
      url.protocol = "ws:";
    }
    this.identity = identity;
    this.token = token;
    this.#remoteModule = remoteModule;
    this.#emitter = emitter;
    let connectionId = this.connectionId.toHexString();
    url.searchParams.set("connection_id", connectionId);
    this.clientCache = new ClientCache;
    this.db = this.#remoteModule.dbViewConstructor(this);
    this.setReducerFlags = this.#remoteModule.setReducerFlagsConstructor();
    this.reducers = this.#remoteModule.reducersConstructor(this, this.setReducerFlags);
    this.wsPromise = createWSFn({
      url,
      wsProtocol: "v1.bsatn.spacetimedb",
      authToken: token,
      compression,
      lightMode
    }).then((v) => {
      this.ws = v;
      this.ws.onclose = () => {
        this.#emitter.emit("disconnect", this);
      };
      this.ws.onerror = (e) => {
        this.#emitter.emit("connectError", this, e);
      };
      this.ws.onopen = this.#handleOnOpen.bind(this);
      this.ws.onmessage = this.#handleOnMessage.bind(this);
      return v;
    }).catch((e) => {
      stdbLogger("error", "Error connecting to SpacetimeDB WS");
      this.#on("connectError", e);
      throw e;
    });
  }
  #getNextQueryId = () => {
    const queryId = this.#queryId;
    this.#queryId += 1;
    return queryId;
  };
  subscriptionBuilder = () => {
    return new SubscriptionBuilderImpl32(this);
  };
  registerSubscription(handle, handleEmitter, querySql) {
    const queryId = this.#getNextQueryId();
    this.#subscriptionManager.subscriptions.set(queryId, {
      handle,
      emitter: handleEmitter
    });
    this.#sendMessage(ClientMessage.SubscribeMulti({
      queryStrings: querySql,
      queryId: { id: queryId },
      requestId: 0
    }));
    return queryId;
  }
  unregisterSubscription(queryId) {
    this.#sendMessage(ClientMessage.UnsubscribeMulti({
      queryId: { id: queryId },
      requestId: 0
    }));
  }
  async#processParsedMessage(message) {
    const parseRowList = (type, tableName, rowList) => {
      const buffer = rowList.rowsData;
      const reader = new BinaryReader(buffer);
      const rows = [];
      const rowType = this.#remoteModule.tables[tableName].rowType;
      while (reader.offset < buffer.length + buffer.byteOffset) {
        const row = rowType.deserialize(reader);
        const rowId = JSON.stringify(row, (_, v) => typeof v === "bigint" ? v.toString() : v);
        rows.push({
          type,
          rowId,
          row
        });
      }
      return rows;
    };
    const parseTableUpdate = async (rawTableUpdate) => {
      const tableName = rawTableUpdate.tableName;
      let operations = [];
      for (const update of rawTableUpdate.updates) {
        let decompressed;
        if (update.tag === "Gzip") {
          const decompressedBuffer = await decompress(update.value, "gzip");
          decompressed = QueryUpdate.deserialize(new BinaryReader(decompressedBuffer));
        } else if (update.tag === "Brotli") {
          throw new Error("Brotli compression not supported. Please use gzip or none compression in withCompression method on DbConnection.");
        } else {
          decompressed = update.value;
        }
        operations = operations.concat(parseRowList("insert", tableName, decompressed.inserts));
        operations = operations.concat(parseRowList("delete", tableName, decompressed.deletes));
      }
      return {
        tableName,
        operations
      };
    };
    const parseDatabaseUpdate = async (dbUpdate) => {
      const tableUpdates = [];
      for (const rawTableUpdate of dbUpdate.tables) {
        tableUpdates.push(await parseTableUpdate(rawTableUpdate));
      }
      return tableUpdates;
    };
    switch (message.tag) {
      case "InitialSubscription": {
        const dbUpdate = message.value.databaseUpdate;
        const tableUpdates = await parseDatabaseUpdate(dbUpdate);
        const subscriptionUpdate = {
          tag: "InitialSubscription",
          tableUpdates
        };
        return subscriptionUpdate;
      }
      case "TransactionUpdateLight": {
        const dbUpdate = message.value.update;
        const tableUpdates = await parseDatabaseUpdate(dbUpdate);
        const subscriptionUpdate = {
          tag: "TransactionUpdateLight",
          tableUpdates
        };
        return subscriptionUpdate;
      }
      case "TransactionUpdate": {
        const txUpdate = message.value;
        const identity = txUpdate.callerIdentity;
        const connectionId = ConnectionId.nullIfZero(txUpdate.callerConnectionId);
        const reducerName = txUpdate.reducerCall.reducerName;
        const args = txUpdate.reducerCall.args;
        const energyQuantaUsed = txUpdate.energyQuantaUsed;
        let tableUpdates;
        let errMessage = "";
        switch (txUpdate.status.tag) {
          case "Committed":
            tableUpdates = await parseDatabaseUpdate(txUpdate.status.value);
            break;
          case "Failed":
            tableUpdates = [];
            errMessage = txUpdate.status.value;
            break;
          case "OutOfEnergy":
            tableUpdates = [];
            break;
        }
        if (reducerName === "<none>") {
          let errorMessage = errMessage;
          console.error(`Received an error from the database: ${errorMessage}`);
          return;
        }
        let reducerInfo;
        if (reducerName !== "") {
          reducerInfo = {
            reducerName,
            args
          };
        }
        const transactionUpdate = {
          tag: "TransactionUpdate",
          tableUpdates,
          identity,
          connectionId,
          reducerInfo,
          status: txUpdate.status,
          energyConsumed: energyQuantaUsed.quanta,
          message: errMessage,
          timestamp: txUpdate.timestamp
        };
        return transactionUpdate;
      }
      case "IdentityToken": {
        const identityTokenMessage = {
          tag: "IdentityToken",
          identity: message.value.identity,
          token: message.value.token,
          connectionId: message.value.connectionId
        };
        return identityTokenMessage;
      }
      case "OneOffQueryResponse": {
        throw new Error(`TypeScript SDK never sends one-off queries, but got OneOffQueryResponse ${message}`);
      }
      case "SubscribeMultiApplied": {
        const parsedTableUpdates = await parseDatabaseUpdate(message.value.update);
        const subscribeAppliedMessage = {
          tag: "SubscribeApplied",
          queryId: message.value.queryId.id,
          tableUpdates: parsedTableUpdates
        };
        return subscribeAppliedMessage;
      }
      case "UnsubscribeMultiApplied": {
        const parsedTableUpdates = await parseDatabaseUpdate(message.value.update);
        const unsubscribeAppliedMessage = {
          tag: "UnsubscribeApplied",
          queryId: message.value.queryId.id,
          tableUpdates: parsedTableUpdates
        };
        return unsubscribeAppliedMessage;
      }
      case "SubscriptionError": {
        return {
          tag: "SubscriptionError",
          queryId: message.value.queryId,
          error: message.value.error
        };
      }
    }
  }
  #sendMessage(message) {
    this.wsPromise.then((wsResolved) => {
      const writer = new BinaryWriter(1024);
      ClientMessage.serialize(writer, message);
      const encoded = writer.getBuffer();
      wsResolved.send(encoded);
    });
  }
  #handleOnOpen() {
    this.isActive = true;
  }
  #applyTableUpdates(tableUpdates, eventContext) {
    const pendingCallbacks = [];
    for (let tableUpdate of tableUpdates) {
      const tableName = tableUpdate.tableName;
      const tableTypeInfo = this.#remoteModule.tables[tableName];
      const table = this.clientCache.getOrCreateTable(tableTypeInfo);
      pendingCallbacks.push(...table.applyOperations(tableUpdate.operations, eventContext));
    }
    return pendingCallbacks;
  }
  async#processMessage(data) {
    const serverMessage = parseValue(ServerMessage, data);
    const message = await this.#processParsedMessage(serverMessage);
    if (!message) {
      return;
    }
    switch (message.tag) {
      case "InitialSubscription": {
        let event = { tag: "SubscribeApplied" };
        const eventContext = this.#remoteModule.eventContextConstructor(this, event);
        const { event: _, ...subscriptionEventContext } = eventContext;
        const callbacks = this.#applyTableUpdates(message.tableUpdates, eventContext);
        if (this.#emitter) {
          this.#onApplied?.(subscriptionEventContext);
        }
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "TransactionUpdateLight": {
        let event = { tag: "UnknownTransaction" };
        const eventContext = this.#remoteModule.eventContextConstructor(this, event);
        const callbacks = this.#applyTableUpdates(message.tableUpdates, eventContext);
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "TransactionUpdate": {
        let reducerInfo = message.reducerInfo;
        let unknownTransaction = false;
        let reducerArgs;
        let reducerTypeInfo;
        if (!reducerInfo) {
          unknownTransaction = true;
        } else {
          reducerTypeInfo = this.#remoteModule.reducers[reducerInfo.reducerName];
          try {
            const reader = new BinaryReader(reducerInfo.args);
            reducerArgs = reducerTypeInfo.argsType.deserialize(reader);
          } catch {
            console.debug("Failed to deserialize reducer arguments");
            unknownTransaction = true;
          }
        }
        if (unknownTransaction) {
          const event2 = { tag: "UnknownTransaction" };
          const eventContext2 = this.#remoteModule.eventContextConstructor(this, event2);
          const callbacks2 = this.#applyTableUpdates(message.tableUpdates, eventContext2);
          for (const callback of callbacks2) {
            callback.cb();
          }
          return;
        }
        reducerInfo = reducerInfo;
        reducerTypeInfo = reducerTypeInfo;
        const reducerEvent = {
          callerIdentity: message.identity,
          status: message.status,
          callerConnectionId: message.connectionId,
          timestamp: message.timestamp,
          energyConsumed: message.energyConsumed,
          reducer: {
            name: reducerInfo.reducerName,
            args: reducerArgs
          }
        };
        const event = {
          tag: "Reducer",
          value: reducerEvent
        };
        const eventContext = this.#remoteModule.eventContextConstructor(this, event);
        const reducerEventContext = {
          ...eventContext,
          event: reducerEvent
        };
        const callbacks = this.#applyTableUpdates(message.tableUpdates, eventContext);
        const argsArray = [];
        reducerTypeInfo.argsType.product.elements.forEach((element, index) => {
          argsArray.push(reducerArgs[element.name]);
        });
        this.#reducerEmitter.emit(reducerInfo.reducerName, reducerEventContext, ...argsArray);
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "IdentityToken": {
        this.identity = message.identity;
        if (!this.token && message.token) {
          this.token = message.token;
        }
        this.connectionId = message.connectionId;
        this.#emitter.emit("connect", this, this.identity, this.token);
        break;
      }
      case "SubscribeApplied": {
        const event = { tag: "SubscribeApplied" };
        const eventContext = this.#remoteModule.eventContextConstructor(this, event);
        const { event: _, ...subscriptionEventContext } = eventContext;
        const callbacks = this.#applyTableUpdates(message.tableUpdates, eventContext);
        this.#subscriptionManager.subscriptions.get(message.queryId)?.emitter.emit("applied", subscriptionEventContext);
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "UnsubscribeApplied": {
        const event = { tag: "UnsubscribeApplied" };
        const eventContext = this.#remoteModule.eventContextConstructor(this, event);
        const { event: _, ...subscriptionEventContext } = eventContext;
        const callbacks = this.#applyTableUpdates(message.tableUpdates, eventContext);
        this.#subscriptionManager.subscriptions.get(message.queryId)?.emitter.emit("end", subscriptionEventContext);
        for (const callback of callbacks) {
          callback.cb();
        }
        break;
      }
      case "SubscriptionError": {
        const error = Error(message.error);
        const event = { tag: "Error", value: error };
        const eventContext = this.#remoteModule.eventContextConstructor(this, event);
        const errorContext = {
          ...eventContext,
          event: error
        };
        if (message.queryId) {
          this.#subscriptionManager.subscriptions.get(message.queryId)?.emitter.emit("error", errorContext, error);
        } else {
          console.error("Received an error message without a queryId: ", error);
          this.#subscriptionManager.subscriptions.forEach(({ emitter }) => {
            emitter.emit("error", errorContext, error);
          });
        }
      }
    }
  }
  #handleOnMessage(wsMessage) {
    this.#messageQueue = this.#messageQueue.then(() => {
      return this.#processMessage(wsMessage.data);
    });
  }
  callReducer(reducerName, argsBuffer, flags) {
    const message = ClientMessage.CallReducer({
      reducer: reducerName,
      args: argsBuffer,
      requestId: 0,
      flags: callReducerFlagsToNumber(flags)
    });
    this.#sendMessage(message);
  }
  disconnect() {
    this.wsPromise.then((wsResolved) => {
      wsResolved.close();
    });
  }
  #on(eventName, callback) {
    this.#emitter.on(eventName, callback);
  }
  #off(eventName, callback) {
    this.#emitter.off(eventName, callback);
  }
  #onConnect(callback) {
    this.#emitter.on("connect", callback);
  }
  #onDisconnect(callback) {
    this.#emitter.on("disconnect", callback);
  }
  #onConnectError(callback) {
    this.#emitter.on("connectError", callback);
  }
  #removeOnConnect(callback) {
    this.#emitter.off("connect", callback);
  }
  #removeOnDisconnect(callback) {
    this.#emitter.off("disconnect", callback);
  }
  #removeOnConnectError(callback) {
    this.#emitter.off("connectError", callback);
  }
  onReducer(reducerName, callback) {
    this.#reducerEmitter.on(reducerName, callback);
  }
  offReducer(reducerName, callback) {
    this.#reducerEmitter.off(reducerName, callback);
  }
};

// module_bindings/client_connected_reducer.ts
var ClientConnected;
((ClientConnected) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([]);
  }
  ClientConnected.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    ClientConnected.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  ClientConnected.serialize = serialize;
  function deserialize(reader) {
    return ClientConnected.getTypeScriptAlgebraicType().deserialize(reader);
  }
  ClientConnected.deserialize = deserialize;
})(ClientConnected ||= {});

// module_bindings/identity_disconnected_reducer.ts
var IdentityDisconnected;
((IdentityDisconnected) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([]);
  }
  IdentityDisconnected.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    IdentityDisconnected.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  IdentityDisconnected.serialize = serialize;
  function deserialize(reader) {
    return IdentityDisconnected.getTypeScriptAlgebraicType().deserialize(reader);
  }
  IdentityDisconnected.deserialize = deserialize;
})(IdentityDisconnected ||= {});

// module_bindings/send_message_reducer.ts
var SendMessage;
((SendMessage) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("text", AlgebraicType.createStringType())
    ]);
  }
  SendMessage.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    SendMessage.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  SendMessage.serialize = serialize;
  function deserialize(reader) {
    return SendMessage.getTypeScriptAlgebraicType().deserialize(reader);
  }
  SendMessage.deserialize = deserialize;
})(SendMessage ||= {});

// module_bindings/set_ball_color_reducer.ts
var SetBallColor;
((SetBallColor) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("color", AlgebraicType.createStringType())
    ]);
  }
  SetBallColor.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    SetBallColor.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  SetBallColor.serialize = serialize;
  function deserialize(reader) {
    return SetBallColor.getTypeScriptAlgebraicType().deserialize(reader);
  }
  SetBallColor.deserialize = deserialize;
})(SetBallColor ||= {});

// module_bindings/set_name_reducer.ts
var SetName;
((SetName) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("name", AlgebraicType.createStringType())
    ]);
  }
  SetName.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    SetName.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  SetName.serialize = serialize;
  function deserialize(reader) {
    return SetName.getTypeScriptAlgebraicType().deserialize(reader);
  }
  SetName.deserialize = deserialize;
})(SetName ||= {});

// module_bindings/set_position_reducer.ts
var SetPosition;
((SetPosition) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("x", AlgebraicType.createF64Type()),
      new ProductTypeElement("y", AlgebraicType.createF64Type())
    ]);
  }
  SetPosition.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    SetPosition.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  SetPosition.serialize = serialize;
  function deserialize(reader) {
    return SetPosition.getTypeScriptAlgebraicType().deserialize(reader);
  }
  SetPosition.deserialize = deserialize;
})(SetPosition ||= {});

// module_bindings/message_table.ts
class MessageTableHandle {
  tableCache;
  constructor(tableCache) {
    this.tableCache = tableCache;
  }
  count() {
    return this.tableCache.count();
  }
  iter() {
    return this.tableCache.iter();
  }
  onInsert = (cb) => {
    return this.tableCache.onInsert(cb);
  };
  removeOnInsert = (cb) => {
    return this.tableCache.removeOnInsert(cb);
  };
  onDelete = (cb) => {
    return this.tableCache.onDelete(cb);
  };
  removeOnDelete = (cb) => {
    return this.tableCache.removeOnDelete(cb);
  };
}

// module_bindings/user_table.ts
class UserTableHandle {
  tableCache;
  constructor(tableCache) {
    this.tableCache = tableCache;
  }
  count() {
    return this.tableCache.count();
  }
  iter() {
    return this.tableCache.iter();
  }
  identity = {
    find: (col_val) => {
      for (let row of this.tableCache.iter()) {
        if (deepEqual(row.identity, col_val)) {
          return row;
        }
      }
    }
  };
  onInsert = (cb) => {
    return this.tableCache.onInsert(cb);
  };
  removeOnInsert = (cb) => {
    return this.tableCache.removeOnInsert(cb);
  };
  onDelete = (cb) => {
    return this.tableCache.onDelete(cb);
  };
  removeOnDelete = (cb) => {
    return this.tableCache.removeOnDelete(cb);
  };
  onUpdate = (cb) => {
    return this.tableCache.onUpdate(cb);
  };
  removeOnUpdate = (cb) => {
    return this.tableCache.removeOnUpdate(cb);
  };
}

// module_bindings/message_type.ts
var Message;
((Message) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("sender", AlgebraicType.createIdentityType()),
      new ProductTypeElement("sent", AlgebraicType.createTimestampType()),
      new ProductTypeElement("text", AlgebraicType.createStringType())
    ]);
  }
  Message.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    Message.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  Message.serialize = serialize;
  function deserialize(reader) {
    return Message.getTypeScriptAlgebraicType().deserialize(reader);
  }
  Message.deserialize = deserialize;
})(Message ||= {});

// module_bindings/position_type.ts
var Position;
((Position) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("x", AlgebraicType.createF64Type()),
      new ProductTypeElement("y", AlgebraicType.createF64Type())
    ]);
  }
  Position.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    Position.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  Position.serialize = serialize;
  function deserialize(reader) {
    return Position.getTypeScriptAlgebraicType().deserialize(reader);
  }
  Position.deserialize = deserialize;
})(Position ||= {});

// module_bindings/user_type.ts
var User;
((User) => {
  function getTypeScriptAlgebraicType() {
    return AlgebraicType.createProductType([
      new ProductTypeElement("identity", AlgebraicType.createIdentityType()),
      new ProductTypeElement("name", AlgebraicType.createOptionType(AlgebraicType.createStringType())),
      new ProductTypeElement("online", AlgebraicType.createBoolType()),
      new ProductTypeElement("position", Position.getTypeScriptAlgebraicType()),
      new ProductTypeElement("ballColor", AlgebraicType.createStringType())
    ]);
  }
  User.getTypeScriptAlgebraicType = getTypeScriptAlgebraicType;
  function serialize(writer, value) {
    User.getTypeScriptAlgebraicType().serialize(writer, value);
  }
  User.serialize = serialize;
  function deserialize(reader) {
    return User.getTypeScriptAlgebraicType().deserialize(reader);
  }
  User.deserialize = deserialize;
})(User ||= {});

// module_bindings/index.ts
var REMOTE_MODULE = {
  tables: {
    message: {
      tableName: "message",
      rowType: Message.getTypeScriptAlgebraicType()
    },
    user: {
      tableName: "user",
      rowType: User.getTypeScriptAlgebraicType(),
      primaryKey: "identity"
    }
  },
  reducers: {
    client_connected: {
      reducerName: "client_connected",
      argsType: ClientConnected.getTypeScriptAlgebraicType()
    },
    identity_disconnected: {
      reducerName: "identity_disconnected",
      argsType: IdentityDisconnected.getTypeScriptAlgebraicType()
    },
    send_message: {
      reducerName: "send_message",
      argsType: SendMessage.getTypeScriptAlgebraicType()
    },
    set_ball_color: {
      reducerName: "set_ball_color",
      argsType: SetBallColor.getTypeScriptAlgebraicType()
    },
    set_name: {
      reducerName: "set_name",
      argsType: SetName.getTypeScriptAlgebraicType()
    },
    set_position: {
      reducerName: "set_position",
      argsType: SetPosition.getTypeScriptAlgebraicType()
    }
  },
  eventContextConstructor: (imp, event) => {
    return {
      ...imp,
      event
    };
  },
  dbViewConstructor: (imp) => {
    return new RemoteTables(imp);
  },
  reducersConstructor: (imp, setReducerFlags) => {
    return new RemoteReducers(imp, setReducerFlags);
  },
  setReducerFlagsConstructor: () => {
    return new SetReducerFlags;
  }
};

class RemoteReducers {
  connection;
  setCallReducerFlags;
  constructor(connection, setCallReducerFlags) {
    this.connection = connection;
    this.setCallReducerFlags = setCallReducerFlags;
  }
  onClientConnected(callback) {
    this.connection.onReducer("client_connected", callback);
  }
  removeOnClientConnected(callback) {
    this.connection.offReducer("client_connected", callback);
  }
  onIdentityDisconnected(callback) {
    this.connection.onReducer("identity_disconnected", callback);
  }
  removeOnIdentityDisconnected(callback) {
    this.connection.offReducer("identity_disconnected", callback);
  }
  sendMessage(text) {
    const __args = { text };
    let __writer = new BinaryWriter(1024);
    SendMessage.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("send_message", __argsBuffer, this.setCallReducerFlags.sendMessageFlags);
  }
  onSendMessage(callback) {
    this.connection.onReducer("send_message", callback);
  }
  removeOnSendMessage(callback) {
    this.connection.offReducer("send_message", callback);
  }
  setBallColor(color) {
    const __args = { color };
    let __writer = new BinaryWriter(1024);
    SetBallColor.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("set_ball_color", __argsBuffer, this.setCallReducerFlags.setBallColorFlags);
  }
  onSetBallColor(callback) {
    this.connection.onReducer("set_ball_color", callback);
  }
  removeOnSetBallColor(callback) {
    this.connection.offReducer("set_ball_color", callback);
  }
  setName(name) {
    const __args = { name };
    let __writer = new BinaryWriter(1024);
    SetName.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("set_name", __argsBuffer, this.setCallReducerFlags.setNameFlags);
  }
  onSetName(callback) {
    this.connection.onReducer("set_name", callback);
  }
  removeOnSetName(callback) {
    this.connection.offReducer("set_name", callback);
  }
  setPosition(x, y) {
    const __args = { x, y };
    let __writer = new BinaryWriter(1024);
    SetPosition.getTypeScriptAlgebraicType().serialize(__writer, __args);
    let __argsBuffer = __writer.getBuffer();
    this.connection.callReducer("set_position", __argsBuffer, this.setCallReducerFlags.setPositionFlags);
  }
  onSetPosition(callback) {
    this.connection.onReducer("set_position", callback);
  }
  removeOnSetPosition(callback) {
    this.connection.offReducer("set_position", callback);
  }
}

class SetReducerFlags {
  sendMessageFlags = "FullUpdate";
  sendMessage(flags) {
    this.sendMessageFlags = flags;
  }
  setBallColorFlags = "FullUpdate";
  setBallColor(flags) {
    this.setBallColorFlags = flags;
  }
  setNameFlags = "FullUpdate";
  setName(flags) {
    this.setNameFlags = flags;
  }
  setPositionFlags = "FullUpdate";
  setPosition(flags) {
    this.setPositionFlags = flags;
  }
}

class RemoteTables {
  connection;
  constructor(connection) {
    this.connection = connection;
  }
  get message() {
    return new MessageTableHandle(this.connection.clientCache.getOrCreateTable(REMOTE_MODULE.tables.message));
  }
  get user() {
    return new UserTableHandle(this.connection.clientCache.getOrCreateTable(REMOTE_MODULE.tables.user));
  }
}

class SubscriptionBuilder extends SubscriptionBuilderImpl32 {
}

class DbConnection extends DbConnectionImpl32 {
  static builder = () => {
    return new DbConnectionBuilder32(REMOTE_MODULE, (imp) => imp);
  };
  subscriptionBuilder = () => {
    return new SubscriptionBuilder(this);
  };
}

// index.ts
var canvas = document.getElementById("canvas");
var token = localStorage.getItem("token");
var users = new Map;
var this_user;
var speed = 5;
var dotRadius = 10;
var conn = DbConnection.builder().withUri("wss://maincloud.spacetimedb.com").withModuleName("game").withToken(token).onConnect(connectCallback).build();
conn.db.user.onUpdate((ctx, prev, current) => {
  users[current.identity.toHexString()] = current;
  if (prev.position !== current.position) {
    let ident_string = current.identity.toHexString();
    users[ident_string] = current;
    console.log(`User ${current.name || ident_string} updated position:`, prev.position, current.position);
    drawDot(users);
  }
});
function connectCallback(conn2, identity, token2) {
  localStorage.setItem("token", token2);
  console.log(`Connected to the database! ${identity.toHexString()}, token: ${token2}`);
  conn2.subscriptionBuilder().onApplied((ctx) => {
    this_user = ctx.db.user.identity.find(identity);
    for (const current of ctx.db.user.iter()) {
      users.set(current.identity.toHexString(), current);
    }
    for (const message of ctx.db.message.iter()) {
    }
    drawDot(users);
    if (!this_user.name) {
      let name = prompt("What name do you want?");
      conn2.reducers.setName(name);
    }
  }).subscribe(["select * from user", "select * from message"]);
}
function drawDot(users2) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const [key, user] of users2) {
    let x = user.position.x || canvas.width / 2;
    let y = user.position.y || canvas.height / 2;
    let ballColor = user.ballColor;
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
  }
}
globalThis.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      console.log("up");
      this_user.position.y = Math.max(dotRadius, this_user.position.y - speed);
      break;
    case "ArrowDown":
      this_user.position.y = Math.min(canvas.height - dotRadius, this_user.position.y + speed);
      break;
    case "ArrowLeft":
      this_user.position.x = Math.max(dotRadius, this_user.position.x - speed);
      break;
    case "ArrowRight":
      this_user.position.x = Math.min(canvas.width - dotRadius, this_user.position.x + speed);
      break;
  }
  console.log("setting");
  conn.reducers.setPosition(this_user.position.x, this_user.position.y);
});
