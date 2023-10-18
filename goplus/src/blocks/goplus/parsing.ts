// From google/blockly/core/utils/parsing.ts

import * as Blockly from 'blockly'

export const GROUP_START = '['
export const GROUP_END = ']'

/**
 * Internal implementation of the message reference and interpolation token
 * parsing used by tokenizeInterpolation() and replaceMessageReferences().
 *
 * @param message Text which might contain string table references and
 *     interpolation tokens.
 * @param parseInterpolationTokens Option to parse numeric interpolation
 *     tokens (%1, %2, ...) when true.
 * @param tokenizeNewlines Split individual newline characters into separate
 *     tokens when true.
 * @returns Array of strings and numbers.
 */
function tokenizeInterpolationInternalWithGroups(
  message: string,
  parseInterpolationTokens: boolean,
  tokenizeNewlines: boolean
): (string | number)[] {
  const tokens = [];
  const chars = message.split('');
  chars.push(''); // End marker.
  // Parse the message with a finite state machine.
  // 0 - Base case.
  // 1 - % found.
  // 2 - Digit found.
  // 3 - Message ref found.
  let state = 0;
  const buffer = new Array<string>();
  let number = null;

  function flushBuffer() {
    const t = buffer.join('');
    // 提前 trim & filter，不然后边 interpolateArguments_ > stringToFieldJson_ 中 trim & filter 会导致下标错乱
    if (t.trim()) tokens.push(t);
    buffer.length = 0;
  }

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (state === 0) {
      // Start escape.
      if (c === '%') {
        flushBuffer();
        state = 1;
      } else if (tokenizeNewlines && c === '\n') {
        // Output newline characters as single-character tokens, to be replaced
        // with endOfRow dummies during interpolation.
        flushBuffer();
        tokens.push(c);
      } else if (
        c === GROUP_START
        || c === GROUP_END
      ) {
        flushBuffer();
        let t = c;
        if (c === GROUP_END && chars[i+1] === '*') {
          t = c + chars[i+1];
          i++; // skip next char(*)
        }
        tokens.push(t);
      } else {
        buffer.push(c); // Regular char.
      }
    } else if (state === 1) {
      if (c === '%') {
        buffer.push(c); // Escaped %: %%
        state = 0;
      } else if (parseInterpolationTokens && '0' <= c && c <= '9') {
        state = 2;
        number = c;
        flushBuffer();
      } else if (c === '{') {
        state = 3;
      } else {
        buffer.push('%', c); // Not recognized. Return as literal.
        state = 0;
      }
    } else if (state === 2) {
      if ('0' <= c && c <= '9') {
        number += c; // Multi-digit number.
      } else {
        tokens.push(parseInt(number ?? '', 10));
        i--; // Parse this char again.
        state = 0;
        continue;
      }
    } else if (state === 3) {
      // String table reference
      if (c === '') {
        // Premature end before closing '}'
        buffer.splice(0, 0, '%{'); // Re-insert leading delimiter
        i--; // Parse this char again.
        state = 0; // and parse as string literal.
      } else if (c !== '}') {
        buffer.push(c);
      } else {
        const rawKey = buffer.join('');
        if (/[A-Z]\w*/i.test(rawKey)) {
          // Strict matching
          // Found a valid string key. Attempt case insensitive match.
          const keyUpper = rawKey.toUpperCase();

          // BKY_ is the prefix used to namespace the strings used in
          // Blockly core files and the predefined blocks in ../blocks/.
          // These strings are defined in ../msgs/ files.
          const bklyKey = keyUpper.startsWith('BKY_')
            ? keyUpper.substring(4)
            : null;
          if (bklyKey && bklyKey in Blockly.Msg) {
            const rawValue = Blockly.Msg[bklyKey];
            if (typeof rawValue === 'string') {
              // Attempt to dereference substrings, too, appending to the
              // end.
              Array.prototype.push.apply(
                tokens,
                tokenizeInterpolationInternalWithGroups(
                  rawValue,
                  parseInterpolationTokens,
                  tokenizeNewlines
                ),
              );
            } else if (parseInterpolationTokens) {
              // When parsing interpolation tokens, numbers are special
              // placeholders (%1, %2, etc). Make sure all other values are
              // strings.
              tokens.push(`${rawValue}`);
            } else {
              tokens.push(rawValue);
            }
          } else {
            // No entry found in the string table. Pass reference as string.
            tokens.push('%{' + rawKey + '}');
          }
          buffer.length = 0; // Clear the array
          state = 0;
        } else {
          tokens.push('%{' + rawKey + '}');
          buffer.length = 0;
          state = 0; // and parse as string literal.
        }
      }
    }

    // if (c === GROUP_START) {
    //   groupStack.push(groupIdx);
    //   groups[groupIdx] = {
    //     start: tokens.length,
    //     end: -1, // 占位
    //     tag: '?', // 占位
    //   }
    //   groupIdx++;
    // }
    // if (c === GROUP_END) {
    //   const idx = groupStack.pop();
    //   if (idx != null) {
    //     const nextChar = chars[i+1];
    //     let tag: GroupTag = '?'
    //     if (nextChar === '*') {
    //       tag = '*';
    //       i++; // skip next char(*)
    //     }
    //     groups[idx] = {
    //       ...groups[idx],
    //       tag,
    //       end: tokens.length
    //     };
    //   }
    // }
  }
  flushBuffer();

  // Merge adjacent text tokens into a single string (but if newlines should be
  // tokenized, don't merge those with adjacent text).
  const mergedTokens = [];
  buffer.length = 0;
  let text = '';
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (
      typeof t === 'string' &&
      !(tokenizeNewlines && t === '\n') &&
      t !== GROUP_START &&
      t[0] !== GROUP_END
    ) {
      buffer.push(t as string);
    } else {
      text = buffer.join('');
      if (text) {
        mergedTokens.push(text);
      }
      buffer.length = 0;
      mergedTokens.push(t);
    }
  }
  text = buffer.join('');
  if (text) {
    mergedTokens.push(text);
  }
  buffer.length = 0;

  return tokens;
}

/**
 * Parse a string with any number of interpolation tokens (%1, %2, ...).
 * It will also replace string table references (e.g., %{bky_my_msg} and
 * %{BKY_MY_MSG} will both be replaced with the value in
 * Msg['MY_MSG']). Percentage sign characters '%' may be self-escaped
 * (e.g., '%%'). Newline characters will also be output as string tokens
 * containing a single newline character.
 *
 * @param message Text which might contain string table references and
 *     interpolation tokens.
 * @returns Array of strings and numbers.
 */
export function tokenizeInterpolationWithGroups(message: string): (string | number)[] {
  return tokenizeInterpolationInternalWithGroups(message, true, true);
}