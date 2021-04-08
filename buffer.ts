
export default class DynamicBuffer {
  #buf: Uint8Array;
  #cursor: number = 0;
  constructor() {
    this.#buf = new Uint8Array(0);
    return;
  }
  
  async write (d:Uint8Array) {
    const updateBuf = new Uint8Array(this.#buf.byteLength + d.byteLength);
    this.copyBytes(this.#buf, updateBuf, 0)
    this.copyBytes(d, updateBuf, this.#buf.byteLength)
    this.#buf = updateBuf;
    return Promise.resolve(updateBuf.byteLength);
  }

  async read () {
    return Promise.resolve(this.#buf);
  }

  async delete() {
    if (this.#buf.byteLength === 0) return
    const updateBuf = new Uint8Array(this.#buf.byteLength - 1)
    let updated = this.#buf.subarray(0, this.#buf.byteLength - 1)
    this.copyBytes(updated, updateBuf)
    this.#buf = updateBuf;
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