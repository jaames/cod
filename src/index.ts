import { extractDocCommentsBetween, extractDocCommentsWithPrefix } from './extract';
import { parseCommentBlock } from './parser';

export * from './extract';
export * from './parser';

export type CodOptions = {
  docBegin: string,
  docEnd: string,
  docLinePrefix: string,
};

export function cod(text: string, config: Partial<CodOptions>) {
  const opts: CodOptions = Object.assign({
    docBegin: '/**',
    docEnd: 's*/',
    docLinePrefix: ''
  }, config);
  if (opts.docLinePrefix) {
    const blocks = extractDocCommentsWithPrefix(text, opts.docLinePrefix)
    return blocks.map(parseCommentBlock);
  }
  else {
    const blocks = extractDocCommentsBetween(text, opts.docBegin, opts.docEnd);
    return blocks.map(parseCommentBlock);
  }
}