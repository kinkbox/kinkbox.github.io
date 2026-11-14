import type { Category, KinkItem, KinkList } from '@/lib/types'

export class ParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParseError'
  }
}

export function parseKinksText(kinksText: string): KinkList {
  const newKinks: KinkList = {}
  const lines = kinksText.replace(/\r/g, '').split('\n')

  let cat: Category | null = null
  let catName: string | null = null
  let kink: KinkItem | null = null

  const finalizeCategory = () => {
    if (!catName || !cat) return
    if (!Array.isArray(cat.fields) || cat.fields.length < 1) {
      throw new ParseError(`${catName} does not have any fields defined!`)
    }
    if (!Array.isArray(cat.kinks) || cat.kinks.length < 1) {
      throw new ParseError(`${catName} does not have any kinks listed!`)
    }
    newKinks[catName] = cat
  }

  for (const line of lines) {
    if (!line.length) continue

    if (line[0] === '#') {
      if (catName && !newKinks[catName]) {
        finalizeCategory()
      }
      catName = line.substring(1).trim()
      cat = { fields: [], kinks: [] }
      kink = null
    }
    if (!catName || !cat) continue
    if (line[0] === '(') {
      cat.fields = line
        .substring(1, line.length - 1)
        .trim()
        .split(',')
        .map((f) => f.trim())
    }
    if (line[0] === '*') {
      kink = { name: line.substring(1).trim() }
      cat.kinks.push(kink)
    }
    if (line[0] === '?' && kink) {
      kink.desc = line.substring(1).trim()
    }
  }
  if (catName && !newKinks[catName]) {
    finalizeCategory()
  }
  return newKinks
}

export function kinkListToText(kinks: KinkList): string {
  let text = ''
  for (const catName of Object.keys(kinks)) {
    const { fields, kinks: catKinks } = kinks[catName]
    text += '#' + catName + '\r\n'
    text += '(' + fields.join(', ') + ')\r\n'
    for (const kink of catKinks) {
      text += '* ' + kink.name + '\r\n'
      if (kink.desc) text += '? ' + kink.desc + '\r\n'
    }
    text += '\r\n'
  }
  return text
}

export async function loadListFile(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to load ${url}`)
  return response.text()
}
