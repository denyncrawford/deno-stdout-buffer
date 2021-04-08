import { readKeypress } from "https://deno.land/x/keypress@0.0.7/mod.ts";
import Buf from "./buffer.ts";

const buffer = new Buf();

export class CSI {
  static kClear = "\x1b[1;1H";
  static kClearScreenDown = "\x1b[0J";
}

for await (const keypress of readKeypress()) {
  if(keypress.ctrlKey) {
    Deno.exit(0)
  } else if(keypress.key != undefined) {
    const enc = new TextEncoder();
    switch(keypress.key){
      case 'space':
        await buffer.write(enc.encode(` `))
        break;
      case 'return':
        await buffer.write(enc.encode(`\n`))
        break;
      case 'backspace':
        await buffer.delete()  
        break;
      default:
        await buffer.write(enc.encode(keypress.key))
    }
    // console.log(2,buffer.bytes())

    //await Deno.copy(buffer, Deno.stdout);

    const cursorToTop = new TextEncoder().encode(CSI.kClear);
    const clearDown = new TextEncoder().encode(CSI.kClearScreenDown);
    Deno.stdout.write(cursorToTop);
    Deno.stdout.write(clearDown);
    await Deno.writeAll(Deno.stdout, await buffer.readRaw());    
    //console.log(3,buffer.bytes())
  }
}