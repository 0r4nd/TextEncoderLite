
/**
 * Most common 8 bits charsets used on internet
 *
 * https://www.iana.org/assignments/character-sets/character-sets.xhtml
 * https://encoding.spec.whatwg.org/#single-byte-encoding
 */

// Single byte charset
const [Text8Encoder, Text8Decoder] = (function() {
  "use strict";

  // generic helper class
  const Helper = TextEncoderHelper;
  if (typeof(Helper) == 'undefined') {
    console.error("TextEncoderHelper is missing, did you include this file before TextEncoderHelper.js ?");
    return [null, null];
  }


  const charsetAliasesDict = Helper.createDict({
    // IBM866
    "866":0, "cp866":0, "csibm866":0, "ibm866":0,
    // ISO-8859-2
    "csisolatin2":1, "iso-8859-2":1, "iso-ir-101":1, "iso8859-2":1, "iso88592":1, "iso_8859-2":1, "iso_8859-2:1987":1, "l2":1, "latin2":1,
    // ISO-8859-3
    "csisolatin3":2, "iso-8859-3":2, "iso-ir-109":2, "iso8859-3":2, "iso88593":2, "iso_8859-3":2, "iso_8859-3:1988":2, "l3":2, "latin3":2,
    // ISO-8859-4
    "csisolatin4":3, "iso-8859-4":3, "iso-ir-110":3, "iso8859-4":3, "iso88594":3, "iso_8859-4":3, "iso_8859-4:1988":3, "l4":3, "latin4":3,
    // ISO-8859-5
    "csisolatincyrillic":4, "cyrillic":4, "iso-8859-5":4, "iso-ir-144":4, "iso88595":4, "iso_8859-5":4, "iso_8859-5:1988":4,
    // ISO-8859-6
    "arabic":5, "asmo-708":5, "csiso88596e":5, "csiso88596i":5, "csisolatinarabic":5, "ecma-114":5, "iso-8859-6":5, "iso-8859-6-e":5, "iso-8859-6-i":5, "iso-ir-127":5, "iso8859-6":5, "iso88596":5, "iso_8859-6":5, "iso_8859-6:1987":5,
    // ISO-8859-7
    "csisolatingreek":6, "ecma-118":6, "elot_928":6, "greek":6, "greek8":6, "iso-8859-7":6, "iso-ir-126":6, "iso8859-7":6, "iso88597":6, "iso_8859-7":6, "iso_8859-7:1987":6, "sun_eu_greek":6,
    // ISO-8859-8
    "csiso88598e":7, "csisolatinhebrew":7, "hebrew":7, "iso-8859-8":7, "iso-8859-8-e":7, "iso-ir-138":7, "iso8859-8":7, "iso88598":7, "iso_8859-8":7, "iso_8859-8:1988":7, "visual":7,
    // ISO-8859-8-I
    "csiso88598i":8, "iso-8859-8-i":8, "iso-8859-8i":8, "logical":8,
    // ISO-8859-10
    "csisolatin6":9, "iso-8859-10":9, "iso-ir-157":9, "iso8859-10":9, "iso885910":9, "l6":9, "latin6":9,
    // ISO-8859-13
    "iso-8859-13":10, "iso8859-13":10, "iso885913":10,
    // ISO-8859-14
    "iso-8859-14":11, "iso8859-14":11, "iso885914":11,
    // ISO-8859-15
    "csisolatin9":12, "iso-8859-15":12, "iso8859-15":12, "iso885915":12, "l9":12, "latin9":12,
    // ISO-8859-16
    "iso-8859-16":13,
    // KOI8-R
    "cskoi8r":14, "koi":14, "koi8":14, "koi8-r":14, "koi8_r":14,
    // KOI8-U
    "koi8-ru":15, "koi8-u":15,
    // macintosh
    "csmacintosh":16, "mac":16, "macintosh":16, "x-mac-roman":16,
    // windows-874
    "dos-874":17, "iso-8859-11":17, "iso8859-11":17, "iso885911":17, "tis-620":17,
    "windows-874":17,
    // windows-1250
    "cp1250":18, "windows-1250":18, "x-cp1250":18,
    // windows-1251
    "cp1251":19, "windows-1251":19, "x-cp1251":19,
    // "windows-1252" ("us-ascii" and "iso8859-1" are outclassed to it)
    "ansi_x3.4-1968":20, "ascii":20, "cp1252":20, "cp819":20, "csisolatin1":20, "ibm819":20, "iso-8859-1":20, "iso-ir-100":20, "iso8859-1":20, "iso88591":20, "iso_8859-1":20, "iso_8859-1:1987":20, "l1":20, "latin1":20, "us-ascii":20, "windows-1252":20, "x-cp1252":20,
    // windows-1253
    "cp1253":21, "windows-1253":21, "x-cp1253":21,
     // "windows-1254" ("iso-8859-9" is outclassed to it)
    "cp1254":22, "csisolatin5":22, "iso-8859-9":22, "iso-ir-148":22, "iso8859-9":22, "iso88599":22, "iso_8859-9":22, "iso_8859-9:1989":22, "l5":22, "latin5":22, "windows-1254":22, "x-cp1254":22,
    // windows-1255
    "cp1255":23, "windows-1255":23, "x-cp1255":23,
    // windows-1256
    "cp1256":24, "windows-1256":24, "x-cp1256":24,
    // windows-1257
    "cp1257":25, "windows-1257":25, "x-cp1257":25,
    // windows-1258
    "cp1258":26, "windows-1258":26, "x-cp1258":26,
    // x-mac-cyrillic
    "x-mac-cyrillic":27, "x-mac-ukrainian":27
  });


  const charsetAliasesLUT = [
    "ibm866", "iso-8859-2", "iso-8859-3", "iso-8859-4", "iso-8859-5", "iso-8859-6",
    "iso-8859-7", "iso-8859-8", "iso-8859-8i", "iso-8859-10", "iso-8859-13", "iso-8859-14",
    "iso-8859-15", "iso-8859-16", "koi8-r", "koi8-u", "macintosh", "windows-874",
    "windows-1250", "windows-1251", "windows-1252", "windows-1253", "windows-1254",
    "windows-1255", "windows-1256", "windows-1257", "windows-1258", "x-mac-cyrillic"
  ];

  // adapted from: https://encoding.spec.whatwg.org/encodings.json
  const index2cpLUT = {
    // begin at 128
    "ibm866": "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмноп░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀рстуфхцчшщъыьэюяЁёЄєЇїЎў°∙·√№¤■\xa0",
    // begin at 160
    "iso-8859-2": "Ą˘Ł¤ĽŚ§¨ŠŞŤŹ\xADŽŻ°ą˛ł´ľśˇ¸šşťź˝žżŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎĐŃŇÓÔŐÖ×ŘŮÚŰÜÝŢßŕáâăäĺćçčéęëěíîďđńňóôőö÷řůúűüýţ˙",
    "iso-8859-3": "Ħ˘£¤\0Ĥ§¨İŞĞĴ\xAD\0Ż°ħ²³´µĥ·¸ışğĵ½\0żÀÁÂ\0ÄĊĈÇÈÉÊËÌÍÎÏ\0ÑÒÓÔĠÖ×ĜÙÚÛÜŬŜßàáâ\0äċĉçèéêëìíîï\0ñòóôġö÷ĝùúûüŭŝ˙",
    "iso-8859-4": "ĄĸŖ¤ĨĻ§¨ŠĒĢŦ\xADŽ¯°ą˛ŗ´ĩļˇ¸šēģŧŊžŋĀÁÂÃÄÅÆĮČÉĘËĖÍÎĪĐŅŌĶÔÕÖ×ØŲÚÛÜŨŪßāáâãäåæįčéęëėíîīđņōķôõö÷øųúûüũū˙",
    "iso-8859-5": "ЁЂЃЄЅІЇЈЉЊЋЌ\xADЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя№ёђѓєѕіїјљњћќ§ўџ",
    "iso-8859-6": "\0\0\0¤\0\0\0\0\0\0\0،\xAD\0\0\0\0\0\0\0\0\0\0\0\0\0؛\0\0\0؟\0ءآأؤإئابةتثجحخدذرزسشصضطظعغ\0\0\0\0\0ـفقكلمنهوىيًٌٍَُِّْ\0\0\0\0\0\0\0\0\0\0\0\0\0",
    "iso-8859-7": "‘’£€₯¦§¨©ͺ«¬\xAD\0―°±²³΄΅Ά·ΈΉΊ»Ό½ΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ\0ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώ\0",
    "iso-8859-8": "\0¢£¤¥¦§¨©×«¬\xAD®¯°±²³´µ¶·¸¹÷»¼½¾\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0‗אבגדהוזחטיךכלםמןנסעףפץצקרשת\0\0‎‏\0",
    "iso-8859-8i": "\0¢£¤¥¦§¨©×«¬\xAD®¯°±²³´µ¶·¸¹÷»¼½¾\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0‗אבגדהוזחטיךכלםמןנסעףפץצקרשת\0\0‎‏\0",
    "iso-8859-10": "ĄĒĢĪĨĶ§ĻĐŠŦŽ\xADŪŊ°ąēģīĩķ·ļđšŧž―ūŋĀÁÂÃÄÅÆĮČÉĘËĖÍÎÏÐŅŌÓÔÕÖŨØŲÚÛÜÝÞßāáâãäåæįčéęëėíîïðņōóôõöũøųúûüýþĸ",
    "iso-8859-13": "”¢£¤„¦§Ø©Ŗ«¬\xAD®Æ°±²³“µ¶·ø¹ŗ»¼½¾æĄĮĀĆÄÅĘĒČÉŹĖĢĶĪĻŠŃŅÓŌÕÖ×ŲŁŚŪÜŻŽßąįāćäåęēčéźėģķīļšńņóōõö÷ųłśūüżž’",
    "iso-8859-14": "Ḃḃ£ĊċḊ§Ẁ©ẂḋỲ\xAD®ŸḞḟĠġṀṁ¶ṖẁṗẃṠỳẄẅṡÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏŴÑÒÓÔÕÖṪØÙÚÛÜÝŶßàáâãäåæçèéêëìíîïŵñòóôõöṫøùúûüýŷÿ",
    "iso-8859-15": "¡¢£€¥Š§š©ª«¬\xAD®¯°±²³Žµ¶·ž¹º»ŒœŸ¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",
    "iso-8859-16": "ĄąŁ€„Š§š©Ș«Ź\xADźŻ°±ČłŽ”¶·žčș»ŒœŸżÀÁÂĂÄĆÆÇÈÉÊËÌÍÎÏĐŃÒÓÔŐÖŚŰÙÚÛÜĘȚßàáâăäćæçèéêëìíîïđńòóôőöśűùúûüęțÿ",
    // begin at 128
    "koi8-r": "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥\xa0⌡°²·÷═║╒ё╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡Ё╢╣╤╥╦╧╨╩╪╫╬©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ",
    "koi8-u": "─│┌┐└┘├┤┬┴┼▀▄█▌▐░▒▓⌠■∙√≈≤≥\xa0⌡°²·÷═║╒ёє╔ії╗╘╙╚╛ґў╞╟╠╡ЁЄ╣ІЇ╦╧╨╩╪ҐЎ©юабцдефгхийклмнопярстужвьызшэщчъЮАБЦДЕФГХИЙКЛМНОПЯРСТУЖВЬЫЗШЭЩЧЪ",
    "macintosh": "ÄÅÇÉÑÖÜáàâäãåçéèêëíìîïñóòôöõúùûü†°¢£§•¶ß®©™´¨≠ÆØ∞±≤≥¥µ∂∑∏π∫ªºΩæø¿¡¬√ƒ≈∆«»…\xa0ÀÃÕŒœ–—“”‘’÷◊ÿŸ⁄€‹›ﬁﬂ‡·‚„‰ÂÊÁËÈÍÎÏÌÓÔÒÚÛÙıˆ˜¯˘˙˚¸˝˛ˇ",
    "windows-874": "€\x81\x82\x83\x84…\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90‘’“”•–—\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\xa0กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรฤลฦวศษสหฬอฮฯะัาำิีึืฺุู\0\0\0\0฿เแโใไๅๆ็่้๊๋์ํ๎๏๐๑๒๓๔๕๖๗๘๙๚๛\0\0\0\0",
    "windows-1250": "€\x81‚\x83„…†‡\x88‰Š‹ŚŤŽŹ\x90‘’“”•–—\x98™š›śťžź\xa0ˇ˘Ł¤Ą¦§¨©Ş«¬\xAD®Ż°±˛ł´µ¶·¸ąş»Ľ˝ľżŔÁÂĂÄĹĆÇČÉĘËĚÍÎĎĐŃŇÓÔŐÖ×ŘŮÚŰÜÝŢßŕáâăäĺćçčéęëěíîďđńňóôőö÷řůúűüýţ˙",
    "windows-1251": "ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—\x98™љ›њќћџ\xa0ЎўЈ¤Ґ¦§Ё©Є«¬\xAD®Ї°±Ііґµ¶·ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя",
    "windows-1252": "€\x81‚ƒ„…†‡ˆ‰Š‹Œ\x8DŽ\x8F\x90‘’“”•–—˜™š›œ\x9DžŸ\xa0¡¢£¤¥¦§¨©ª«¬\xAD®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",
    "windows-1253": "€\x81‚ƒ„…†‡\x88‰\x8A‹\x8C\x8D\x8E\x8F\x90‘’“”•–—\x98™\x9A›\x9C\x9D\x9E\x9F\xa0΅Ά£¤¥¦§¨©\0«¬\xAD®―°±²³΄µ¶·ΈΉΊ»Ό½ΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡ\0ΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώ\0",
    "windows-1254": "€\x81‚ƒ„…†‡ˆ‰Š‹Œ\x8D\x8E\x8F\x90‘’“”•–—˜™š›œ\x9D\x9EŸ\xa0¡¢£¤¥¦§¨©ª«¬\xAD®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏĞÑÒÓÔÕÖ×ØÙÚÛÜİŞßàáâãäåæçèéêëìíîïğñòóôõö÷øùúûüışÿ",
    "windows-1255": "€\x81‚ƒ„…†‡ˆ‰\x8A‹\x8C\x8D\x8E\x8F\x90‘’“”•–—˜™\x9A›\x9C\x9D\x9E\x9F\xa0¡¢£₪¥¦§¨©×«¬\xAD®¯°±²³´µ¶·¸¹÷»¼½¾¿ְֱֲֳִֵֶַָֹֺֻּֽ־ֿ׀ׁׂ׃װױײ׳״\0\0\0\0\0\0\0אבגדהוזחטיךכלםמןנסעףפץצקרשת\0\0‎‏\0",
    "windows-1256": "€پ‚ƒ„…†‡ˆ‰ٹ‹Œچژڈگ‘’“”•–—ک™ڑ›œ‌‍ں\xa0،¢£¤¥¦§¨©ھ«¬\xAD®¯°±²³´µ¶·¸¹؛»¼½¾؟ہءآأؤإئابةتثجحخدذرزسشصض×طظعغـفقكàلâمنهوçèéêëىيîïًٌٍَôُِ÷ّùْûü‎‏ے",
    "windows-1257": "€\x81‚\x83„…†‡\x88‰\x8A‹\x8C¨ˇ¸\x90‘’“”•–—\x98™\x9A›\x9C¯˛\x9F\xa0\0¢£¤\0¦§Ø©Ŗ«¬\xAD®Æ°±²³´µ¶·ø¹ŗ»¼½¾æĄĮĀĆÄÅĘĒČÉŹĖĢĶĪĻŠŃŅÓŌÕÖ×ŲŁŚŪÜŻŽßąįāćäåęēčéźėģķīļšńņóōõö÷ųłśūüżž˙",
    "windows-1258": "€\x81‚ƒ„…†‡ˆ‰\x8A‹Œ\x8D\x8E\x8F\x90‘’“”•–—˜™\x9A›œ\x9D\x9EŸ\xa0¡¢£¤¥¦§¨©ª«¬\xAD®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂĂÄÅÆÇÈÉÊË̀ÍÎÏĐÑ̉ÓÔƠÖ×ØÙÚÛÜỮßàáâăäåæçèéêë́íîïđṇ̃óôơö÷øùúûüư₫ÿ",
    "x-mac-cyrillic": "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ†°Ґ£§•¶І®©™Ђђ≠Ѓѓ∞±≤≥іµґЈЄєЇїЉљЊњјЅ¬√ƒ≈∆«»…\xa0ЋћЌќѕ–—“”‘’÷„ЎўЏџ№Ёёяабвгдежзийклмнопрстуфхцчшщъыьэю€"
  };


  // cp_to_index. empty for now
  const cp2indexLUT = Helper.createDict();



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
  function cbEncode_forEach_noerror(cp) { // fastest
    if (cp <= this.lowBound) {
      this.array[this.written++] = cp;
      return;
    }
    if ((cp = this.cp2index[cp])) this.array[this.written++] = cp;
  }


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



  function getLowBound(charset) {
    var idx = charsetAliasesDict[charset];
    if (idx >= 1 && idx <= 16) return 0xa0; // "iso-8859-2" -> "iso-8859-16"
    return 0x7f;
  }

  function getCharsetData(charset) {
    if (charset == "iso-8859-8i") charset = "iso-8859-8";
    return index2cpLUT[charset];
  }


  // Each charset LUT is initilised on the first usage.
  function initCharsetLUT(label) {
    var lut = cp2indexLUT[label];
    if (lut) return; // already exist, return.
    cp2indexLUT[label] = lut = Object.create(null);
    // special case (same data's)
    if (label == "iso-8859-8" || label == "iso-8859-8i") {
      cp2indexLUT["iso-8859-8"] = cp2indexLUT["iso-8859-8i"] = lut;
    }
    var offset = getLowBound(label); // 0x7f or 0xa0
    var charsetData = getCharsetData(label);
    for (var i = 0; i < charsetData.length; i++) {
      lut[charsetData[i].charCodeAt(0)] = i + offset + 1;
    }
    console.log(label+":", charsetData)
  }


  function charsetFromAliases(charset) {
    var index;
    if (!Helper.Typeof.isString(charset)) return undefined;
    charset = charset.trim().toLowerCase();
    if ((index = charsetAliasesDict[charset]) != undefined) {
      return charsetAliasesLUT[index];
    }
    return undefined;
  }




  const privateData = new WeakMap();
  function internal(key) {
    if (!privateData.has(key)) privateData.set(key, Object.create(null));
    return privateData.get(key);
  }


  /**
    options.error = 
      "strict"             Raises an exception if the data cannot be converted.
      "replace"            Substitutes a special marker character for data that cannot be encoded.
      "ignore"             Skips the data.
      "xmlcharrefreplace"  XML character (encoding only)
      "backslashreplace"   escape sequence (encoding only)
  */
  function Text8Encoder(label, options = {}) {
    var encoding = label;
    if (!(encoding = charsetFromAliases(encoding))) {
      throw TypeError("TextEncoder constructor: Unknown encoding: " + label);
    }
    initCharsetLUT(encoding);
    /** @private @type {string} read-only */
    internal(this).encoding = encoding;
    internal(this).errorMode = Helper.getErrorType(options.errorMode);
  }
  Text8Encoder.charsetFromAliases = charsetFromAliases;


  Object.defineProperty(Text8Encoder.prototype, Symbol.toStringTag, {
    value: Text8Encoder.name
  });
  Object.defineProperty(Text8Encoder.prototype, 'encoding', {
    get() { return internal(this).encoding; }
  });
  Object.defineProperty(Text8Encoder.prototype, 'errorMode', {
    get() { return internal(this).errorMode; }
  });


  Text8Encoder.prototype.encodeInto = function(string, uint8Array) {
    if (arguments.length < 2) {
      throw TypeError("TextEncoder.encodeInto: At least 2 arguments required, but only " +
                       arguments.length + " passed");
    }
    if (Helper.Typeof(arguments[1]) !== "uint8array") {
      throw TypeError("TextEncoder.encodeInto: Argument 2 does not implement interface Uint8Array.");
    }

    string = string + ""; // .toString()
    var read = 0;
    var errorMode = this.errorMode;
    var cbEncodeA = cbEncode_forEach;
    var cbEncodeB = cbEncode_every;
    var ctx = {
      written:  0,
      lowBound: getLowBound(this.encoding), // 0x7f or 0xa0
      array:    uint8Array,
      cp2index: cp2indexLUT[this.encoding],
      cbError:  Helper.cbErrors_forEach[errorMode],
      encoding: this.encoding
    };
    // Avoid error-checks
    if (errorMode == "ignore") {
      cbEncodeA = cbEncode_forEach_noerror;
      cbEncodeB = cbEncode_every_noerror;
    }

    // best case: output can't be greater than input
    if (!(errorMode == "backslashreplace" || errorMode == "xmlcharrefreplace")) {
      console.warn("encodeInto.forEach(goodcase):", string)
      read = Helper.utf16_string_forEach(string, cbEncodeA, ctx);
      return {read:read, written:ctx.written};
    }

    // forEach() is faster than every()
    var finisher = true
    var safeLength = Math.floor(uint8Array.length/10); // len/10 = safe size for zero-check version
    if (safeLength > 3) {
      console.warn("encodeInto.forEach:", string.substring(0,safeLength))
      finisher = false;
      read = Helper.utf16_string_forEach(string.substring(0,safeLength), cbEncodeA, ctx);
      if (safeLength < string.length) {
        string = string.substring(safeLength, string.length);
        finisher = true;
      }
    }
    if (finisher) {
      console.warn("encodeInto.every:", string)
      ctx.cbError = Helper.callback_errors_every[errorMode];
      read += Helper.utf16_string_every(string, cbEncodeB, ctx);
    }
    return {read:read, written:ctx.written};
  };


  // 
  Text8Encoder.prototype.encode = function(string) {
    if (typeof(string) == "undefined") return new Uint8Array();
    string = string + ""; // .toString()
    var read = 0;
    var errorMode = this.errorMode;
    var cbEncode = (errorMode == "ignore")? cbEncode_forEach_noerror : cbEncode_forEach;
    var isUint8 = !(errorMode == "backslashreplace" || errorMode == "xmlcharrefreplace");
    var array = isUint8? new Uint8Array(string.length) : new Array(string.length);
    var ctx = {
      written:  0,
      lowBound: getLowBound(this.encoding), // 0x7f or 0xa0
      array:    array,
      cp2index: cp2indexLUT[this.encoding],
      cbError:  Helper.cbErrors_forEach[errorMode],
      encoding: this.encoding
    };
    Helper.utf16_string_forEach(string, cbEncode, ctx);
    return isUint8? array.slice(0, ctx.written) : Uint8Array.from(array);
  };



  function Text8Decoder(label, options = {}) {
    var encoding = label;
    if (!(encoding = charsetFromAliases(encoding))) {
      throw TypeError("TextDecoder constructor: Unknown encoding: " + label);
    }
    /** Is a DOMString containing the name of the decoder,
        that is a string describing the method the TextDecoder will use. read-only */
    internal(this).encoding = encoding;
    /** errorMode. read-only */
    internal(this).errorMode = Helper.getErrorType(options.errorMode);
    /** Is a Boolean indicating whether the error mode is fatal. read-only */
    internal(this).fatal = Boolean(options.fatal);
    /** Is a Boolean indicating whether the byte order marker is ignored. read-only */
    internal(this).ignoreBOM = Boolean(options.ignoreBOM);
  }
  Text8Decoder.charsetFromAliases = charsetFromAliases;

  Object.defineProperty(Text8Decoder.prototype, Symbol.toStringTag, {
    value: Text8Decoder.name
  });
  Object.defineProperty(Text8Decoder.prototype, 'encoding', {
    get() { return internal(this).encoding; }
  });
  Object.defineProperty(Text8Decoder.prototype, 'fatal', {
    get() { return internal(this).fatal; }
  });
  Object.defineProperty(Text8Decoder.prototype, 'ignoreBOM', {
    get() { return internal(this).ignoreBOM; }
  });
  Object.defineProperty(Text8Decoder.prototype, 'errorMode', {
    get() { return internal(this).errorMode; }
  });


  /**
  // GOOD USAGE OF ".stream" options:
  // 
  // The stream option changes the handling of the end of the input to allow
  // it to be in the middle of a character. Compare:
  //
  // decoder.decode(new Uint8Array([226, 153]), { stream: true }); // ""
  // decoder.decode(new Uint8Array([165]), { stream: true });      // "♥"
  //
  // to
  // 
  // decoder.decode(new Uint8Array([226, 153])); // "��"
  // decoder.decode(new Uint8Array([165]));      // "�"
  */
  Text8Decoder.prototype.decode = function(buffer, options = {}) {
    if (ArrayBuffer.isView(buffer)) {
      buffer = buffer.buffer;
    } else if (Helper.Typeof(buffer) !== "arraybuffer") {
      throw TypeError("TextDecoder.decode: Argument 1 could not be converted " +
                      "to any of: ArrayBufferView, ArrayBuffer");
    }
    //var stream = options.stream;
    var str = "";
    var array = new Uint8Array(buffer);
    var index2cp = getCharsetData(this.encoding);
    var lowBound = getLowBound(this.encoding);

    for (var i = 0; i < array.length; i++) {
      var idx = array[i];
      if (idx > lowBound) idx = index2cp.charCodeAt(idx - lowBound - 1);
      str += String.fromCharCode(idx);
    }

    return str;
  };


  return [Text8Encoder, Text8Decoder];
})();












/*
  ///////////////////////// TESTS ////////////////////////////


  // bonne implémentation mais lorsque la chaine se termine par un emoji,
  // la dernière lecture  retourne un NaN.
  function string_utf16_forEach2(string, callback, thisArg) {
    var i = 0, read = 0, c2 = 0;
    var len = string.length;
    var c1 = string.charCodeAt(read++);
    console.warn("premier c1:", c1)

    // main loop
    while (read < len) {
      if (c1 >= 0xD800 && c1 <= 0xDBFF) {
        c2 = string.charCodeAt(read++);
        console.log("c2:", c2)
        if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
          c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
        } else {
          callback.call(thisArg, c1, i++, string);
          c1 = c2; // already getted
          continue;
        }
      }
      callback.call(thisArg, c1, i++, string);
      c1 = string.charCodeAt(read++);
      console.log("c1:", c1)
    }
    // usefull for a string like "\uD800\uDC00" or ""
    if (read < string.length+1) {
      callback.call(thisArg, c1, i, string);
      console.warn("dernier appel")
    }
    return read;
  }

  // version meilleure que la précédente!
  function string_utf16_forEach3(string, callback, thisArg) {
    var i = 0, read = 1, c2 = 0;
    var len = string.length;
    var c1 = string.charCodeAt(0);
    console.warn("premier c1:", c1)

    // main loop
    while (read < len) {

      if (c1 >= 0xD800 && c1 <= 0xDBFF) {
        c2 = string.charCodeAt(read++);
        console.log("c2:", c2)
        if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
          c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
          c2 = string.charCodeAt(read++);
          console.log(c2)
        }
        callback.call(thisArg, c1, i++, string);
        c1 = c2; // already getted
        continue;
      }
      callback.call(thisArg, c1, i++, string);
      c1 = string.charCodeAt(read++);
      console.log("c1:", c1)
    }

    // usefull for a string like "\uD800\uDC00" or ""
    if (read < len+1) {
      callback.call(thisArg, c1, i, string);
      console.warn("dernier appel")
    }
    return read;
  }


  tests:
  var chaines = [
    "a",
    "😀",
    "a😀",
    "😀a",
    "aaaa",
    "😀😀😀😀",
    "\ud800",
    "a\ud800",
    "\ud800a",
    "\ud800\ud800",
  ];
  for (var i = 0; i < chaines.length; i++) {
    var a = [], s = "";    
    string_utf16_forEach3(chaines[i], function(cp){
      //console.log("charcode:", cp)
      a.push(String.fromCodePoint(cp));
      s += String.fromCodePoint(cp);
      return true;
    });
    console.log(s, chaines[i], a)
    console.log(" ")
  }
*/


