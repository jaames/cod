import { extractDocComments } from './extract';
import { parseCommentBlock } from './parser';

export * from './extract';
export * from './parser';

export type CodOptions = {
  docBegin: string,
  docEnd: string
};

export function cod(text: string, config: Partial<CodOptions>) {
  const opts: CodOptions = Object.assign({
    docBegin: '/**',
    docEnd: 's*/'
  }, config);
  const blocks = extractDocComments(text, opts.docBegin, opts.docEnd);
  return blocks.map(parseCommentBlock);
}