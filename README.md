# TextEncoderLite
This is a Polyfill that allows to replace the [TextEncoder API](https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API) of javascript.<br>
Why this library since it already exists as API? Because I didn't see that the TextEncoder API already existed!<br>

# Performance
- The encoder/decoder are 4x to 10x slower than API (depend of the charset and usage of V8 or Spidermonkey)
- The module takes ~150kb in memory (the tables have been optimized)

# Implementation status
### TextDecoderLite() - label:
- The recommended encoding for the Web: ✅<br>
"utf-8"<br><br>
- The legacy single-byte encodings: ✅<br>
"ibm866", "iso-8859-2", "iso-8859-3", "iso-8859-4", "iso-8859-5", "iso-8859-6", "iso-8859-7", "iso-8859-8", "iso-8859-8i", "iso-8859-10", "iso-8859-13", "iso-8859-14", "iso-8859-15", "iso-8859-16", "koi8-r", "koi8-u", "macintosh", "windows-874", "windows-1250", "windows-1251", "windows-1252", "windows-1253", "windows-1254", "windows-1255", "windows-1256", "windows-1257", "windows-1258", "x-mac-cyrillic"<br><br>
- The legacy multi-byte Chinese (simplified) encodings: ⭕<br>
"gbk", "gb18030"<br><br>
- The legacy multi-byte Chinese (traditional) encoding: ⭕<br>
"big5"<br><br>
- The legacy multi-byte Japanese encodings: ⭕<br>
"euc-jp", "iso-2022-jp", "shift_jis"<br><br>
- The legacy multi-byte Korean encodings: ⭕<br>
"euc-kr"<br><br>
- The legacy miscellaneous encodings: ⭕<br>
"utf-16be", "utf-16le", "x-user-defined"<br><br>
- A special encoding ⭕<br>
"replacement". This decodes empty input into empty output and any other arbitrary-length input into a single replacement character. It is used to prevent attacks that mismatch encodings between the client and server. The following encodings also map to the replacement encoding: ISO-2022-CN, ISO-2022-CN-ext, "iso-2022-kr", and "hz-gb-2312".

### TextEncoderLite() - experimental:
- The official TextEncoder API can only encode to "utf-8"
- if "experimental:true" is set, the module can also encode to (already implemented) labels
```javascript
var utf8Enc = new TextEncoderLite(); // default is "utf-8" like API
var win1252Enc = new TextEncoderLite("windows-1252", {experimental:true});
var res = new Uint8Array(20);

utf8Enc.encodeInto("hell⚽", res);
console.log(res);
win1252Enc.encodeInto("hell⚽", res);
console.log(res);

// encoding can generate errors, "errorMode" define an error handling mode.
// "strict"             Raises an exception if the data cannot be converted.
// "replace"            Substitutes a special marker character ("�" or "?") for data that cannot be encoded.
// "ignore"             Skips the data.
// "xmlcharrefreplace"  XML character (exemple: "&#55296;&#55296;") (encoding only)
// "backslashreplace"   escape sequence (exemple: "\\uFFFD\\uFFFD") (encoding only)
var greekEnc = new TextEncoderLite("greek8", {experimental:true, errorMode:"backslashreplace"});
greekEnc.encodeInto("hell⚽", res);
console.log(res);
```
      
# Usage
```javascript

var str = "a😆b😆c";
var res = new Uint8Array(14);
 
var encoder = new TextEncoderLite();
var decoder = new TextDecoderLite("utf-8", {fatal:true, ignoreBOM:true});

var tst = encoder.encodeInto(str, res);
console.log(decoder.decode(res), res, tst);
 
```
