import { DecoCrostab, decoCrostab, says } from '@spare/logger'
import { strategies }                     from '@valjoux/strategies'

const BENCH = '++++++++++++'
const { lapse, result } = strategies({
    repeat: 2E+6,
    candidates: {
      empty: [ '', 0 ],
      simple: [ '-', 1 ],
      naive: [ '.', 2 ],
      many: [ '+', 12 ],
    },
    methods: {
      bench: (ch, len) => ch + len,
      bench2: (ch, len) => BENCH.slice(0, len),
      arch: (ch, len) => Buffer.alloc(len, ch).toString(),
      cla: (ch, len) => Array(len + 1).join(ch),
      edge: (ch, len) => ch.repeat(len),
      dev: (ch, len) => ''.padStart(len, ch),
      epic: (ch, len) => {
        let i = 0
        let t = ''
        while (i < len) {
          t += ch
          i++
        }
        return t
      }
    }
  }
)
lapse |> DecoCrostab() |> says['lapse']
result |> decoCrostab |> says['result']
