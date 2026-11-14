const HASH_CHARS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.=+*^!@'

const logBase = (val: number, base: number) => Math.log(val) / Math.log(base)

function maxPow(base: number, maxVal: number): number {
  let maxPowVal = 1
  for (let pow = 1; Math.pow(base, pow) <= maxVal; pow++) {
    maxPowVal = pow
  }
  return maxPowVal
}

function prefix(input: string, len: number, char: string): string {
  while (input.length < len) input = char + input
  return input
}

export function encodeRatings(base: number, input: number[]): string {
  const hashBase = HASH_CHARS.length
  const outputPow = maxPow(hashBase, Number.MAX_SAFE_INTEGER)
  const inputPow = maxPow(base, Math.pow(hashBase, outputPow))

  let output = ''
  const numChunks = Math.ceil(input.length / inputPow)
  let inputIndex = 0
  for (let chunkId = 0; chunkId < numChunks; chunkId++) {
    let inputIntValue = 0
    for (let pow = 0; pow < inputPow; pow++) {
      const inputVal = input[inputIndex++]
      if (inputVal === undefined) break
      inputIntValue += inputVal * Math.pow(base, pow)
    }

    let outputCharValue = ''
    while (inputIntValue > 0) {
      const maxPowVal = Math.floor(logBase(inputIntValue, hashBase))
      const powVal = Math.pow(hashBase, maxPowVal)
      const charInt = Math.floor(inputIntValue / powVal)
      outputCharValue += HASH_CHARS[charInt]
      inputIntValue -= charInt * powVal
    }
    output += prefix(outputCharValue, outputPow, HASH_CHARS[0])
  }
  return output
}

function decodeChunk(base: number, chunk: string): number[] {
  const hashBase = HASH_CHARS.length
  const outputPow = maxPow(hashBase, Number.MAX_SAFE_INTEGER)
  const inputPow = maxPow(base, Math.pow(hashBase, outputPow))

  let chunkInt = 0
  for (let i = 0; i < chunk.length; i++) {
    const charInt = HASH_CHARS.indexOf(chunk[i])
    const pow = chunk.length - 1 - i
    chunkInt += Math.pow(hashBase, pow) * charInt
  }

  const output: number[] = []
  for (let pow = inputPow - 1; pow >= 0; pow--) {
    const posBase = Math.floor(Math.pow(base, pow))
    const posVal = Math.floor(chunkInt / posBase)
    output.push(posVal)
    chunkInt -= posBase * posVal
  }
  output.reverse()
  return output
}

export function decodeRatings(base: number, output: string): number[] {
  const hashBase = HASH_CHARS.length
  const outputPow = maxPow(hashBase, Number.MAX_SAFE_INTEGER)
  const values: number[] = []
  const numChunks = Math.max(output.length / outputPow, 0)
  for (let i = 0; i < numChunks; i++) {
    const chunk = output.substring(i * outputPow, (i + 1) * outputPow)
    values.push(...decodeChunk(base, chunk))
  }
  return values
}
