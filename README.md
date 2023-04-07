# TextEncoderLite
TextEncoderLite is a Polyfill that allows to replace the [TextEncoder](https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API) API of javascript.<br>
This encoder is 4x to 10x slower than API (depend of the charset and usage of V8 or Spidermonkey), decoder is 5x to 10x slower.<br>
The module takes almost 300kb in memory (even if the table has been optimized)

Why this library since it already exists as API?<br>
Because I didn't see that the TextEncoder API already existed!<br>

# Implementation status
Encoder.label:
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
'replacement'. This decodes empty input into empty output and any other arbitrary-length input into a single replacement character. It is used to prevent attacks that mismatch encodings between the client and server. The following encodings also map to the replacement encoding: ISO-2022-CN, ISO-2022-CN-ext, 'iso-2022-kr', and 'hz-gb-2312'.

# Usage
```javascript

var str = "a😆b😆c";
var res = new Uint8Array(14);
 
var encoder = new TextEncoderLite("utf-8", { 
                                    //experimental: true,
                                    errorMode: "replace",
                                    //errorMode: "ignore",
                                    //errorMode: "backslashreplace",
                                    //errorMode: "xmlcharrefreplace",
                                    //errorMode: "strict",
                                 });
var decoder = new TextDecoderLite("utf-8", {fatal:true, ignoreBOM:true});

var tst = encoder.encodeInto(str, res);
console.log(decoder.decode(res), res, tst);
 
```
