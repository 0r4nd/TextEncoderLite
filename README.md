# TextEncoderLite
TextEncoderLite is a "polyfill" library that allows to replace the TextEncoder class of javascript.<br>
The encoder is 4x to 10x slower than official version (depend of the charset and engine V8 or Spidermonkey), decoder is 5x to 10x slower.<br>
The library takes almost 300kb in memory (even if the table has been optimized)

Why this library since it already exists?<br>
Because I didn't see that the TextEncoder library already existed!<br>

# Implementation status
Encoder.label:
- "utf-8" ✅<br>
- 8bits legacy ✅<br>
"ibm866", "iso-8859-2", "iso-8859-3", "iso-8859-4", "iso-8859-5", "iso-8859-6", "iso-8859-7", "iso-8859-8", "iso-8859-8i", "iso-8859-10", "iso-8859-13", "iso-8859-14", "iso-8859-15", "iso-8859-16", "koi8-r", "koi8-u", "macintosh", "windows-874", "windows-1250", "windows-1251", "windows-1252", "windows-1253", "windows-1254", "windows-1255", "windows-1256", "windows-1257", "windows-1258", "x-mac-cyrillic"
- "gbk" ⭕<br>
- "gb18030" ⭕<br>
- "big5" ⭕<br>
- "euc-jp" ⭕<br>
- "iso-2022-jp" ⭕<br>
- "shift_jis" ⭕<br>
- "euc-kr" ⭕<br>
- "replacement" ⭕<br>
- "utf-16be" ⭕<br>
- "utf-16le" ⭕<br>
- "x-user-defined" ⭕<br>
    
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
