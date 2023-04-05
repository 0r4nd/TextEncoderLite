


/**
 * 
 * Common utility functions for Text-Encoders
 *
 */
const TextEncoderHelper = (function() {
  "use strict";

  const Helper = Object.create(null);


  /**
   * Usefull function for create privates methods/variables.
   * this object is automaticly cleaned by the garbage collector
   * when the instance is deleted.
   *
   * usage:
   *   const internal = Helper.createNameSpace();
   *   function Foo() {
   *     internal(this).imPrivate = ":)";
   *     this.imNot = ":(";
   *   }
   */
  Helper.createNameSpace = function() {
    var internal = function(key) {
      if (!internal.privateData.has(key)) {
        internal.privateData.set(key, Object.create(null));
      }
      return internal.privateData.get(key);
    };
    internal.privateData = new WeakMap();
    return internal;
  };



  Helper.createDict = function(obj) {
    if (obj) return Object.assign(Object.create(null), obj);
    return Object.create(null);
  };


  Helper.Typeof = (function() {
    "use strict";
    const tos = Object.prototype.toString;
    const fb = ['object','object']; // fallback
    const dict = Object.assign(Object.create(null), {
        // primitives
      'boolean': ['boolean','primitive'],
      'undefined': ['undefined','primitive'],
      'number': ['number','primitive'],
      'bigint': ['bigint','primitive'],
      'string': ['string','primitive'],
      'symbol': ['symbol','primitive'],
        // typeof(null) return "object" for legacy reasons, but null is a primitive
      '[object Null]': ['null','primitive'],
        // Primitive wrapper object
      '[object Boolean]': ['boolean','object'],
      '[object Undefined]': ['undefined','object'],
      '[object Number]': ['number','object'],
      '[object BigInt]': ['bigint','object'],
      '[object String]': ['string','object'],
      '[object Symbol]': ['symbol','object'],
        // Module-like objects
      '[object JSON]': ['json','object'],
      '[object Math]': ['math','object'],
        // Built-in classes
      '[object ArrayBuffer]': ['arraybuffer','object'],
      '[object DataView]': ['dataview','object'],
      '[object Int8Array]': ['int8array','typedarray'],
      '[object Uint8Array]': ['uint8array','typedarray'],
      '[object Uint8ClampedArray]': ['uint8clampedarray','typedarray'],
      '[object Int16Array]': ['int16array','typedarray'],
      '[object Uint16Array]': ['uint16array','typedarray'],
      '[object Int32Array]': ['int32array','typedarray'],
      '[object Uint32Array]': ['uint32array','typedarray'],
      '[object Float32Array]': ['float32array','typedarray'],
      '[object Float64Array]': ['float64array','typedarray'],
      '[object BigInt64Array]': ['bigint64array','typedarray'],
      '[object BigUint64Array]': ['biguint64array','typedarray'],
      '[object WeakSet]': ['weakset','object'],
      '[object WeakMap]': ['weakmap','object'],
      '[object Promise]': ['promise','object'],
      '[object Set]': ['set','object'],
      '[object Map]': ['map','object'],
        // Iterators
      '[object Map Iterator]': ['map iterator','iterator'],
      '[object Set Iterator]': ['set iterator','iterator'],
      '[object String Iterator]': ['string iterator','iterator'],
        // Miscellaneous
      '[object Date]': ['date','object'],
      '[object Array]': ['array','object'],
      '[object Error]': ['error','object'],
      '[object RegExp]': ['regexp','object'],
      '[object Function]': ['function','object'],
      '[object Arguments]': ['arguments','object'],
      '[object Generator]': ['generator','generator'],
      '[object GeneratorFunction]': ['generatorFunction','generator']
    });
    function Typeof(o) { return Typeof.types(o)[0]; }
    Typeof.types = o => dict[typeof(o)] || dict[tos.call(o)] || fb;
    Typeof.isFunction = o => Typeof(o) == "function";
    Typeof.isNumber = o => Typeof(o) == "number";
    Typeof.isPrimitive = o => Typeof.types(o)[1] == 'primitive';
    Typeof.isArray = o => tos.call(o)=='[object Array]';
    Typeof.isString = o => Typeof(o)=='string';
    Typeof.isTypedArray = o => Typeof.types(o)[1]=='typedarray';
    // ArrayBufferView serves as a superclass for types that provide access to the bytes of an ArrayBuffer.
    Typeof.isView = function(o) {
      //return ArrayBuffer.isView(o);
      var t = Typeof.types(o); return (t[0]=='dataview'||t[1]=='typedarray');
    };
    Typeof.isArrayOrString = function(o) {
      var t = Typeof(o); return (t=='array'||t=='string');
    };
    Typeof.isArrayOrTypedArray = function(o) {
      var t = Typeof.types(o); return (t[0]=='array'||t[1]=='typedarray');
    };
    Typeof.isArrayOrStringOrTypedArray = function(o) {
      var t = Typeof.types(o);
      return (t[0]=='array' || t[0]=='string' || t[1]=='typedarray');
    };
    Typeof.isIterable = o => (o==null)?false:Typeof(o[Symbol.iterator])=='function';
    Typeof.isIterator = o => Typeof.types(o)[1] == 'iterator';
    return Typeof;
  })();



  Helper.Queue = (function() {
    "use strict";
    // Class
    function Queue(array) {
      this.array = array || new Array(16);
      this.size = 0;
      this.first = 0;
      this.last = this.array.length-1;
    }
    Queue.prototype[Symbol.iterator] = function() { // make the class iterable
      const ptr = {first:this.first, size:this.size};
      const res = {value:this.array[this.first], done:false};
      return {
        next: () => {
          res.value = this.array[ptr.first],
          res.done = ptr.size-- <= 0,
          ptr.first = (ptr.first + 1) % this.array.length;
          return res;
        }
      };
    };
    Queue.prototype.isEmpty = function() { return this.size <= 0; };
    Queue.prototype.isFull = function() { return this.size >= this.array.length; };
    Queue.prototype.clear = function() {
      this.size = this.first = 0;
      this.last = this.array.length-1;
      return this;
    };
    Queue.prototype.push = function() {
      var len = Math.min(arguments.length, this.array.length-this.size);
      for (var i = 0; i < len; i++) {
        this.last = (this.last + 1) % this.array.length;
        this.array[this.last] = arguments[i];
        this.size++;
      }
      return this;
    };
    Queue.prototype.push1 = function(elem) {
      this.last = (this.last + 1) % this.array.length;
      this.array[this.last] = elem;
      this.size++;
      return this;
    };
    Queue.prototype.shift = function() {
      if (this.isEmpty()) return undefined;
      var f = this.first;
      this.first = (f + 1) % this.array.length;
      if (--this.size <= 0) this.clear();
      return this.array[f];
    };
    Queue.prototype.forEach = function(callback) {
      if (!Helper.Typeof.isFunction(callback)) return this;
      var f = this.first;
      for (var i = 0; i < this.size; i++) {
        callback(this.array[f], i, this.array);
        f = (f + 1) % this.array.length;
      }
      return this;
    };
    Queue.prototype.fetch = function() {
      var a = new this.array.constructor(this.size);
      this.forEach((d,i)=>{a[i]=d});
      return a;
    };
    Queue.prototype.toString = function(stringify) {
      var s = "";
      stringify = Helper.Typeof.isFunction(stringify)? stringify : JSON.stringify;
      this.forEach(function(d,i){s += stringify(d) + (i==this.size-1?"":",")}, this);
      return s;
    };
    return Queue;
  })();


  Helper.BomHeaderLUT = {
    "BOM":          "fffe",
    "BOM_BE":       "feff",
    "BOM_LE":       "fffe",
    "BOM_UTF8":     "efbb bf",
    "BOM_UTF16":    "fffe",
    "BOM_UTF16_BE": "feff",
    "BOM_UTF16_LE": "fffe",
    "BOM_UTF32":    "fffe 0000",
    "BOM_UTF32_BE": "0000 feff",
    "BOM_UTF32_LE": "fffe 0000"
  };

  function cp2string(cp) {
    if (cp <= 0xFFFF) {
      s += String.fromCharCode(cp);
      return;
    }
    cp -= 0x10000;
    return String.fromCharCode((cp>>10)+0xD800, (cp&0x3FF)+0xDC00);
    // return String.fromCodePoint(cp); // faster
  }


  var base10LUT = Uint8Array.of(0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23,24,25,32,33,34,35,36,37,38,39,40,41,48,49,50,51,52,53,54,55,56,57,64,65,66,67,68,69,70,71,72,73,80,81,82,83,84,85,86,87,88,89,96,97,98,99,100,101,102,103,104,105,112,113,114,115,116,117,118,119,120,121,128,129,130,131,132,133,134,135,136,137,144,145,146,147,148,149,150,151,152,153);
  var base16LUT = Uint16Array.of(12336,12337,12338,12339,12340,12341,12342,12343,12344,12345,12385,12386,12387,12388,12389,12390,12592,12593,12594,12595,12596,12597,12598,12599,12600,12601,12641,12642,12643,12644,12645,12646,12848,12849,12850,12851,12852,12853,12854,12855,12856,12857,12897,12898,12899,12900,12901,12902,13104,13105,13106,13107,13108,13109,13110,13111,13112,13113,13153,13154,13155,13156,13157,13158,13360,13361,13362,13363,13364,13365,13366,13367,13368,13369,13409,13410,13411,13412,13413,13414,13616,13617,13618,13619,13620,13621,13622,13623,13624,13625,13665,13666,13667,13668,13669,13670,13872,13873,13874,13875,13876,13877,13878,13879,13880,13881,13921,13922,13923,13924,13925,13926,14128,14129,14130,14131,14132,14133,14134,14135,14136,14137,14177,14178,14179,14180,14181,14182,14384,14385,14386,14387,14388,14389,14390,14391,14392,14393,14433,14434,14435,14436,14437,14438,14640,14641,14642,14643,14644,14645,14646,14647,14648,14649,14689,14690,14691,14692,14693,14694,24880,24881,24882,24883,24884,24885,24886,24887,24888,24889,24929,24930,24931,24932,24933,24934,25136,25137,25138,25139,25140,25141,25142,25143,25144,25145,25185,25186,25187,25188,25189,25190,25392,25393,25394,25395,25396,25397,25398,25399,25400,25401,25441,25442,25443,25444,25445,25446,25648,25649,25650,25651,25652,25653,25654,25655,25656,25657,25697,25698,25699,25700,25701,25702,25904,25905,25906,25907,25908,25909,25910,25911,25912,25913,25953,25954,25955,25956,25957,25958,26160,26161,26162,26163,26164,26165,26166,26167,26168,26169,26209,26210,26211,26212,26213,26214);
  const pow100LUT = [1/10000000,1/100000,1/1000,1/10, 1/1000000,1/10000,1/100,1];

  function generate2dLUT(a, bits=16, suborig) { // a = alphabet
    var shift = bits>>1, len = a.length;
    var res = bits==16? new Uint16Array(len*len) : new Uint8Array(len*len);
    var orig = suborig? a.charCodeAt(0) : 0;
    for (var y = 0; y < len; y++)
      for (var x = 0; x < len; x++) {
        res[y*len+x] = ((a.charCodeAt(x)-orig) | ((a.charCodeAt(y)-orig)<<shift));
      }
    return res;
  }
  function generate4dLUT(a,suborig) { // a = alphabet
    var res = new Uint16Array(a.length*a.length*a.length*a.length);
    var len = a.length, orig = suborig? a.charCodeAt(0) : 0;
    for (var w = 0; w < len; w++)
      for (var z = 0; z < len; z++)
        for (var y = 0; y < len; y++)
          for (var x = 0; x < len; x++) {
            var off =  w*len*len*len + z*len*len + y*len + x;
            res[off] = ((a.charCodeAt(x)-orig) | ((a.charCodeAt(y)-orig)<<4)) |
                       (((a.charCodeAt(z)-orig)<<8) | ((a.charCodeAt(w)-orig)<<12));
          }
    return res;
  }
  Helper.generateMathLUT = function() {
    base10LUT = generate2dLUT("0123456789", 8, true);
    base16LUT = generate2dLUT("0123456789abcdef", 16);
  };



  // errors callbacks
  Helper.cbErrors_forEach = Helper.createDict({
    "ignore": function() {
      return 0;
    },
    "strict": function(a,i,cp) {
      throw TypeError(`'${this.encoding}' codec can't encode character ${cp} in position ${i}`);
    },
    "replace": function(a,i) {
      a[i] = 63; // "?".charCodeAt(0)
      return 1;
    },
    "backslashreplace": function(a,i,cp) {
      var d = 0;
      a[i++] = 92; // "\\".charCodeAt(0)
      if (cp <= 0xff) {
        a[i++] = 120; // "x".charCodeAt(0)
        d = base16LUT[cp & 255];
        a[i++] = d >> 8;
        a[i++] = d & 0xff;
        return 4;
      }
      if (cp <= 0xffff) {
        a[i++] = 117; // "u".charCodeAt(0)
        d = base16LUT[(cp >> 8) & 255];
        a[i++] = d >> 8;
        a[i++] = d & 0xff;
        d = base16LUT[cp & 255];
        a[i++] = d >> 8;
        a[i++] = d & 0xff;
        return 6;
      }
      a[i++] = 85; // "U".charCodeAt(0)
      d = base16LUT[(cp >> 24) & 255];
      a[i++] = d >> 8;
      a[i++] = d & 0xff;
      d = base16LUT[(cp >> 16) & 255];
      a[i++] = d >> 8;
      a[i++] = d & 0xff;
      d = base16LUT[(cp >> 8) & 255];
      a[i++] = d >> 8;
      a[i++] = d & 0xff;
      d = base16LUT[cp & 255];
      a[i++] = d >> 8;
      a[i++] = d & 0xff;
      return 10;
    },
    "xmlcharrefreplace": function(a,i,cp) {
      var d = 0, digits = 10;
      if (cp < 10) digits = 1;
      else if (cp < 100) digits = 2;
      else if (cp < 1000) digits = 3
      else if (cp < 10000) digits = 4;
      else if (cp < 100000) digits = 5;
      else if (cp < 1000000) digits = 6;
      else if (cp < 10000000) digits = 7;
      else if (cp < 100000000) digits = 8;
      else if (cp < 1000000000) digits = 9;
      var last = digits & 1;
      var end = digits >> 1;
      var x = (4 - end) + ((last^1) << 2);
      a[i++] = 38; // "&".charCodeAt(0)
      a[i++] = 35; // "#".charCodeAt(0)
      for (end = x + end; x < end; x++) {
        d = base10LUT[Math.floor(cp * pow100LUT[x]) % 100];
        a[i++] = (d >> 4) + 48;
        a[i++] = (d & 15) + 48;
      }
      if (last) a[i++] = (cp % 10) + 48;
      a[i++] = 59; // ";".charCodeAt(0)
      return digits + 3;
    }
  });



  Helper.cbErrors_every = Helper.createDict({
    "ignore": Helper.cbErrors_forEach["ignore"],
    "strict": Helper.cbErrors_forEach["strict"],
    "replace": function(a,i) {
      if (i >= a.length) return -1;
      a[i] = 63; // "?".charCodeAt(0)
      return 1;
    },
    "backslashreplace": function(a,i,cp) {
      var d = 0;
      a[i++] = 92; // "\\".charCodeAt(0)
      if (cp <= 0xff) {
        if (i + 4 > a.length) return -1;
        a[i++] = 120; // "x".charCodeAt(0)
        d = base16LUT[cp & 255];
        a[i++] = d >> 8;
        a[i++] = d & 0xff;
        return 4;
      }
      if (cp <= 0xffff) {
        if (i + 6 > a.length) return -1;
        a[i++] = 117; // "u".charCodeAt(0)
        d = base16LUT[(cp >> 8) & 255];
        a[i++] = d >> 8;
        a[i++] = d & 0xff;
        d = base16LUT[cp & 255];
        a[i++] = d >> 8;
        a[i++] = d & 0xff;
        return 6;
      }
      if (i + 10 > a.length) return -1;
      a[i++] = 85; // "U".charCodeAt(0)
      d = base16LUT[(cp >> 24) & 255];
      a[i++] = d >> 8;
      a[i++] = d & 0xff;
      d = base16LUT[(cp >> 16) & 255];
      a[i++] = d >> 8;
      a[i++] = d & 0xff;
      d = base16LUT[(cp >> 8) & 255];
      a[i++] = d >> 8;
      a[i++] = d & 0xff;
      d = base16LUT[cp & 255];
      a[i++] = d >> 8;
      a[i++] = d & 0xff;
      return 10;
    },
    "xmlcharrefreplace": function(a,i,cp) {
      var d = 0, digits = 10;
      if (cp < 10) digits = 1;
      else if (cp < 100) digits = 2;
      else if (cp < 1000) digits = 3
      else if (cp < 10000) digits = 4;
      else if (cp < 100000) digits = 5;
      else if (cp < 1000000) digits = 6;
      else if (cp < 10000000) digits = 7;
      else if (cp < 100000000) digits = 8;
      else if (cp < 1000000000) digits = 9;
      if (i + digits + 3 > a.length) return -1;
      var last = digits & 1;
      var end = digits >> 1;
      var x = (4 - end) + ((last^1) << 2);
      a[i++] = 38; // "&".charCodeAt(0)
      a[i++] = 35; // "#".charCodeAt(0)
      for (end = x + end; x < end; x++) {
        d = base10LUT[Math.floor(cp * pow100LUT[x]) % 100];
        a[i++] = (d >> 4) + 48;
        a[i++] = (d & 15) + 48;
      }
      if (last) a[i++] = 48 + (cp % 10);
      a[i++] = 59; // ";".charCodeAt(0)
      return digits + 3;
    }
  });


  Helper.utf16_isHighSurrogate = cc => (cc & 0xFC00) == 0xD800;
  Helper.utf16_isLowSurrogate = cc => (cc & 0xFC00) == 0xDC00;
  Helper.utf16_isSurrogate = cc => (cc & 0xF800) == 0xD800;

  Helper.utf16_string_forEach = function(string, callback, thisArg) {
    var read = 0, write = 0, c1 = 0, c2 = 0;
    var len = string.length - 1;
    // main
    while (read < len) {
      c1 = string.charCodeAt(read++);
       // look at "Optimisation" section for more explications
       // (c1 >= 0xD800 && c1 <= 0xDBFF)
      if ((c1 & 0xFC00) == 0xD800) {
        c2 = string.charCodeAt(read);
        // max: "\uDBFF\uDFFF" == 0x10FFFF
        if ((c2 & 0xFC00) == 0xDC00) { // (c2 >= 0xDC00 && c2 <= 0xDFFF)
          c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
          read++;
        }
      }
      callback.call(thisArg, c1, write++, string);
    }
    // finalizer
    if (read < string.length) {
      c1 = string.charCodeAt(read++);
      callback.call(thisArg, c1, write, string);
    }
    return read;
  };
  Helper.utf16_string_forEach_replaceChar = function(string, callback, thisArg, replaceChar = 0xFFFD) {
    var read = 0, write = 0, c1 = 0, c2 = 0, cc = 0;
    var len = string.length - 1;
    // main
    while (read < len) {
      c1 = string.charCodeAt(read++);
      cc = replaceChar;
      if ((c1 & 0xF800) - 0xD800) { // (c1 < 0xD800 || c1 > 0xDFFF)
        cc = c1;
      } else if ((c1 & 0xFC00) == 0xD800) { // (c1 >= 0xD800 && c1 <= 0xDBFF)
        c2 = string.charCodeAt(read);
        if ((c2 & 0xFC00) == 0xDC00) { // (c2 >= 0xDC00 && c2 <= 0xDFFF)
          cc = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
          read++;
        }
      }
      callback.call(thisArg, cc, write++, string);
    }
    // finalizer
    if (read < string.length) {
      c1 = string.charCodeAt(read++);
      if ((c1 & 0xF800) == 0xD800) c1 = replaceChar; // (c1 >= 0xD800 && c1 <= 0xDFFF)
      callback.call(thisArg, c1, write, string);
    }
    return read;
  };




  Helper.utf16_string_every = function(string, callback, thisArg) {
    var read = 0, write = 0, c1 = 0, c2 = 0;
    var len = string.length - 1;
    // main
    while (read < len) {
      c1 = string.charCodeAt(read++);
      if ((c1 & 0xFC00) == 0xD800) {
        c2 = string.charCodeAt(read);
        if ((c2 & 0xFC00) == 0xDC00) {
          c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
          read++;
        }
      }
      if (!callback.call(thisArg, c1, write++, string)) return read;
    }
    // finalizer
    if (read < string.length) {
      c1 = string.charCodeAt(read++);
      if (!callback.call(thisArg, c1, write, string)) return read;
      read += 1;
    }
    return read;
  };
  Helper.utf16_string_every_replaceChar = function(string, callback, thisArg, replaceChar = 0xFFFD) {
    var read = 0, write = 0, c1 = 0, c2 = 0, cc = 0, prevRead = 0;
    var len = string.length - 1;
    // main
    while (read < len) {
      prevRead = read;
      c1 = string.charCodeAt(read++);
      cc = replaceChar;
      if ((c1 & 0xF800) - 0xD800) { // (c1 < 0xD800 || c1 > 0xDFFF)
        cc = c1;
      } else if ((c1 & 0xFC00) == 0xD800) { // (c1 >= 0xD800 && c1 <= 0xDBFF)
        c2 = string.charCodeAt(read);
        if ((c2 & 0xFC00) == 0xDC00) { // (c2 >= 0xDC00 && c2 <= 0xDFFF)
          cc = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
          read++;
        }
      }
      if (!callback.call(thisArg, cc, write++, string)) return prevRead;
    }
    // finalizer
    if (read < string.length) {
      c1 = string.charCodeAt(read++);
      if ((c1 & 0xF800) == 0xD800) c1 = replaceChar; // (c1 >= 0xD800 && c1 <= 0xDFFF)
      if (!callback.call(thisArg, c1, write, string)) return read-1;
    }
    return read;
  };




  const errorsDict = Helper.createDict({
    "ignore": "ignore",
    "strict": "strict",
    "replace": "replace",
    "backslashreplace": "backslashreplace",
    "xmlcharrefreplace": "xmlcharrefreplace"
  });
  Helper.getErrorType = function(errors) {
    if (!Helper.Typeof.isString(errors)) return;
    return errorsDict[errors.trim().toLowerCase()] || "replace";
  };




  // trash tools (test, debug, etc)
  Helper.bits = function(v, len=32) {
    var s = "0b"
    for (var i = 0; i < len; i++) {
      if (((i+8)%8)==0) s += '_';
      s += (v & (1<<(len-1-i)))? 1:0;
    }
    return s;
  };
  Helper.array2dAt = function(a,i) {
    var w = a[0].length, t = (i/w)|0;
    i -= w*t; a = a[t];
    return a.charCodeAt? a.charCodeAt(i) : a[i];
  };
  Helper.array2dLength = function(a) {
    var w = a[0].length, h = a.length-1;
    return w*h + a[h].length;
  };



  return Helper;
})();




/*
//////////////////////////////////////////// TRASH /////////////////////////////////////////



////////////////////////////////////////////////
// Error replacement codepoints:
////////////////////////////////////////////////

  Unicode: "�"
    utf-8: [0xEF,0xBF,0xBD] - [239,191,189]
    unicode: "&#65533;" - "\ufffd" - 0xFFFD

  SingleByteCharset: "?"
    ascii: "&#63;" - "\x3f" - 0x3F


  Worst cases for utf8 encoding:

    "replace" mode:
      input:   "\uD800\uD800".length == 2
      output: [239,191,189, 239,...].length == 6 ("��")
      ratio: 1/3

    "backslashreplace" mode:
      input:   "\uD800\uD800".length == 2
      output:  [92,117,70,70,70,68, 92,...].length == 12 ("\\uFFFD\\uFFFD")
      ratio: 1/6

    "xmlcharrefreplace" mode:
      input:   "\uD800\uD800".length == 2
      output:  [38,35,53,53,50,57,54, 38,...].length == 16 ("&#55296;&#55296;")
      ratio: 1/8



////////////////////////////////////////////////
// Optimisations:
////////////////////////////////////////////////
 

//////// Surrogates pair ////////

  High surrogate pair - 0xD800–0xDBFF:
    0xD800 =  0b_11011000_00000000 : lowbound 
    0xDBFF =  0b_11011011_11111111 : highbound
    0xFC00 =  0b_11111100_00000000 : mask (6 last bits)
    0xD800 =  0b_11011000_00000000 : equal (6 most significant bits)
  
    equivalences: (cc >= 0xD800 && cc <= 0xDBFF) ==
                 ((cc & 0xFC00) == 0xD800) ==
                 ((cc >> 10) == 54)
    
  
  Low surrogate pair - 0xDC00–0xDFFF:
    0xDC00 =  0b_11011100_00000000 : lowbound
    0xDFFF =  0b_11011111_11111111 : highbound
    0xFC00 =  0b_11111100_00000000 : mask (6 last bits)
    0xDC00 =  0b_11011100_00000000 : equal (6 most significant bits)
  
    equivalences: (cc >= 0xDC00 && cc <= 0xDFFF) ==
                 ((cc & 0xFC00) == 0xDC00) == 
                 ((cc >> 10) == 55)
  
  
  Both:
    0xD800 =  0b_11011000_00000000 : lowbound 
    0xDFFF =  0b_11011111_11111111 : highbound
    0xF800 =  0b_11111000_00000000 : mask (5 last bits)
    0xD800 =  0b_11011000_00000000 : equal (5 most significant bits)
  
    equivalences: (cc >= 0xD800 && cc <= 0xDFFF) ==
                 ((cc & 0xF800) == 0xD800) ==
                 ((cc >> 11) == 27)




////////////////////////////////////////////////
// Usefull ressources:
////////////////////////////////////////////////

  https://encoding.spec.whatwg.org/#dom-textencoder


*/






