import { CommentBlock } from './extract';

export enum ParsedLineType {
  Text,
  NumberTag,
  StringTag,
  BooleanTag,
  PlainTag
};

export type ParsedLine = 
| {
  type: ParsedLineType.Text,
  value: string
} 
| {
  type: ParsedLineType.PlainTag,
  key: string
} 
| {
  type: ParsedLineType,
  key: string,
  value: any
};

export type ParsedLineNode = {
  indent: number,
  children: ParsedLineNode[],
  line: string,
  parsed: ParsedLine
};

export type DocNodeValue = string | boolean | number | DocNode[];
export type DocNode = Record<string, DocNodeValue>;

// parses a line to extract the tag + value, or the text. assumes indentation has already been stripped.
const parseTag = (line: string): ParsedLine => {
  // match float or int value
  const numMatch = line.match(/^(@\S+)\s+(([+-]?\d+(\.\d+)?))/i);
  if (numMatch)
    return { type: ParsedLineType.NumberTag, key: numMatch[1], value: parseFloat(numMatch[2]) };

  // match string or explicit boolean value
  const stringMatch = line.match(/^(@\S+)\s+(.+)/i);
  if (stringMatch) {
    const val = stringMatch[2];
    if (val === 'true' || val === 'false')
      return { type: ParsedLineType.BooleanTag, key: stringMatch[1], value: Boolean(val) };

    return { type: ParsedLineType.StringTag, key: stringMatch[1], value: val };
  }

  // match tag identifier
  const tagMatch = line.match(/^(@\S+)/i);
  if (tagMatch)
    return { type: ParsedLineType.PlainTag, key: tagMatch[1] };

  return { type: ParsedLineType.Text, value: line };
}

// parse a line to figure out its indent level, and extract any tags
const parseLine = (line: string): ParsedLineNode => {
  const indent = line.length - line.trimStart().length;
  return {
    line,
    indent,
    parsed: parseTag(line.substring(indent)),
    children: [] as ParsedLineNode[],
  }
};

// sorts lines into a tree structure by their indent level
const buildIndentTree = (lines: ParsedLineNode[]): ParsedLineNode[] => {
  if (lines.length >= 2) {
    let firstLine = lines.shift();
    let nextLine = lines[0];
    const children: ParsedLineNode[] = [];
    while (firstLine.indent < nextLine.indent) {
      children.push(lines.shift());
      if (lines.length === 0)
        break;
      nextLine = lines[0];
    }
    firstLine.children = buildIndentTree(children);
    if (lines.length > 0)
      return [firstLine].concat(buildIndentTree(lines));
    else
      return [firstLine];
  }
  else if (lines.length === 1) {
    lines[0].children = [];
    return lines;
  }
  else
    return [];
}

// transform an indent tree into our nicely formatted doc structure
const transformTree = (output: DocNode, node: ParsedLineNode): any => {
  const parsed = node.parsed;
  const type = parsed.type;

  // add a key to the output doc node
  const addValue = (key: string, value: any) => {
    // if a key has been seen twice, merge both values into an array
    if (output.hasOwnProperty(key)) {
      const mapVal = output[key];
      if (Array.isArray(mapVal)) {
        mapVal.push(value);
        output[key] = mapVal;
      }
      else
        output[key] = [mapVal, value];
    }
    else
      output[key] = value;
  }

  // standard tags
  if (type !== ParsedLineType.Text && node.children.length === 0) {
    // no value and no children, assume true boolean
    if (type === ParsedLineType.PlainTag)
      addValue(parsed.key, true);
    // explicit boolean value
    else if (type === ParsedLineType.BooleanTag)
      addValue(parsed.key, parsed.value);
    // string value
    else if (type === ParsedLineType.StringTag)
      addValue(parsed.key, parsed.value);
    // int or float value
    else if (type === ParsedLineType.NumberTag)
      addValue(parsed.key, parsed.value);
  }
  // text
  else if (type === ParsedLineType.Text) {
    const text: string[] = [];
    // if text is indented the parser considers it a child node (bleh), but a workaround is just collecting children and ignoring lower indents
    const condenseText = (node: ParsedLineNode, indentLevel: number) => {
      text.push(node.line.substring(indentLevel));
      node.children.forEach((subNode) => condenseText(subNode, indentLevel));
    }
    condenseText(node, node.indent);
    if (output.text)
      output.text += '\n' + text.join('\n');
    else
      output.text = text.join('\n');
  }
  // nested values
  else {
    const childMap: DocNode = {};
    node.children.forEach((subNode) => transformTree(childMap, subNode));
    addValue(parsed.key, childMap);
  }
  return output;
}

// takes an extracted doc comment block and parses it into our doc object
export const parseCommentBlock = ({ body, lineBefore, lineAfter }: CommentBlock) => {
  const block: DocNode = { lineBefore, lineAfter };
  const lines = body.map(parseLine);
  const tree = buildIndentTree(lines);
  tree.forEach((item: any) => transformTree(block, item));
  return block;
}