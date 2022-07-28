const REGEX_NEWLINE = /\r?\n/;

export type CommentBlock = {
  body: string[],
  lineBefore: number,
  lineAfter: number
};

export function extractDocCommentsBetween(src: string, beginDoc: string, endDoc: string) {
  let blocks: CommentBlock[] = [];
  let inside = false;
  let currDepth = 0;
  let currSubDepth = 0;
  let currBlockText: string[] = [];
  let currStartLine = 0;
  const srcLines = src.split(REGEX_NEWLINE);
  for (let i = 0; i < srcLines.length; i++) {
    const lineNum = i + 1;
    const line = srcLines[i];
    // outside a block
    if (!inside) {
      currDepth = line.indexOf(beginDoc);
      // block start
      if (currDepth >= 0) {
        inside = true;
        currBlockText = [];
        currStartLine = lineNum;
      }
    }
    // inside block
    else {
      const idx = line.indexOf(endDoc);
      // block end
      if (idx >= 0) {
        inside = false;
        blocks.push({
          body: currBlockText,
          lineBefore: currStartLine - 1,
          lineAfter: lineNum + 1
        });
        currBlockText = [];
        currStartLine = 0;
      }
      else {
        let substr = line.substring(currDepth);
        const search = substr.search(/[^ ]/);
        if (search >= 0)
          currSubDepth = search;
        else if (substr.length < currSubDepth)
          substr = ' '.repeat(currSubDepth + 1);
        currBlockText.push(substr);
      }
    }
  }
  return blocks;
}

export function extractDocCommentsWithPrefix(src: string, docLinePrefix: string) {
  let blocks: CommentBlock[] = [];
  let inside = false;
  let currDepth = 0;
  let currSubDepth = 0;
  let currBlockText: string[] = [];
  let currStartLine = 0;
  const prefixRegex = new RegExp(`^(${docLinePrefix})`);
  const srcLines = src.split(REGEX_NEWLINE);
  for (let i = 0; i < srcLines.length; i++) {
    const lineNum = i + 1;
    const line = srcLines[i];
    // outside a block
    if (!inside) {
      // currDepth = line.indexOf(docLinePrefix);
      // block start
      if (line.startsWith(docLinePrefix)) {
        currDepth = 0
        inside = true;
        currBlockText = [];
        currStartLine = lineNum;
      }
    }
    // inside block
    if (inside) {
      const idx = line.indexOf(docLinePrefix);
      // block end
      if (idx == -1) {
        inside = false;
        blocks.push({
          body: currBlockText,
          lineBefore: currStartLine - 1,
          lineAfter: lineNum
        });
        currBlockText = [];
        currStartLine = 0;
      }
      else {
        let substr = line.replace(prefixRegex, '').substring(currDepth);
        const search = substr.search(/[^ ]/);
        if (search >= 0)
          currSubDepth = search;
        else if (substr.length < currSubDepth)
          substr = ' '.repeat(currSubDepth + 1);
        currBlockText.push(substr);
      }
    }
  }
  return blocks;
}