
export default class FileBuffer implements Deno.Reader, Deno.Writer {
  #buf: Uint8Array;
  #cursor = 0;
  #isReadable = true;
  #operationStatus = true
  #off = 0;
  constructor() {
    this.#buf = new Uint8Array(0);
    return;
  }
  
  write (d:Uint8Array) {
    //this.#cursor = this.#operationStatus ? this.#cursor : this.#cursor + 1;
    const updateBuf = new Uint8Array(this.#buf.byteLength + d.byteLength);
    const chunk1 = this.#buf.subarray(0, this.#cursor)
    const chunk2 = this.#buf.subarray(this.#cursor)
    this.copyBytes(chunk1, updateBuf, 0)
    this.copyBytes(d, updateBuf, this.#cursor)
    this.copyBytes(chunk2, updateBuf, this.#cursor + 1)
    this.#buf = updateBuf;
    this.#isReadable = true;
    this.#cursor += d.byteLength;
    this.#operationStatus = true;
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
    //this.#cursor = !this.#operationStatus && (this.#cursor !?? 0)? this.#cursor : this.#cursor - 1
    const updateBuf = new Uint8Array(this.#buf.byteLength - 1)
    const chunk1 = this.#buf.subarray(0, this.#cursor === this.#buf.byteLength ? this.#cursor - 1 : this.#cursor);
    const chunk2 = this.#buf.subarray(this.#cursor + 1);
    this.copyBytes(chunk1, updateBuf, 0)
    if (this.#cursor < this.#buf.byteLength) this.copyBytes(chunk2, updateBuf, this.#cursor)
    this.#buf = updateBuf;
    this.#isReadable = true;
    this.#operationStatus = false;
     this.#cursor -= 1;
    return Promise.resolve(updateBuf.byteLength);
  }

  moveCursor(n: number) {
    const cursor = this.#cursor;
    if (cursor === 0) return Promise.resolve(this.#cursor)
    this.#cursor = cursor + n;
    return Promise.resolve(this.#cursor)
  }

  createCursorPosition(str:string) {
    let out = str.split('\n').map((e:any) => [...e]);
    let place = 1;
    return out.map((arr, row) => arr.map((char, col) => ({ char, row, col, place: place++ }))).flat();
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