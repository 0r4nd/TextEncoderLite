# TextEncoderLite
TextEncoderLite is a "polyfill" library that allows to replace the TextEncoder class of javascript.<br>
The encoder is 4x to 10x slower than official version (depend of the charset and engine V8 or Spidermonkey), decoder is 5x to 10x slower<br>
The library takes almost 300kb in memory (even if the table has been optimized)

Why this library since it already exists?<br>
Because I didn't see that the TextEncoder library already existed!<br>

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
