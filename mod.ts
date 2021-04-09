import { readKeypress } from "https://deno.land/x/keypress@0.0.7/mod.ts";
import { hideCursor, showCursor, goTo } from "https://denopkg.com/iamnathanj/cursor@v2.2.0/mod.ts";
import Buf from "./buffer.ts";

const buffer = new Buf();

export class CSI {
  static kClear = "\x1b[1;1H";
  static kClearScreenDown = "\x1b[0J";
}

const cursorBlink = () => setInterval(async () => {
  await hideCursor()
  setTimeout(async () => {
    await showCursor()
  }, 500)
}, 1000)  

await showCursor()
let blink = cursorBlink();
const cursorToTop = new TextEncoder().encode(CSI.kClear);
const clearDown = new TextEncoder().encode(CSI.kClearScreenDown);
Deno.stdout.write(cursorToTop);
Deno.stdout.write(clearDown);

for await (const keypress of readKeypress()) {
  await hideCursor()
  clearInterval(blink)
  if(keypress.ctrlKey) {
    switch (keypress.key) {
      case 'c':
        Deno.exit(0)
        break;
      case 's':
        console.log('\n')
        Deno.exit(0)
        break
      case 'k':
        await buffer.moveCursor(-1)
        break  
      case 'l':
        await buffer.moveCursor(1)
        break  
      default:
        break;
    }
   } else if(keypress.key != undefined) {
    const enc = new TextEncoder();
    switch(keypress.key){
      case 'space':
        await buffer.write(enc.encode(` `))
        break;
      case 'tab':
        await buffer.write(enc.encode(`  `))//buffer.write(enc.encode(`\t`))
        break;
      case 'return':
        await buffer.write(enc.encode(`\n`))
        break;
      case 'backspace':
        await buffer.delete()  
        break;
      case 'left':
        console.log('Saved!')
        Deno.exit(0)
        break
      default:
        await buffer.write(enc.encode(keypress.key))
    }
    Deno.stdout.write(cursorToTop);
    Deno.stdout.write(clearDown);
    await Deno.writeAll(Deno.stdout, await buffer.readRaw());    
  }
  // await restore()
  const position = buffer.getCursorPosition()
  const x = (position?.x || 0) + 2
  const y = position?.y || 0
  
  await goTo(x,y)
  await showCursor()
  blink = cursorBlink();
}