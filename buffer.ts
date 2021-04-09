
export default class FileBuffer implements Deno.Reader, Deno.Writer {
  #buf: Uint8Array;
  #cursor = 0;
  #isReadable = true;
  #off = 0;
  constructor() {
    this.#buf = new Uint8Array(0);
    return;
  }
  
  write (d:Uint8Array) {
    const updateBuf = new Uint8Array(this.#buf.byteLength + d.byteLength);
    const chunk1 = this.#buf.subarray(0, this.#cursor)
    const chunk2 = this.#buf.subarray(this.#cursor)
    this.copyBytes(chunk1, updateBuf, 0)
    this.copyBytes(d, updateBuf, this.#cursor)
    this.copyBytes(chunk2, updateBuf, this.#cursor + 1)
    this.#buf = updateBuf;
    this.#isReadable = true;
    this.#cursor += d.byteLength;
    return Promise.resolve(updateBuf.byteLength);
  }

  read (p:Uint8Array) {
    if (!this.#isReadable) return Promise.resolve(null) 
    const nread = this.copyBytes(this.#buf.subarray(this.#off), p);
    this.#off += nread;
    if (this.#buf.byteLength <= this.#off) this.#isReadable = false;
    return Promise.resolve(nread);
  }

  readRaw() {
    return Promise.resolve(this.#buf)
  }

  delete() {
    if (this.#cursor === 0 ) return
    const updateBuf = new Uint8Array(this.#buf.byteLength - 1)
    const chunk1 = this.#buf.subarray(0, this.#cursor - 1);
    const chunk2 = this.#buf.subarray(this.#cursor);
    this.copyBytes(chunk1, updateBuf, 0)
    if (this.#cursor < this.#buf.byteLength) this.copyBytes(chunk2, updateBuf, this.#cursor - 1)
    this.#buf = updateBuf;
    this.#isReadable = true;
    this.#cursor -= 1;
    return Promise.resolve(updateBuf.byteLength);
  }

  moveCursor(n: number) {
    const cursor = this.#cursor;
    if (cursor === 0 && n < 0 || cursor === this.#buf.byteLength && n > 0) return Promise.resolve(this.#cursor)
    this.#cursor = cursor + n;
    return Promise.resolve(this.#cursor)
  }

  createCursorPosition(str:string) {
    const out = str.split('\n').map((e:string) => [...e]);
    let place = 1;
    return out.map((arr, y) => arr.map((char, x) => ({ char, y, x, place: place++ }))).flat();
  }
  
  getCursorPosition() {
    const str = new TextDecoder().decode(this.#buf)
    return this.createCursorPosition(str).find(e => e.place === this.#cursor)
  }

  copyBytes(src: Uint8Array, dst: Uint8Array, off = 0) {
    const r = dst.byteLength - off;
    if (src.byteLength > r) {
      src = src.subarray(0, r);
    }
    dst.set(src, off);
    return src.byteLength;
  }
}