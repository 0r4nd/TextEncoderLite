
/**
 * UTF16 encode/decode library
 */
const UTF16 = (function() {
  "use strict";

  // generic helper class
  const Helper = TextEncoderHelper;


  const cbget = function(a,i) { return a[i]; };
  const cbgetcc = function(s,i) { return s.charCodeAt(i); };
  const cbcheckend = function(s,i) { return i >= s.length; };
  const cbswapget = function(a,i) { var cp=a[i]; return (cp>>8)|((cp&0xff)<<8); };


  function utf8_lengthCodePoint(cp) {
    if (cp < 0x80) return 1;
    if (cp < 0x800) return 2;
    if (cp < 0x10000) return 3;
    if (cp < 0x110000) return 4;
    return 1;
  }

  function utf8_encodeCodePoint(cp, dst, i) {
    if (cp < 0x80) {
      dst[i] = cp;
      return 1;
    }
    if (cp < 0x800) {
      dst[i] = ((cp >> 6) & 0x1F) | 0xC0;
      dst[i+1] = (cp & 0x3F) | 0x80;
      return 2;
    }
    if (cp < 0x10000) {
      if (cp >= 0xD800 && cp <= 0xDFFF) {
        return 1;
      }
      dst[i] = ((cp >> 12) & 0x0F) | 0xE0;
      dst[i+1] = ((cp >> 6) & 0x3F) | 0x80;
      dst[i+2] = (cp & 0x3F) | 0x80;
      return 3;
    }
    if (cp <= 0x10FFFF) {
      dst[i] = ((cp >> 18) & 0x07) | 0xF0;
      dst[i+1] = ((cp >> 12) & 0x3F) | 0x80;
      dst[i+2] = ((cp >> 6) & 0x3F) | 0x80;
      dst[i+3] = (cp & 0x3F) | 0x80;
      return 4;
    }
    return 1;
  }
  // à tester sur le premier short
  //function utf16IsBigEndian(charCode) {
  //  if (charCode == 0xFFFE) console.log("little endian");
  //  if (charCode == 0xFEFF) console.log("big endian");
  //}

  function utf16_lengthCodePoint(cp) {
    if (cp < 0x10000) { // bmp plane
      if (cp >= 0xD800 && cp <= 0xDFFF) return 1; // not a character
      return 1;
    }
    if (cp >= 0x10FFFF) return 1; // too big
    var word = cp&0xFFFF;
    if (word == 0xFFFE || word == 0xFFFF) return 1; // invalid
    return 2;
  }

  function utf16_encodeCodePoint(cp, dst, i) {
    if (cp < 0x10000) {
      if (cp >= 0xD800 && cp <= 0xDFFF) return 1;
      dst[i++] = cp;
      return 1;
    }
    if (cp >= 0x10FFFF) return 1;
    var word = cp&0xFFFF;
    if (word == 0xFFFE || word == 0xFFFF) return 1;
    cp -= 0x10000;
    dst[i++] = (cp >> 10) + 0xD800; // ((cp >> 10) & 0x3FF) + 0xD800;
    dst[i++] = (cp & 0x3FF) + 0xDC00;
    return 2;
  }

  function utf16_length(src, getcc) {
    const max1 = 0xDBFF - 0xD800;
    const max2 = 0xDFFF - 0xDC00;
    var i = 0, dbl = 0, len = src.length-1;
    for (var c = 0; i < len; ++i) {
      c = (getcc(src,i) - 0xD800) & 0xFFFF;
      if (c <= max1) { // trick with unsigned property
        c = (getcc(src,i+1) - 0xDC00) & 0xFFFF;
        if (c <= max2) { ++dbl; ++i; }
      }
    }
    if (i < src.length) ++i;
    return i-dbl;
  }

  function utf16_decodeCodePointUnsafe(src, i, getcc) {
    var cplen = 1, c1 = getcc(src,i);
    if (c1 >= 0xDC00 && c1 <= 0xDFFF) { // U+FFFD REPLACEMENT CHARACTER
      c1 = 0xFFFD;
    } else if (c1 >= 0xD800 && c1 <= 0xDBFF) {
      var c2 = getcc(src,i+1);
      if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
        c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
        cplen = 2;
      } else { // U+FFFD REPLACEMENT CHARACTER
        c1 = 0xFFFD;
      }
    }
    return c1 | (cplen << 24);
  }

  function utf16_decodeCodePoint(src, i, getcc, checkend) {
    var cplen = 1, c1 = getcc(src,i);
    if (c1 >= 0xDC00 && c1 <= 0xDFFF) { // U+FFFD REPLACEMENT CHARACTER
      c1 = 0xFFFD;
    } else if (c1 >= 0xD800 && c1 <= 0xDBFF) {
      if (checkend(src,i+1)) { // U+FFFD REPLACEMENT CHARACTER
        c1 = 0xFFFD;
      } else {
        var c2 = getcc(src,i+1);
        if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
          c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
          cplen = 2;
        } else { // U+FFFD REPLACEMENT CHARACTER
          c1 = 0xFFFD;
        }
      }
    }
    return c1 | (cplen << 24);
  }



  function utf16_forEach(src, cb, getcc, incr=0) {
    var i = 0, c1 = 0, c2 = 0, cplen = 0;
    var len = src.length - (src.length & 1);

    // main loop
    while (i < len) {
      c1 = getcc(src,i++);
      if (c1 >= 0xDC00 && c1 <= 0xDFFF) { // U+FFFD REPLACEMENT CHARACTER
        c1 = 0xFFFD;
      } else if (c1 >= 0xD800 && c1 <= 0xDBFF) {
        c2 = getcc(src,i);
        if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
          c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
          i++;
        } else { // U+FFFD REPLACEMENT CHARACTER
          c1 = 0xFFFD;
        }
      }
      cb(c1, (cplen++) + incr, src);
    }
    // main loop alternative (slower)
    //while (i < len) {
    //  c1 = utf16_decodeCodePointUnsafe(src, i, getcc);
    //  i += c1 >> 24;
    //  cb(c1&0xffffff, (cplen++) + incr, src);
    //}

    // last
    if (i < src.length) {
      cb(getcc(src,i), (cplen++) + incr, src);
    }
    return cplen;
  }


  function utf16_opts(src, lowEndian) {
    var dim = 1;
    var srcTypeof = Helper.Typeof.types(src);
    var getcc = cbget;
    if (lowEndian) getcc = cbswapget;
    switch (srcTypeof[0]) {
      case 'string':
        getcc = cbgetcc;
        break;
      case 'array':
        var elemTypeof = Helper.Typeof(src[0]);
        if (elemTypeof == 'string') {
          getcc = cbgetcc;
          dim = 2;
        } else if (elemTypeof != 'number') return 0;
        break;
      case 'arraybuffer':
        src = new Uint16Array(src);
        break;
      case 'float32array':
      case 'float64array':
        return 0;
      default:
        if (srcTypeof[1] != 'typedarray') return 0;
        var bpe = src.BYTES_PER_ELEMENT;
        if (!bpe || bpe > 8) return 0;
        if (bpe <= 2) {
          if (bpe == 1) src = new Uint16Array(src.buffer);
          else if (bpe == 2) src = new Uint16Array(src.buffer);
        } else if (bpe == 4) {
          src = new Uint32Array(src.buffer);
          //if (lowEndian) getcc = function(a,i) {var cp=a[i]; return ((cp>>8)&0xff)|((cp&0xff)<<8);};
        } else src = new BigUint64Array(src.buffer);
        break;
    }
    return {
      src: src,
      dim: dim,
      srcTypeof: srcTypeof,
      getcc: getcc
    };
  }

  const UTF16 = Object.create(null);

  UTF16.decodeCodePointUnsafe = utf16_decodeCodePointUnsafe;
  UTF16.decodeCodePoint = utf16_decodeCodePoint;

  UTF16.length = function(src) {
    var cplen = 0, opts = utf16_opts(src);
    if (!opts) return 0;
    if (opts.dim == 1) src = [opts.src];
    for (var i = 0; i < src.length; i++) {
      cplen += utf16_lengthCodePoint(src[i], opts.getcc);
    }
    return cplen;
  };

  UTF16.forEach = function(src,cb) {
    var cplen = 0, opts = utf16_opts(src);
    if (!opts) return 0;
    if (opts.dim == 1) src = [opts.src];
    for (var i = 0; i < src.length; i++) {
      cplen += utf16_forEach(src[i], cb, opts.getcc, cplen);
    }
    return cplen;
  };

  // same as UTF16.forEach() but the source must be a string
  UTF16.stringForEach = function(str,cb) {
    if (!Helper.Typeof.isString(str)) return 0;
    return utf16_forEach(str, cb, cbgetcc, 0);
  };

  UTF16.toUTF8 = function(src) {
    //var buffer = new Uint8Array(256);
    var byteLength = 0, opts = utf16_opts(src);
    if (!opts) return null;
    if (opts.dim == 1) src = [opts.src];
    var utf8len = c => byteLength += utf8_lengthCodePoint(c);
    // decode utf16 => get utf8 length
    for (var i = 0; i < src.length; i++) {
      utf16_forEach(src[i], utf8len, opts.getcc);
    }
    // decode utf16 => encode utf8
    var pos = 0;
    var dst = new Uint8Array(byteLength);
    var utf8set = c => pos += utf8_encodeCodePoint(c,dst,pos);
    for (var i = 0; i < src.length; i++) {
      utf16_forEach(src[i], utf8set, opts.getcc);
    }
    return dst;
  };
  
  UTF16.toString = function(src) {
    
  };

  UTF16.toUTF32 = function(src) {
    //var buffer = new Uint8Array(256);
    var cplen = 0, opts = utf16_opts(src);
    if (!opts) return null;
    if (opts.dim == 1) src = [opts.src];
    // decode utf16 => get utf32 length
    for (var i = 0; i < src.length; i++) {
      cplen += utf16_lengthCodePoint(src[i], opts.getcc);
    }
    // decode utf16 => encode utf32
    var dst = new Uint32Array(cplen);
    for (var i = 0; i < src.length; i++) {
      utf16_forEach(src[i], (c,i)=>{dst[i]=c}, opts.getcc);
    }
    return dst;
  };


  return UTF16;
})();

