import type { KinkList, RatingsMap, RatingLevel } from '@/lib/types'
import {
  RATING_COLORS,
  RATING_GLOW,
  RATING_LEVELS,
  ratingKey,
} from '@/lib/types'

/** Stitch Utilitarian Matrix tokens for canvas export */
const theme = {
  font: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontHeading: '"Plus Jakarta Sans", Inter, system-ui, sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, monospace',
  bg: '#0a0a0c',
  surfaceLowest: '#0e0e10',
  surfaceLow: '#1c1b1d',
  surface: '#201f21',
  surfaceHigh: '#2a2a2c',
  stroke: '#2e2e3a',
  strokeBright: '#3b3b48',
  text: '#f4f4f6',
  textMuted: '#9e9ea8',
  textFaint: '#656573',
  accent: '#ff516a',
  accentSoft: '#ffb2b7',
  success: '#4edea3',
  headerHeight: 88,
  footerHeight: 36,
  pad: 24,
  cardInset: 6,
  cardRadius: 12,
  cardPad: 12,
  headerH: 28,
  rowH: 32,
  rowGap: 4,
  catGap: 14,
  pipR: 5,
  pipGap: 14,
  titleGap: 8,
}

type DrawCall = {
  x?: number
  y: number
  type?: string
  colWidth: number
  categoryHeight?: number
  data?: unknown
}

type ExportRow = { text: string; levels: number[] }
type ExportCategory = {
  catName: string
  fields: string[]
  rows: ExportRow[]
  rated: number
  total: number
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number | number[],
) {
  const radius = Array.isArray(r) ? r : [r, r, r, r]
  const [tl, tr, br, bl] = radius
  ctx.beginPath()
  ctx.moveTo(x + tl, y)
  ctx.lineTo(x + w - tr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr)
  ctx.lineTo(x + w, y + h - br)
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h)
  ctx.lineTo(x + bl, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl)
  ctx.lineTo(x, y + tl)
  ctx.quadraticCurveTo(x, y, x + tl, y)
  ctx.closePath()
}

function drawPip(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  levelIndex: number,
  selected: boolean,
  radius = theme.pipR,
) {
  const level = RATING_LEVELS[levelIndex] as RatingLevel
  const color = RATING_COLORS[level]

  ctx.beginPath()
  ctx.arc(cx, cy, selected ? radius + 0.5 : radius, 0, Math.PI * 2)

  if (selected) {
    ctx.fillStyle = color
    ctx.fill()
    const glow = RATING_GLOW[level]
    if (glow !== 'transparent') {
      ctx.shadowColor = glow
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.shadowBlur = 0
    }
    ctx.strokeStyle = `${color}66`
    ctx.lineWidth = 2
    ctx.stroke()
  } else {
    ctx.fillStyle = theme.strokeBright
    ctx.fill()
  }
}

function drawPipStrip(
  ctx: CanvasRenderingContext2D,
  x: number,
  cy: number,
  selectedLevel: number,
) {
  const centers: number[] = []
  for (let i = 0; i < RATING_LEVELS.length; i++) {
    const cx = x + i * theme.pipGap + theme.pipR
    centers.push(cx)
    drawPip(ctx, cx, cy, i, selectedLevel === i)
  }
  return {
    endX: x + (RATING_LEVELS.length - 1) * theme.pipGap + theme.pipR * 2 + 10,
  }
}

function drawExportHeader(
  ctx: CanvasRenderingContext2D,
  width: number,
  username: string,
  rated: number,
  total: number,
) {
  const h = theme.headerHeight
  ctx.fillStyle = theme.surfaceLowest
  ctx.fillRect(0, 0, width, h)

  ctx.strokeStyle = theme.stroke
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(width, h)
  ctx.stroke()

  // Brand mark
  roundRect(ctx, theme.pad, 22, 28, 28, 6)
  ctx.fillStyle = 'rgba(255, 81, 106, 0.15)'
  ctx.fill()
  ctx.fillStyle = theme.accent
  ctx.font = `700 14px ${theme.fontHeading}`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('K', theme.pad + 14, 36)
  ctx.textAlign = 'left'

  ctx.fillStyle = theme.text
  ctx.font = `600 20px ${theme.fontHeading}`
  ctx.fillText('kinklist', theme.pad + 40, 30)

  ctx.fillStyle = theme.success
  ctx.beginPath()
  ctx.arc(theme.pad + 44, 50, 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = theme.textMuted
  ctx.font = `500 10px ${theme.fontMono}`
  const sub = username
    ? `v2.4 • Private & Local  ${username}`
    : 'v2.4 • Private & Local'
  ctx.fillText(sub, theme.pad + 52, 50)

  // Completion chip
  const pct = total ? Math.round((rated / total) * 100) : 0
  const chip = `${rated}/${total} rated • ${pct}%`
  ctx.font = `500 11px ${theme.fontMono}`
  const chipW = ctx.measureText(chip).width + 16
  let chipX = width - theme.pad - chipW
  roundRect(ctx, chipX, 18, chipW, 22, 4)
  ctx.fillStyle = theme.surface
  ctx.fill()
  ctx.fillStyle = theme.success
  ctx.textBaseline = 'middle'
  ctx.fillText(chip, chipX + 8, 29)

  // Legend chips
  let lx = width - theme.pad
  const legendY = 54
  ;[...RATING_LEVELS].reverse().forEach((lvl, revI) => {
    const i = RATING_LEVELS.length - 1 - revI
    ctx.font = `500 9px ${theme.fontMono}`
    const label = `${lvl} ${i}`
    const labelW = ctx.measureText(label).width
    const w = 14 + labelW + 10
    lx -= w
    roundRect(ctx, lx, legendY, w, 18, 4)
    ctx.fillStyle = theme.surfaceLow
    ctx.fill()
    drawPip(ctx, lx + 8, legendY + 9, i, i > 0, 3.5)
    ctx.fillStyle = theme.textMuted
    ctx.textBaseline = 'middle'
    ctx.fillText(label, lx + 16, legendY + 9)
    lx -= 6
  })
}

function drawExportFooter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const y = height - theme.footerHeight
  ctx.fillStyle = theme.surfaceLowest
  ctx.fillRect(0, y, width, theme.footerHeight)
  ctx.strokeStyle = theme.stroke
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.lineTo(width, y)
  ctx.stroke()

  ctx.fillStyle = theme.success
  ctx.font = `500 10px ${theme.fontMono}`
  ctx.textBaseline = 'middle'
  ctx.fillText(
    '100% Client-side • Zero-server • Ratings live in the URL hash',
    theme.pad,
    y + theme.footerHeight / 2,
  )

  ctx.fillStyle = theme.textFaint
  ctx.textAlign = 'right'
  ctx.fillText('kinklist matrix export', width - theme.pad, y + theme.footerHeight / 2)
  ctx.textAlign = 'left'
}

function drawCategoryBg(ctx: CanvasRenderingContext2D, drawCall: DrawCall) {
  const x = (drawCall.x ?? 0) + theme.cardInset
  const y = drawCall.y
  const w = drawCall.colWidth - theme.cardInset * 2
  const h = drawCall.categoryHeight ?? 0

  roundRect(ctx, x, y, w, h, theme.cardRadius)
  ctx.fillStyle = theme.surfaceLow
  ctx.fill()
  ctx.strokeStyle = theme.stroke
  ctx.lineWidth = 1
  ctx.stroke()
}

function categoryBlockHeight(fields: string[], rowCount: number): number {
  const dual = fields.length >= 2
  // header + gap + rows (each dual field adds extra row height)
  const rowsH = dual
    ? rowCount * (theme.rowH * fields.length + 6)
    : rowCount * (theme.rowH + theme.rowGap)
  return theme.cardPad + theme.headerH + theme.titleGap + rowsH + theme.cardPad
}

export function exportPng(
  list: KinkList,
  ratings: RatingsMap,
  usernameRaw: string,
): void {
  let username = usernameRaw.trim()
  if (username.length) username = `(${username})`

  const numCols = 3
  const columnWidth = 420
  const offsets = {
    left: theme.pad,
    right: theme.pad,
    top: theme.headerHeight + 20,
    bottom: theme.pad + theme.footerHeight,
  }

  let globalRated = 0
  let globalTotal = 0

  const exportCategories: ExportCategory[] = []
  for (const catName of Object.keys(list)) {
    const category = list[catName]
    const rows: ExportRow[] = []
    let rated = 0
    let total = 0

    for (const kink of category.kinks) {
      const levels = category.fields.map((field) => {
        const idx = ratings[ratingKey(catName, kink.name, field)] ?? 0
        total++
        globalTotal++
        if (idx > 0) {
          rated++
          globalRated++
        }
        return idx
      })
      if (!levels.some((l) => l > 0)) continue
      rows.push({ text: kink.name, levels })
    }
    if (rows.length === 0) continue
    exportCategories.push({
      catName,
      fields: category.fields,
      rows,
      rated,
      total,
    })
  }

  if (exportCategories.length === 0) {
    throw new Error('Nothing to export — fill in at least one item first.')
  }

  let totalHeight = 0
  exportCategories.forEach((cat) => {
    totalHeight += categoryBlockHeight(cat.fields, cat.rows.length) + theme.catGap
  })

  const columns = Array.from({ length: numCols }, () => ({
    height: 0,
    drawStack: [] as DrawCall[],
  }))
  const avgColHeight = totalHeight / numCols
  let columnIndex = 0

  exportCategories.forEach((cat) => {
    const catHeight = categoryBlockHeight(cat.fields, cat.rows.length)

    if (columns[columnIndex].height + catHeight / 2 > avgColHeight) columnIndex++
    while (columnIndex >= numCols) columnIndex--
    const column = columns[columnIndex]

    if (column.height > 0) column.height += theme.catGap

    column.drawStack.push({
      y: column.height,
      categoryHeight: catHeight,
      colWidth: columnWidth,
      type: 'category',
      data: cat,
    })
    column.height += catHeight
  })

  const tallestColumnHeight = Math.max(...columns.map((c) => c.height), 0)
  const canvasWidth = offsets.left + offsets.right + columnWidth * numCols
  const canvasHeight = offsets.top + offsets.bottom + tallestColumnHeight

  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to create canvas')

  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  const glow = ctx.createRadialGradient(
    canvasWidth * 0.5,
    0,
    0,
    canvasWidth * 0.5,
    0,
    canvasWidth * 0.5,
  )
  glow.addColorStop(0, 'rgba(255, 81, 106, 0.07)')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  drawExportHeader(ctx, canvasWidth, username, globalRated, globalTotal)

  columns.forEach((column, i) => {
    const drawX = offsets.left + columnWidth * i
    column.drawStack.forEach((drawCall) => {
      drawCall.x = drawX
      drawCall.y += offsets.top
      drawCall.colWidth = columnWidth
    })
  })

  columns.forEach((column) => {
    column.drawStack.forEach((drawCall) => {
      if (drawCall.categoryHeight) drawCategoryBg(ctx, drawCall)
    })
  })

  const drawCategory = (
    context: CanvasRenderingContext2D,
    drawCall: DrawCall,
  ) => {
    const cat = drawCall.data as ExportCategory
    const x = (drawCall.x ?? 0) + theme.cardInset
    const w = drawCall.colWidth - theme.cardInset * 2
    let y = drawCall.y + theme.cardPad
    const dual = cat.fields.length >= 2

    // Category header
    context.fillStyle = theme.text
    context.font = `600 14px ${theme.fontHeading}`
    context.textBaseline = 'middle'
    context.fillText(cat.catName, x + theme.cardPad, y + theme.headerH / 2)

    const badge = `${cat.rated}/${cat.total} rated`
    context.font = `500 10px ${theme.fontMono}`
    const badgeW = context.measureText(badge).width + 12
    const badgeX = x + w - theme.cardPad - badgeW
    roundRect(context, badgeX, y + 4, badgeW, 20, 4)
    context.fillStyle = theme.surface
    context.fill()
    context.fillStyle = theme.textMuted
    context.fillText(badge, badgeX + 6, y + theme.headerH / 2)

    y += theme.headerH + theme.titleGap

    cat.rows.forEach((row) => {
      if (dual) {
        // Name row
        roundRect(context, x + 8, y, w - 16, theme.rowH * cat.fields.length + 4, 6)
        context.fillStyle = theme.surface
        context.fill()

        context.fillStyle = theme.text
        context.font = `600 12px ${theme.font}`
        context.fillText(row.text, x + 16, y + 14)

        cat.fields.forEach((field, fi) => {
          const rowY = y + 22 + fi * (theme.rowH - 4)
          const mid = rowY + 10
          context.fillStyle = theme.textFaint
          context.font = `500 9px ${theme.fontMono}`
          context.fillText(field, x + 16, mid)

          const stripX = x + 16 + Math.max(context.measureText(field).width + 12, 70)
          drawPipStrip(context, stripX, mid, row.levels[fi] ?? 0)
        })

        y += theme.rowH * cat.fields.length + 10
      } else {
        roundRect(context, x + 8, y, w - 16, theme.rowH, 6)
        context.fillStyle = theme.surface
        context.fill()

        const mid = y + theme.rowH / 2
        const { endX } = drawPipStrip(context, x + 16, mid, row.levels[0] ?? 0)

        context.fillStyle = theme.text
        context.font = `600 12px ${theme.font}`
        let label = row.text
        const maxW = x + w - 20 - endX
        while (label.length > 3 && context.measureText(label).width > maxW) {
          label = label.slice(0, -4) + '…'
        }
        context.fillText(label, endX, mid)

        y += theme.rowH + theme.rowGap
      }
    })
  }

  columns.forEach((column) => {
    column.drawStack.forEach((drawCall) => {
      if (drawCall.type === 'category') drawCategory(ctx, drawCall)
    })
  })

  drawExportFooter(ctx, canvasWidth, canvasHeight)

  const slug = username
    .replace(/[()]/g, '')
    .trim()
    .replace(/[^\w.-]+/g, '-')
    .replace(/^-|-$/g, '')
  const filename = slug ? `kinklist-${slug}.png` : 'kinklist.png'

  canvas.toBlob((blob) => {
    if (!blob) {
      alert('Failed to generate image')
      return
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
