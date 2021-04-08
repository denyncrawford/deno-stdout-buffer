
export default class DynamicBuffer implements Deno.Reader, Deno.Writer {
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
    this.copyBytes(this.#buf, updateBuf, 0)
    this.copyBytes(d, updateBuf, this.#buf.byteLength)
    this.#buf = updateBuf;
    this.#isReadable = true;
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
    if (this.#buf.byteLength === 0) return
    const updateBuf = new Uint8Array(this.#buf.byteLength - 1)
    const updated = this.#buf.subarray(0, this.#buf.byteLength - 1)
    this.copyBytes(updated, updateBuf)
    this.#buf = updateBuf;
    this.#isReadable = true;
    return Promise.resolve(updateBuf.byteLength);
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