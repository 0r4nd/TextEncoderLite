
/**
 * UTF32 encode/decode library
 */
const UTF32 = (function() {
  "use strict";

  // generic helper class
  const Helper = TextEncoderHelper;


  function utf8cplength(cp) {
    if (cp < 0x80) return 1;
    if (cp < 0x800) return 2;
    if (cp < 0x10000) return 3;
    if (cp < 0x110000) return 4;
    return 1;
  }
  function utf8encode(cp, dst, i) {
    if (cp < 0x80) {
      dst[i] = cp;
      return 1;
    }
    if (cp < 0x800) {
      dst[i] = ((cp >> 6) & 0x1f) | 0xc0;
      dst[i+1] = (cp & 0x3f) | 0x80;
      return 2;
    }
    if (cp < 0x10000) {
      dst[i] = ((cp >> 12) & 0x0f) | 0xe0;
      dst[i+1] = ((cp >> 6) & 0x3f) | 0x80;
      dst[i+2] = (cp & 0x3f) | 0x80;
      return 3;
    }
    if (cp < 0x110000) {
      dst[i] = ((cp >> 18) & 0x07) | 0xf0;
      dst[i+1] = ((cp >> 12) & 0x3f) | 0x80;
      dst[i+2] = ((cp >> 6) & 0x3f) | 0x80;
      dst[i+3] = (cp & 0x3f) | 0x80;
      return 4;
    }
    return 1;
  }

  function utf16cplength(cp) {
    if (cp < 0x10000) { // bmp plane
      if (cp >= 0xD800 && cp <= 0xDFFF) return 1; // not a character
      return 1;
    }
    if (cp >= 0x10FFFF) return 1; // too big
    var word = cp&0xffff;
    if (word == 0xFFFE || word == 0xFFFF) return 1; // invalid
    return 2;
  }
  function utf16encode(cp, dst, i) {
    if (cp < 0x10000) {
      if (cp >= 0xD800 && cp <= 0xDFFF) return 1;
      dst[i++] = cp;
      return 1;
    }
    if (cp >= 0x10FFFF) return 1;
    var word = cp&0xffff;
    if (word == 0xFFFE || word == 0xFFFF) return 1;
    cp -= 0x10000;
    dst[i++] = (cp >> 10) + 0xD800; // ((cp >> 10) & 0x3FF) + 0xD800;
    dst[i++] = (cp & 0x3FF) + 0xDC00;
    return 2;
  }

  function cplength_UTF32(src, cb) {
    return src.length;
  }
  function forEach_UTF32(thisArg, src, cb) {
    var len = src.length;
    thisArg = thisArg || this;
    for (var i = 0; i < len; ++i) cb.call(thisArg, src[i], i, src);
    return len;
  }
  function opts_UTF32(src, lowEndian) {
    var srcTypeof = Helper.Typeof.types(src);
    //if (lowEndian) getCharCodeAt = function(a,i) {var cp=a[i]; return (cp>>8)|((cp&0xff)<<8);};
    switch (srcTypeof[0]) {
      case 'string':
        return 0;
      case 'array':
        var elemTypeof = Helper.Typeof(src[0]);
        if (elemTypeof != 'number') return 0;
        break;
      case 'arraybuffer':
        src = new Uint32Array(src);
        break;
      case 'float32array':
      case 'float64array':
        return 0;
      default:
        if (srcTypeof[1] != 'typedarray') return 0;
        var bpe = src.BYTES_PER_ELEMENT;
        if (!bpe || bpe > 8) return 0;
        if (bpe <= 2) {
          if (bpe == 1) src = new Uint8Array(src.buffer);
          else if (bpe == 2) src = new Uint16Array(src.buffer);
        } else if (bpe == 4) {
          src = new Uint32Array(src.buffer);
          //if (lowEndian) getCharCodeAt = function(a,i) {var cp=a[i]; return ((cp>>8)&0xff)|((cp&0xff)<<8);};
        } else src = new BigUint64Array(src.buffer);
        break;
    }
    return {
      src: src,
      srcTypeof: srcTypeof,
    };
  }

  const UTF32 = Object.create(null);

  UTF32.length = function(src) {
    var opts = opts_UTF32(src);
    if (!opts) return 0;
    return cplength_UTF32(opts.src);
  };

  UTF32.forEach = function(src,cb,thisArg) {
    var opts = opts_UTF32(src);
    if (!opts) return 0;
    return forEach_UTF32(thisArg, opts.src, cb);
  };

  UTF32.toUTF8 = function(src) {
    //var buffer = new Uint8Array(256);
    var utf8len = 0, opts = opts_UTF32(src);
    if (!opts) return null;
    var utf8lenCallback = c => utf8len += utf8cplength(c);
    // get utf32 length
    forEach_UTF32(this, opts.src, utf8lenCallback);
    // decode utf32 => encode utf8
    var pos = 0, dst = new Uint8Array(utf8len);
    var utf8setCallback = c => pos += utf8encode(c,dst,pos);
    forEach_UTF32(this, opts.src, utf8setCallback);
    return dst;
  };

  UTF32.toUTF16 = function(src) {
    //var buffer = new Uint8Array(256);
    var utf16len = 0, opts = opts_UTF32(src);
    if (!opts) return null;
    var utf16lenCallback = c => utf16len += utf16cplength(c);
    // get utf32 length
    forEach_UTF32(this, opts.src, utf16lenCallback);
    // decode utf32 => encode utf16
    var pos = 0, dst = new Uint16Array(utf16len);
    var utf16setCallback = c => pos += utf16encode(c,dst,pos);
    forEach_UTF32(this, opts.src, utf16setCallback);
    return dst;
  };

  return UTF32;
})();

