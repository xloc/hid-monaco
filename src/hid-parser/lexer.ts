import * as monaco from "monaco-editor";

export interface Char {
  char: string;
  position: monaco.IPosition;
}

export function* charGenerator(code: string[]): Generator<Char, void, unknown> {
  let iLine = 0;
  let iChar = 0;
  while (iLine < code.length) {
    if (iChar >= code[iLine].length) {
      yield {
        char: '\n',
        position: { lineNumber: iLine + 1, column: iChar + 1 }
      };

      iLine++;
      iChar = 0;
      continue;
    }

    yield {
      char: code[iLine][iChar],
      position: { lineNumber: iLine + 1, column: iChar + 1 }
    };
    iChar++;
  }

}

export enum TokenType {
  Data,
  Separator,
  LineComment,
}

export interface Token {
  text: string;
  range: monaco.IRange;
  type: TokenType;
}

export function* tokenGenerator(code: string[]): Generator<Token, void, unknown> {
  const reader = charGenerator(code);
  let token = '';
  let char: Char | void;
  while (char = reader.next().value) {
    if (char.char === '/') {
      // process the first / as usual: add to token
      if (token == '/') {
        // it is the second /, so it is a comment
        for (let c: Char | void = char; c && c.char !== '\n'; c = reader.next().value) {
          token += c.char
        }
        yield {
          type: TokenType.LineComment,
          text: token,
          range: {
            startLineNumber: char.position.lineNumber,
            endLineNumber: char.position.lineNumber,
            startColumn: char.position.column - 1,
            endColumn: char.position.column + token.length - 1
          }
        };
        token = '';
        continue;
      }
    }
    if (' \n\t,'.includes(char.char)) {
      if (token.length > 0) {
        yield {
          type: TokenType.Data,
          text: token,
          range: {
            startLineNumber: char.position.lineNumber,
            endLineNumber: char.position.lineNumber,
            startColumn: char.position.column - token.length,
            endColumn: char.position.column - 1
          }
        };
        token = '';
      }
      if (char.char === ',') {
        yield {
          type: TokenType.Separator,
          text: ',',
          range: {
            startLineNumber: char.position.lineNumber,
            endLineNumber: char.position.lineNumber,
            startColumn: char.position.column,
            endColumn: char.position.column
          }
        };
      }
    } else {
      token += char.char;
    }
  }
}