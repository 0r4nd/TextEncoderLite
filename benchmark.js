


function bench() {
  console.clear();

  var string1 = "adhsdfhsdfghsethsdfghgsdfhgsdfhsdhsdfghsdfgsdfgsdftgergsdbsdfghdjkulomluoiili2154651615345i1uy6g51k6g5u1k65u1k3uy1k65y1u651j65yt1hj5tr1h5d1gh6516t1h35dr";
  var string2 = "𧿰𧿱𧿲𧿳𧿴𧿵🙀🙁🙂🙃🙄🙅𧿰𧿱𧿲𧿳𧿴𧿵🙀🙁🙂🙃🙄🙅𧿰𧿱𧿲𧿳𧿴𧿵🙀🙁🙂🙃🙄🙅𧿰𧿱𧿲𧿳𧿴𧿵🙀🙁🙂🙃🙄🙅𧿰𧿱𧿲𧿳𧿴𧿵🙀🙁🙂🙃🙄🙅𧿰𧿱𧿲𧿳𧿴𧿵🙀🙁🙂🙃🙄🙅𧿰𧿱𧿲𧿳𧿴𧿵🙀🙁🙂🙃🙄🙅𧿰𧿱𧿲𧿳𧿴𧿵🙀🙁🙂🙃🙄🙅𧿰𧿱𧿲𧿳𧿴𧿵🙀🙁🙂🙃🙄🙅";
  var string3 = "𧿰a𧿱d𧿲f𧿳g𧿴h𧿵j🙀e🙁r🙂z🙃4🙄8🙅9𧿰6𧿱3𧿲0𧿳a𧿴e𧿵g🙀m🙁p🙂u🙃v🙄w🙅x𧿰sd𧿱e𧿲e𧿳t𧿴e𧿵t🙀y🙁u🙂iu🙃c🙄z🙅a𧿰e𧿱𧿲𧿳e𧿳t𧿴e𧿵t🙀y🙁u🙂iu🙃c🙄z🙅a𧿰e𧿱e𧿳t𧿴e𧿵t🙀y🙁u🙂iu🙃c🙄z🙅a𧿰e𧿱e";

  var r1 = new Uint8Array(400);
  var r2 = new Uint8Array(400);

  var enc1 = new TextEncoder();
  var enc2 = new TextEncoderLite();
  var dec1 = new TextDecoder("utf-8", {fatal:true, ignoreBOM:true});
  var dec2 = new TextDecoderLite("utf-8", {fatal:true, ignoreBOM:true});

  var obj1,obj2, obj3,obj4;

  console.time();
  for (var i = 0; i < 20000; i++) {
    obj1 = enc1.encodeInto(string2, r1);
    obj1 = enc1.encodeInto(string2, r1);
    obj1 = enc1.encodeInto(string2, r1);
  }
  console.warn("Time TextEncoder.encodeInto()");
  console.timeEnd();


  console.time();
  for (var i = 0; i < 20000; i++) {
    obj2 = enc2.encodeInto(string2, r2);
    obj2 = enc2.encodeInto(string2, r2);
    obj2 = enc2.encodeInto(string2, r2);
  }
  console.warn("Time TextEncoderLite.encodeInto()");
  console.timeEnd();
  console.log("\n");


  console.time();
  for (var i = 0; i < 20000; i++) {
    obj3 = dec1.decode(r1);
  }
  console.warn("Time TextDecoder.decode()");
  console.timeEnd();


  console.time();
  for (var i = 0; i < 20000; i++) {
    obj4 = dec2.decode(r1);
  }
  console.warn("Time TextDecoderLite.decode()");
  console.timeEnd();


  console.log(obj3, r1);
  console.log(obj4, r2);
}




