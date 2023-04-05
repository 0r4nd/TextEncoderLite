
/**
 * UTF8 encode/decode library
 */
const [UTF8Encoder, UTF8Decoder] = (function() {
  "use strict";

  // generic helper class
  const Helper = TextEncoderHelper;


  const cbget = function(a,i) { return a[i]; };
  const cbgetcc = function(s,i) { return s.charCodeAt(i); };
  const cbcheckend = function(s,i) { return i >= s.length; };



  function utf8_lengthCodePoint(cp) {
    if (cp < 0x80) return 1;
    if (cp < 0x800) return 2;
    if (cp < 0x10000) return 3;
    if (cp < 0x110000) return 4;
    return 1;
  }



  // exemple: "Uncaught RangeError: 123456 is not a valid code point"
  function utf8_encoder_strictError(cp, dst, i, bytes) {
    throw new RangeError(cp.toString() + " is not a valid code point");
  }
  // exemple: "����"
  function utf8_encoder_replaceError(cp, dst, i, bytes) {
    var length = bytes * 3;
    while (i < length) {
      dst[i++] = 0xEF; // 239
      dst[i++] = 0xBF; // 191
      dst[i++] = 0xBD; // 189
    }
    return length;
  }
  // exemple: "&#123456;"
  function utf8_encoder_xmlcharrefreplaceError(cp, dst, i, bytes) {
    var j = 0, s = cp.toString();
    dst[i++] = 38; // '&'
    dst[i++] = 35; // '#'
    while (j < s.length) dst[i++] = s.charCodeAt(j++);
    dst[i++] = 59; // ';'
    return s.length + 3;
  }


  function utf8_encodeCodePointUnsafe(cp, dst, i, cberror) {
    var count = 0;
    if (cp <= 0x7F) {
      dst[i] = cp;
      return 1;
    } else if (cp <= 0x7FF) {
      dst[i++] = ((cp >> 6) & 0x1f) | 0xc0;
      count = 2;
    } else if (cp <= 0xFFFF) {
      dst[i++] = ((cp >> 12) & 0x0f) | 0xe0;
      dst[i++] = ((cp >> 6) & 0x3f) | 0x80;
      count = 3;
    } else if (cp <= 0x1FFFFF) {
      //if (cp > 0x10FFFF) {// max
      //  return cberror(cp, dst, i, 4);
      //}
      dst[i++] = ((cp >> 18) & 0x07) | 0xf0;
      dst[i++] = ((cp >> 12) & 0x3f) | 0x80;
      dst[i++] = ((cp >> 6) & 0x3f) | 0x80;
      count = 4;
    } else {
      return cberror(cp, dst, i, 1);
    }
    //else if (cp <= 0x3FFFFFF) {
    //  return cberror(cp, dst, i, 5);
    //} else if (cp <= 0x7FFFFFFF) {
    //  return cberror(cp, dst, i, 6);
    //}
    dst[i] = (cp & 0x3f) | 0x80;
    return count;
  }

  function utf8_encodeCodePoint(cp, dst, i, cberror) {
    var count = 0;
    if (cp <= 0x7F) {
      if (i >= dst.length) return -1;
      dst[i] = cp;
      return 1;
    } else if (cp <= 0x7FF) {
      if (i+1 >= dst.length) return -2;
      dst[i++] = ((cp >> 6) & 0x1f) | 0xc0;
      count = 2;
    } else if (cp <= 0xFFFF) {
      if (i+2 >= dst.length) return -3;
      dst[i++] = ((cp >> 12) & 0x0f) | 0xe0;
      dst[i++] = ((cp >> 6) & 0x3f) | 0x80;
      count = 3;
    } else if (cp <= 0x1FFFFF) {
      if (i+3 >= dst.length) return -4;
      //if (cp > 0x10FFFF) {// max
      //  return cberror(cp, dst, i, 4);
      //}
      dst[i++] = ((cp >> 18) & 0x07) | 0xf0;
      dst[i++] = ((cp >> 12) & 0x3f) | 0x80;
      dst[i++] = ((cp >> 6) & 0x3f) | 0x80;
      count = 4;
    } else {
      if (i >= dst.length) return -1;
      return cberror(cp, dst, i, 1);
    }
    //else if (cp <= 0x3FFFFFF) {
    //  return cberror(cp, dst, i, 5);
    //} else if (cp <= 0x7FFFFFFF) {
    //  return cberror(cp, dst, i, 6);
    //}
    dst[i] = (cp & 0x3f) | 0x80;
    return count;
  }





  function utf8_decoder_strictError(i, count) {
    throw new TypeError("The code point at index(" + i + ") is not valid");
    //return 0xFFFD | (bytes << 24);
  }
  function utf8_decoder_replaceError(i, count) {
    return 0xFFFD | (count << 24);
  }
  function utf8_decoder_cbError(fatal) {
    return fatal? utf8_decoder_strictError : utf8_decoder_replaceError;
  }


  // https://encoding.spec.whatwg.org/#utf-8-decoder
  function utf8_decodeCodePointUnsafe(src, i, getcc, cberror) {
    var bytes = 1<<24;
    var low = 0x80; // low bound
    var up = 0xBF; // up bound
    var c1 = getcc(src,i), c2, c3, c4;

    if (c1 <= 0x7F) {
      // trivial ascii
    } else if (c1 >= 0xC2 && c1 <= 0xDF) {
      c2 = getcc(src,++i);
      if (c2 < low || c2 > up) return cberror(i,1);
      c1 = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
      bytes = 2<<24;
    } else if (c1 >= 0xE0 && c1 <= 0xEF) {
      if (c1 == 0xE0) low = 0xA0;
      else if (c1 == 0xED) up = 0x9F;
      c2 = getcc(src,++i);
      if (c2 < low || c2 > up) return cberror(i,1);
      c3 = getcc(src,++i);
      if (c3 < 0x80 || c3 > 0xBF) return cberror(i,1);
      c1 = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
      bytes = 3<<24;
    } else if (c1 >= 0xF0 && c1 <= 0xF4) {
      if (c1 == 0xF0) low = 0x90;
      else if (c1 == 0xF4) up = 0x8F;
      c2 = getcc(src,++i);
      if (c2 < low || c2 > up) return cberror(i,1);
      c3 = getcc(src,++i);
      if (c3 < 0x80 || c3 > 0xBF) return cberror(i,1);
      c4 = getcc(src,++i);
      if (c4 < 0x80 || c4 > 0xBF) return cberror(i,1);
      c1 = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
           ((c3 & 0x3F) << 6) | (c4 & 0x3F);
      bytes = 4<<24;
    } else {
      return cberror(i,1);
    }
    return c1 | bytes;
  }





  function utf8_decodeCodePoint(src, i, getcc, cberror, checkend) {
    var bytes = 1<<24;
    var low = 0x80; // low bound
    var up = 0xBF; // up bound
    var c1 = getcc(src,i), c2, c3, c4;

    if (c1 <= 0x7F) {
      // trivial ascii
    } else if (c1 >= 0xC2 && c1 <= 0xDF) {
      if (checkend(src,i+1)) return cberror(i+1,1);
      c2 = getcc(src,++i);
      if (c2 < low || c2 > up) return cberror(i,1);
      c1 = ((c1 & 0x1F) << 6) | (c2 & 0x3F);
      bytes = 2<<24;
    } else if (c1 >= 0xE0 && c1 <= 0xEF) {
      if (checkend(src,i+2)) return cberror(i+2,2);
      if (c1 == 0xE0) low = 0xA0;
      else if (c1 == 0xED) up = 0x9F;
      c2 = getcc(src,++i);
      if (c2 < low || c2 > up) return cberror(i,1);
      c3 = getcc(src,++i);
      if (c3 < 0x80 || c3 > 0xBF) return cberror(i,1);
      c1 = ((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6) | (c3 & 0x3F);
      bytes = 3<<24;
    } else if (c1 >= 0xF0 && c1 <= 0xF4) {
      if (checkend(src,i+3)) return cberror(i+3,3);
      if (c1 == 0xF0) low = 0x90;
      else if (c1 == 0xF4) up = 0x8F;
      c2 = getcc(src,++i);
      if (c2 < low || c2 > up) return cberror(i,1);
      c3 = getcc(src,++i);
      if (c3 < 0x80 || c3 > 0xBF) return cberror(i,1);
      c4 = getcc(src,++i);
      if (c4 < 0x80 || c4 > 0xBF) return cberror(i,1);
      c1 = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
           ((c3 & 0x3F) << 6) | (c4 & 0x3F);
      bytes = 4<<24;
    } else {
      return cberror(i,1);
    }
    return c1 | bytes;
  }


  function utf8_lengthCodePoint(src) {
    var i = 0, len = src.length - 3;
    for (cplen = 0; i < len; cplen++) {
      i += utf8_decodeCodePointUnsafe(src, i, cbget, cberror) >> 24;
    }
    for (; i < src.length; cplen++) {
      i += utf8_decodeCodePoint(src, i, cbget, cberror, cbcheckend) >> 24;
    }
    return cplen;
  }


  function utf8_forEach(src, cb, cberror, ignoreBOM) {
    var cp = 0, i = 0, cplen = 0;
    var len = src.length - 3;
    if (!ignoreBOM && src.length >= 3) {
      var c1 = cbget(src,i+0);
      var c2 = cbget(src,i+1);
      var c3 = cbget(src,i+2);
      if (c1 == 0xEF && c2 == 0xBB && c3 == 0xBF) i += 3;
    }
    // loop
    while (i < len) {
      cp = utf8_decodeCodePointUnsafe(src, i, cbget, cberror);
      i += cp >> 24;
      cb(cp&0xffffff, cplen++, src);
    }
    // with overflow check
    while (i < src.length) {
      cp = utf8_decodeCodePoint(src, i, cbget, cberror, cbcheckend);
      i += cp >> 24;
      cb(cp&0xffffff, cplen++, src);
    }
    return cplen;
  }


  function utf8_opts(src, lowEndian) {
    var types = Helper.Typeof.types(src);
    //if (lowEndian) getCharCodeAt = function(a,i) {var cp=a[i]; return (cp>>8)|((cp&0xff)<<8);};
    switch (types[0]) {
      //case 'string': return null;
      case 'array':
        if (!Helper.Typeof.isNumber(src[0])) return null;
        break;
      case 'arraybuffer':
        src = new Uint8Array(src);
        break;
      case 'dataview':
        src = new Uint8Array(src.buffer);
        break;
      default:
        if (types[1] != 'typedarray') return null;
        src = new Uint8Array(src.buffer);
        /*
        var bpe = src.BYTES_PER_ELEMENT;
        if (!bpe || bpe > 8) return 0;
        if (bpe <= 2) {
          if (bpe == 1) src = new Uint8Array(src.buffer);
          else if (bpe == 2) src = new Uint16Array(src.buffer);
        } else if (bpe == 4) {
          src = new Uint32Array(src.buffer);
          //if (lowEndian) getCharCodeAt = function(a,i) {var cp=a[i]; return ((cp>>8)&0xff)|((cp&0xff)<<8);};
        } else src = new BigUint64Array(src.buffer);
        */
    }
    return {src, types};
  }



  // exemple: "Uncaught RangeError: 123456 is not a valid code point"
  function utf16_encoder_strictError(cp, dst, i, count) {
    throw new RangeError(cp.toString() + " is not a valid code point");
  }
  // exemple: "����"
  function utf16_encoder_replaceError(cp, dst, i, count) {
    for (var j = 0; j < count; j++) dst[i+j] = 0xFFFD;
    return count;
  }


  function utf16_lengthCodePoint(cp) {
    if (cp < 0x10000) { // bmp plane
      if (cp >= 0xD800 && cp <= 0xDFFF) return 1; // not a character
      return 1;
    }
    if (cp >= 0x10FFFF) return 1; // too big
    var word = cp&0xffff;
    if (word == 0xFFFE || word == 0xFFFF) return 1; // invalid
    return 2;
  }

  function utf16_encodeCodePoint(cp, dst, i, cberror) {
    if (cp < 0x10000) {
      if (cp >= 0xD800 && cp <= 0xDFFF) { // isSurrogate
        return cberror(cp, dst, i, 1);
      }
      dst[i] = cp;
      return 1;
    }
    if (cp >= 0x10FFFF) { // too big
      return cberror(cp, dst, i, 2);
    }
    cp -= 0x10000;
    dst[i] = (cp >> 10) + 0xD800; // ((cp >> 10) & 0x3FF) + 0xD800;
    dst[i+1] = (cp & 0x3FF) + 0xDC00;
    return 2;
  }

  function utf16_isSurrogate(cp) {
    return cp >= 0xD800 && cp <= 0xDFFF;
  }

  function utf16_decodeCodePointUnsafe(src, i, getcc) {
    var c1 = getcc(src,i);
    if (c1 < 0xD800 || c1 > 0xDFFF) return c1 | (1<<24);
    if (c1 <= 0xDBFF) {
      var c2 = getcc(src,i+1);
      if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
        return (((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000) | (2<<24);
      } 
    }
    return 0xFFFD | (1<<24); // U+FFFD REPLACEMENT CHARACTER
  }

  // https://github.com/inexorabletash/text-encoding/blob/master/lib/encoding.js
  function utf16_decodeCodePoint(src, i, getcc) {
    var c1 = getcc(src,i);
    if (c1 < 0xD800 || c1 > 0xDFFF) return c1 | (1<<24);
    if (c1 <= 0xDBFF && !checkend(src,i+1)) {
      var c2 = getcc(src,i+1);
      if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
        return (((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000) | (2<<24);
      } 
    }
    return 0xFFFD | (1<<24); // U+FFFD REPLACEMENT CHARACTER
  }

  function utf16_forEach(src, cb, getcc) {
    var c = 0, i = 0, read = 0, size = 0;
    var len = src.length - 1;
    // main loop
    while (read < len) {
      c = utf16_decodeCodePointUnsafe(src, read, getcc);
      size = c >> 24;
      cb(c&0xffffff, i++, size);
      read += size;
    }
    // last
    if (read < src.length) {
      c = getcc(src,read);
      if (utf16_isSurrogate(c)) c = 0xFFFD;
      cb(c,i,1);
      read += 1;
    }
    return read;
  }

  function utf16_every(src, cb, getcc) {
    var c = 0, i = 0, read = 0, size = 0;
    var len = src.length - 1;
    // main loop
    while (read < len) {
      c = utf16_decodeCodePointUnsafe(src, read, getcc);
      size = c >> 24;
      if (!cb(c&0xffffff, i++, size)) return read;
      read += size;
    }
    // last
    if (read < src.length) {
      c = getcc(src,read);
      if (utf16_isSurrogate(c)) c = 0xFFFD;
      if (!cb(c,i,1)) return read;
      read += 1;
    }
    return read;
  }







  function cbEncode_forEach_noerror(cp) {
    var a = this.array;
    if (cp <= 0x7F) {
      a[this.written++] = cp;
      return;
    }
    if (cp <= 0x7FF) {
      a[this.written++] = ((cp >> 6) & 0x1f) | 0xc0;
      a[this.written++] = (cp & 0x3f) | 0x80;
      return;
    }
    if (cp <= 0xFFFF) {
      a[this.written++] = ((cp >> 12) & 0x0f) | 0xe0;
      a[this.written++] = ((cp >> 6) & 0x3f) | 0x80;
      a[this.written++] = (cp & 0x3f) | 0x80;
      return;
    }
    a[this.written++] = ((cp >> 18) & 0x07) | 0xf0;
    a[this.written++] = ((cp >> 12) & 0x3f) | 0x80;
    a[this.written++] = ((cp >> 6) & 0x3f) | 0x80;
    a[this.written++] = (cp & 0x3f) | 0x80;
  }

  function cbEncode_forEach(cp) {
    var a = this.array;
    if (cp <= 0x7F) {
      a[this.written++] = cp;
      return;
    }
    if (cp <= 0x7FF) {
      a[this.written++] = ((cp >> 6) & 0x1f) | 0xc0;
      a[this.written++] = (cp & 0x3f) | 0x80;
      return;
    }
    if (cp <= 0xFFFF) {
      a[this.written++] = ((cp >> 12) & 0x0f) | 0xe0;
      a[this.written++] = ((cp >> 6) & 0x3f) | 0x80;
      a[this.written++] = (cp & 0x3f) | 0x80;
      return;
    }
    if (cp <= 0x1FFFFF) {
      a[this.written++] = ((cp >> 18) & 0x07) | 0xf0;
      a[this.written++] = ((cp >> 12) & 0x3f) | 0x80;
      a[this.written++] = ((cp >> 6) & 0x3f) | 0x80;
      a[this.written++] = (cp & 0x3f) | 0x80;
      return;
    }
    this.written += this.cbError(a, this.written, cp);
  }
  


  function cbEncode_every_noerror(cp) {
    var a = this.array;
    if (cp <= 0x7F) {
      if (this.written >= a.length) return false;
      a[this.written++] = cp;
      return true;
    }
    if (cp <= 0x7FF) {
      if (this.written+1 >= a.length) return false;
      a[this.written++] = ((cp >> 6) & 0x1f) | 0xc0;
      a[this.written++] = (cp & 0x3f) | 0x80;
      return true;
    }
    if (cp <= 0xFFFF) {
      if (this.written+2 >= a.length) return false;
      a[this.written++] = ((cp >> 12) & 0x0f) | 0xe0;
      a[this.written++] = ((cp >> 6) & 0x3f) | 0x80;
      a[this.written++] = (cp & 0x3f) | 0x80;
      return true;
    }
    if (this.written+3 >= a.length) return false;
    a[this.written++] = ((cp >> 18) & 0x07) | 0xf0;
    a[this.written++] = ((cp >> 12) & 0x3f) | 0x80;
    a[this.written++] = ((cp >> 6) & 0x3f) | 0x80;
    a[this.written++] = (cp & 0x3f) | 0x80;
    return true;
  }

  function cbEncode_every(cp) {
    var a = this.array, size = 0;
    if (cp <= 0x7F) {
      if (this.written >= a.length) return false;
      a[this.written++] = cp;
      return true;
    }
    if (cp <= 0x7FF) {
      if (this.written+1 >= a.length) return false;
      a[this.written++] = ((cp >> 6) & 0x1f) | 0xc0;
      a[this.written++] = (cp & 0x3f) | 0x80;
      return true;
    }
    if (cp <= 0xFFFF) {
      if (this.written+2 >= a.length) return false;      
      a[this.written++] = ((cp >> 12) & 0x0f) | 0xe0;
      a[this.written++] = ((cp >> 6) & 0x3f) | 0x80;
      a[this.written++] = (cp & 0x3f) | 0x80;
      return true;
    }
    if (cp <= 0x1FFFFF) {
      if (this.written+3 >= a.length) return false;
      a[this.written++] = ((cp >> 18) & 0x07) | 0xf0;
      a[this.written++] = ((cp >> 12) & 0x3f) | 0x80;
      a[this.written++] = ((cp >> 6) & 0x3f) | 0x80;
      a[this.written++] = (cp & 0x3f) | 0x80;
      return true;
    }
    if ((size = this.cbError(a,this.written,cp)) < 0) return false;
    this.written += size;
    return true;
  }


  const privateData = new WeakMap();
  function internal(key) {
    if (!privateData.has(key)) privateData.set(key, Object.create(null));
    return privateData.get(key);
  }

  /**
   * @constructor
   * @param {Object=} options
   */
  function UTF8Encoder(options = {}) {
    /** errorMode. read-only */
    internal(this).errorMode = Helper.getErrorType(options.errorMode);

  }

  Object.defineProperty(UTF8Encoder.prototype, Symbol.toStringTag, {
    value: UTF8Encoder.name
  });
  Object.defineProperty(UTF8Encoder.prototype, 'encoding', {
    value: "utf-8"
  });
  Object.defineProperty(UTF8Encoder.prototype, 'errorMode', {
    get() { return internal(this).errorMode; }
  });


  UTF8Encoder.prototype.encodeInto = function(string, uint8Array) {
    if (arguments.length < 2) {
      throw TypeError("TextEncoder.encodeInto: At least 2 arguments required, but only " +
                       arguments.length + " passed");
    }
    if (Helper.Typeof(arguments[1]) !== "uint8array") {
      throw TypeError("TextEncoder.encodeInto: Argument 2 does not implement interface Uint8Array.");
    }

    string = string + ""; // .toString()
    var subString = string, arrayLength = uint8Array.length;
    var read = 0, safeRatio = 3, finisher = true;
    var errorMode = this.errorMode;
    var cbEncodeA = cbEncode_forEach;
    var cbEncodeB = cbEncode_every;
    var utf16_forEach = Helper.utf16_string_forEach_replaceChar;
    var utf16_every = Helper.utf16_string_every_replaceChar;

    switch (errorMode) {
      case "xmlcharrefreplace":
        safeRatio = 10;
        break;
      case "backslashreplace":
        safeRatio = 6;
        break;
      case "ignore": // silent and no 0xFFFD replacement
        utf16_forEach = Helper.utf16_string_forEach;
        utf16_every = Helper.utf16_string_every;
      case "replace":
        errorMode = "ignore";
        cbEncodeA = cbEncode_forEach_noerror;
        cbEncodeB = cbEncode_every_noerror;
      default: break;
    }

    var ctx = {
      written:  0,
      array:    uint8Array,
      cbError:  Helper.cbErrors_forEach[errorMode],
      encoding: this.encoding
    };




    // very performant encoding loop (zero test for array overflow)
    var safeLength = Math.floor(arrayLength / safeRatio);
    while (safeLength > safeRatio) {
      //console.info("encodeInto.forEach("+safeLength+"):\n", subString.substring(0,safeLength));
      read += utf16_forEach(subString.substring(0,safeLength), cbEncodeA, ctx, 0xFFFD);
      if (read >= string.length) {
        finisher = false;
        break;
      }
      subString = subString.substring(safeLength, subString.length);
      safeLength = Math.floor((arrayLength - ctx.written) / safeRatio);
    }

    // slower encoding
    if (finisher) {
      if (read > 0) string = string.substring(read, string.length);
      //console.warn("encodeInto.every(" + string.length + "):\n", string);
      ctx.cbError = Helper.cbErrors_every[errorMode];
      read += utf16_every(string, cbEncodeB, ctx, 0xFFFD);
    }
    return {read:read, written:ctx.written};
  };


  // 
  UTF8Encoder.prototype.encode = function(string) {
    if (typeof(string) == "undefined") return new Uint8Array();
    string = string + ""; // .toString()
    var read = 0;
    var errorMode = this.errorMode;
    //var cbEncode = (errorMode == "ignore")? cbEncode_forEach_noerror : cbEncode_forEach;
    var cbEncode = cbEncode_forEach_noerror;
    var isUint8 = !(errorMode == "backslashreplace" || errorMode == "xmlcharrefreplace");
    var array = isUint8? new Uint8Array(string.length*3) : new Array(string.length);
    var ctx = {
      written:  0,
      array:    array,
      //cbError:  cbErrors_forEach[errorMode],
      encoding: this.encoding
    };
    Helper.utf16_string_forEach_replaceChar(string, cbEncode, ctx, 0xFFFD);
    return isUint8? array.slice(0, ctx.written) : Uint8Array.from(array);
  };



  function UTF8Decoder(options = {}) {
    if (!(this instanceof UTF8Decoder)) {
      throw TypeError("UTF8Decoder constructor: 'new' is required");
    }

    /** Is a Boolean indicating whether the error mode is fatal. read-only */
    internal(this).fatal = Boolean(options.fatal);
    /** Is a Boolean indicating whether the byte order marker is ignored. read-only */
    internal(this).ignoreBOM = Boolean(options.ignoreBOM);
    /** errorMode. read-only */
    internal(this).errorMode = Helper.getErrorType(options.errorMode);
  }

  Object.defineProperty(UTF8Decoder.prototype, Symbol.toStringTag, {
    value: UTF8Decoder.name
  });
  Object.defineProperty(UTF8Decoder.prototype, 'encoding', {
    value: "utf-8"
  });
  Object.defineProperty(UTF8Decoder.prototype, 'fatal', {
    get() { return internal(this).fatal; }
  });
  Object.defineProperty(UTF8Decoder.prototype, 'ignoreBOM', {
    get() { return internal(this).ignoreBOM; }
  });
  Object.defineProperty(UTF8Decoder.prototype, 'errorMode', {
    get() { return internal(this).errorMode; }
  });


  return [UTF8Encoder, UTF8Decoder];
})();





/////////////////////////////////////// TRASH PORTION ///////////////////////////////////////


/*
  UTF8Encoder.prototype.encodeInto = function(string, uint8Array) {
    if (arguments.length < 2) {
      throw TypeError("UTF8Encoder.encodeInto: At least 2 arguments required, but only "+arguments.length+" passed");
    }
    var cberror = this.fatal? utf8_encoder_strictError : utf8_encoder_replaceError;
    var written = 0;
    var cb = function(cp) {
      var size = utf8_encodeCodePoint(cp, uint8Array, written, cberror);
      if (size <= 0) return false;
      written += size;
      return true;
    };
    var read = utf16_every(string, cb, cbgetcc);
    return {read, written};
  };
*/
  // 
  // UTF8Encoder.prototype.encode = function(string) {
  //   //var opts = utf8_opts(string);
  //   //if (!opts) return null;
  //   var cberror = this.fatal? utf8_encoder_strictError : utf8_encoder_replaceError;
  //   var pos = 0, uint8Array = new Uint8Array(string.length * 3);
  //   var cb = function(cp) {
  //     pos += utf8_encodeCodePointUnsafe(cp, uint8Array, pos, cberror);
  //   };
  //   utf16_forEach(string, cb, cbgetcc);
  //   return uint8Array.slice(0, pos);
  // };

  // alternative
  // UTF8Encoder.prototype.encode = function(string) {
  //   var uint8Array = new Uint8Array(string.length * 3);
  //   var res = this.encodeInto(string, uint8Array);
  //   return uint8Array.slice(0, res.written);
  // };



/*
  // with overflow check
  function cbEncode_every(cp) {
    var c, size;
    if (cp <= this.lowBound) {
      if (this.written >= this.array.length) return false;
      this.array[this.written++] = cp;
      return true;
    }
    if ((c = this.cp2index[cp])) {
      if (this.written >= this.array.length) return false;
      this.array[this.written++] = c;
      return true;
    }
    if ((size = this.cbError(this.array,this.written,cp)) < 0) return false;
    this.written += size;
    return true;
  }
  function cbEncode_every_noerror(cp) {
    if (cp <= this.lowBound) {
      if (this.written >= this.array.length) return false;
      this.array[this.written++] = cp;
      return true;
    }
    if ((cp = this.cp2index[cp])) {
      if (this.written >= this.array.length) return false;
      this.array[this.written++] = cp;
      return true;
    }
    return true;
  }
*/

/*
  function cbEncode_forEach(cp) {
    if (cp <= this.lowBound) {
      this.array[this.written++] = cp;
      return;
    }
    var c = this.cp2index[cp];
    if (c) {
      this.array[this.written++] = c;
      return;
    }
    this.written += this.cbError(this.array, this.written, cp);
  }
*/




  //UTF8.decodeCodePointFast = utf8_decodeCodePointFast;
  //UTF8.decodeCodePoint = utf8_decodeCodePoint;


/*
  UTF8Decoder.prototype.codePointLength = function(buffer) {
    var opts = utf8_opts(buffer);
    if (!opts) return 0;
    return utf8_lengthCodePoint(opts.src);
  };

  UTF8Decoder.prototype.forEach = function(buffer, cb) {
    var opts = utf8_opts(buffer);
    if (!opts) return 0;
    var cberror = utf8_decoder_cbError(this.fatal);
    return utf8_forEach(opts.src, cb, cberror, this.ignoreBOM);
  };

  UTF8Decoder.prototype.decodeToString = function(buffer, options = {}) {
    var opts = utf8_opts(buffer);
    if (!opts) return null;
    var cberror = utf8_decoder_cbError(this.fatal);
    if (!options.stream) {
      var s = "";
      utf8_forEach(opts.src, function(cp){s+=String.fromCodePoint(cp);}, cberror, this.ignoreBOM);
      return s;
    }
  };

  UTF8Decoder.prototype.decodeToUTF16 = function(buffer, options = {}) {
    var opts = utf8_opts(buffer);
    if (!opts) return null;
    // decode utf16 => encode utf8
    var cberror = utf8_decoder_cbError(this.fatal);
    var cberror16 = ()=>{}//this.fatal? utf16_encoder_strictError : utf16_encoder_replaceError;
    var pos = 0;
    var cb = cp => pos += utf16_encodeCodePoint(cp,uint16Array,pos,cberror16);

    if (!options.stream) {
      var uint16Array = new Uint16Array(opts.src.length * 2);
      utf8_forEach(opts.src, cb, cberror, this.ignoreBOM);
      return uint16Array.slice(0,pos);
    }
  };

  UTF8Decoder.prototype.decodeToUTF32 = function(buffer, options = {}) {
    var opts = utf8_opts(buffer);
    if (!opts) return null;
    var cberror = utf8_decoder_cbError(this.fatal);
    // decode utf8 => encode utf32
    if (!options.stream) {
      var uint32Array = new Uint32Array(opts.src.length);
      var written = utf8_forEach(opts.src, function(c,i){uint32Array[i]=c;}, cberror, this.ignoreBOM);
      return uint32Array.slice(0,written);
    }
  };
*/