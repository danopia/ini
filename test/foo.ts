import { assertEquals, assertNotEquals } from 'https://deno.land/std/testing/asserts.ts'
import { readFileStrSync } from 'https://deno.land/std/fs/read_file_str.ts'
import { dirname, resolve } from 'https://deno.land/std/path/mod.ts'

import * as i from '../ini.ts'
const { test } = Deno
const data = readFileStrSync(resolve(dirname(new URL(import.meta.url).pathname), './fixtures/foo.ini'), { encoding: 'utf-8' })

let d = undefined
const expectE = 'o=p\n'
            + 'a with spaces=b  c\n'
            + '" xa  n          p "="\\"\\r\\nyoyoyo\\r\\r\\n"\n'
            + '"[disturbing]"=hey you never know\n'
            + 's=something\n'
            + 's1=\"something\'\n'
            + 's2=something else\n'
            + 'zr[]=deedee\n'
            + 'ar[]=one\n'
            + 'ar[]=three\n'
            + 'ar[]=this is included\n'
            + 'br=warm\n'
            + 'eq=\"eq=eq\"\n'
            + '\n'
            + '[a]\n'
            + 'av=a val\n'
            + 'e={ o: p, a: '
            + '{ av: a val, b: { c: { e: "this [value]" '
            + '} } } }\nj="\\"{ o: \\"p\\", a: { av:'
            + ' \\"a val\\", b: { c: { e: \\"this [value]'
            + '\\" } } } }\\""\n"[]"=a square?\n'
            + 'cr[]=four\ncr[]=eight\n\n'
            +'[a.b.c]\ne=1\n'
            + 'j=2\n\n[x\\.y\\.z]\nx.y.z=xyz\n\n'
            + '[x\\.y\\.z.a\\.b\\.c]\na.b.c=abc\n'
            + 'nocomment=this\\; this is not a comment\n'
            + 'noHashComment=this\\# this is not a comment\n'
  , expectD =
    { o: 'p',
      'a with spaces': 'b  c',
      " xa  n          p ":'"\r\nyoyoyo\r\r\n',
      '[disturbing]': 'hey you never know',
      's': 'something',
      's1' : '\"something\'',
      's2': 'something else',
      'zr': ['deedee'],
      'ar': ['one', 'three', 'this is included'],
      'br': 'warm',
      'eq': 'eq=eq',
      a:
       { av: 'a val',
         e: '{ o: p, a: { av: a val, b: { c: { e: "this [value]" } } } }',
         j: '"{ o: "p", a: { av: "a val", b: { c: { e: "this [value]" } } } }"',
         "[]": "a square?",
         cr: ['four', 'eight'],
         b: { c: { e: 1, j: 2 } } },
      'x.y.z': {
        'x.y.z': 'xyz',
        'a.b.c': {
          'a.b.c': 'abc',
          'nocomment': 'this\; this is not a comment',
          noHashComment: 'this\# this is not a comment'
        }
      }
    }
  , expectF = '[prefix.log]\n'
            + 'type=file\n\n'
            + '[prefix.log.level]\n'
            + 'label=debug\n'
            + 'value=10\n'
  , expectG = '[log]\n'
            + 'type = file\n\n'
            + '[log.level]\n'
            + 'label = debug\n'
            + 'value = 10\n'

test(function decodeFromFile() {
  var d = i.decode(data)
  assertEquals(d, expectD)
})

test(function encodeFromData() {
  var e = i.encode(expectD)
  assertEquals(e, expectE)

  var obj = {log: { type:'file', level: {label:'debug', value:10} } }
  e = i.encode(obj)
  assertNotEquals(e.slice(0, 1), '\n', 'Never a blank first line')
  assertNotEquals(e.slice(-2), '\n\n', 'Never a blank final line')
})

test(function encodeWithOption() {
  var obj = {log: { type:'file', level: {label:'debug', value:10} } }
  const e = i.encode(obj, { section: 'prefix' })

  assertEquals(e, expectF)
})

test(function encodeWithWhitespace() {
  var obj = {log: { type:'file', level: {label:'debug', value:10} } }
  const e = i.encode(obj, { whitespace: true })

  assertEquals(e, expectG)
})
