import { roundD2 } from '@aryth/math'

export const trailZero = (num) => {
  if (!num) return '0'
  const tx = '' + roundD2(num)
  let i = tx.indexOf('.')
  if (!~i) { return tx + '.00' }
  let df = tx.length - i
  if (df === 3) { return tx }
  if (df === 2) { return tx + '0' }
  if (df === 1) { return tx + '00' }
  return tx
}

export const base3ToScale = (base3, dec) => {
  if (base3 === 0) return 'B'                //
  if (base3 === 1) return dec ? 'K' : 'KB' // Kilo
  if (base3 === 2) return dec ? 'M' : 'MB' // Mega
  if (base3 === 3) return dec ? 'G' : 'GB' // Giga
  if (base3 === 4) return dec ? 'T' : 'TB' // Tera
  if (base3 === 5) return dec ? 'P' : 'PB' // Peta
  if (base3 === 6) return dec ? 'E' : 'EB' // Exa
  if (base3 === 7) return dec ? 'Z' : 'ZB' // Zetta
  if (base3 === 8) return dec ? 'Y' : 'YB' // Yotta
}

export const humanScale = (num, dec) => {
  const thousand = dec ? 1000 : 1024
  let base3 = 0
  while (num > thousand) { num /= thousand, base3++ }
  return trailZero(num) + ' ' + base3ToScale(base3, dec)
}