declare module "*.pegjs" {
  const parse: (text: string) => any;
  export { parse };
}

declare module "bufferstreams" {

  type BufferStreamsOptions = (err: string, input: Buffer, cb: (err: string, output: any) => any) => any;
  type BufferStreamsCallback = (err: string, output: any) => {};

  const BufferStreams: new (opts: BufferStreamsOptions, cb?: BufferStreamsCallback) => any;
  export default BufferStreams;
}