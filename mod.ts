import { readKeypress } from "https://deno.land/x/keypress@0.0.7/mod.ts";
import Buf from "./buffer.ts";

const buffer = new Buf();

for await (const keypress of readKeypress()) {
  if(keypress.ctrlKey) {
    Deno.exit(0)
  } else if(keypress.key != undefined) {
    const enc = new TextEncoder();
    //console.log(1,buffer.bytes())
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
    console.clear()
    await Deno.writeAll(Deno.stdout, await buffer.read());    
    //console.log(3,buffer.bytes())
  }
}