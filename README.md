# TextEncoderLite
TextEncoderLite is a "polyfill" library that allows to replace the TextEncoder class of javascript.<br>
The library is much slower than the official version, and it takes almost 300kb in memory (even if the table has been highly optimized)

Why this library since it already exists?<br>
Because I didn't see that the TextEncoder library already existed!<br>
Finally after renaming the library I wanted to make it the most performant polyfill available (successful)

# Usage
```javascript

var str = "a😆b😆c";
var res = new Uint8Array(14);
 
// encoder to "utf-8"
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
 
```
