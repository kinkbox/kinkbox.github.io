const log = (val, base) => Math.log(val) / Math.log(base);

const strToClass = (str) => {
    let className = '';
    const validChars = 'abcdefghijklmnopqrstuvwxyz';
    let newWord = false;
    const lower = str.toLowerCase();
    for (let i = 0; i < lower.length; i++) {
        let chr = lower[i];
        if (validChars.includes(chr)) {
            if (newWord) chr = chr.toUpperCase();
            className += chr;
            newWord = false;
        } else {
            newWord = true;
        }
    }
    return className;
};

const addCssRule = (selector, rules) => {
    document.styleSheets[0].insertRule(`${selector}{${rules}}`, 0);
};

const elData = new WeakMap();
const setData = (el, key, value) => {
    if (!elData.has(el)) elData.set(el, {});
    elData.get(el)[key] = value;
};
const getData = (el, key) => elData.get(el)?.[key];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const show = (el) => el.classList.remove('hidden');
const hide = (el) => el.classList.add('hidden');

let kinks = {};
const colors = {};
const level = {};

const exportTheme = {
    font: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    bg: '#12141a',
    card: '#1e222c',
    cardHeader: '#262b38',
    rowAlt: 'rgba(255, 255, 255, 0.03)',
    accent: '#c45e8a',
    text: '#e8eaef',
    textMuted: '#8b93a7',
    border: '#353b4a',
    notEntered: '#3a4150',
    headerHeight: 76,
    pad: 24,
    cardInset: 8,
    cardRadius: 10,
    dotRadius: 5,
    dotStroke: 1.5,
    dotFieldStep: 24,
    dotTextGap: 10,
    dotLeftPad: 16,
    simpleHeaderH: 32,
    dualFieldHeaderH: 22,
    titleGap: 10,
    rowHeight: 28,
    labelColWidth: 118,
};

const roundRect = (ctx, x, y, w, h, r) => {
    const radius = Array.isArray(r) ? r : [r, r, r, r];
    const [tl, tr, br, bl] = radius;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl);
    ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
};

const drawChoiceDot = (ctx, cx, cy, lvl, radius = exportTheme.dotRadius) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    if (lvl === 'Not Entered') {
        ctx.fillStyle = exportTheme.notEntered;
        ctx.fill();
        ctx.strokeStyle = exportTheme.border;
        ctx.lineWidth = 1;
        ctx.stroke();
    } else {
        ctx.fillStyle = colors[lvl];
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = exportTheme.dotStroke;
        ctx.stroke();
    }
};

const exportRowLayout = (x, choiceCount) => {
    const { dotLeftPad, dotFieldStep, dotRadius, dotStroke, dotTextGap } = exportTheme;
    const outer = dotRadius + dotStroke;
    const left = x + dotLeftPad;
    const centers = [];
    for (let i = 0; i < choiceCount; i++) {
        centers.push(left + i * dotFieldStep + outer);
    }
    const textX = choiceCount > 0
        ? centers[choiceCount - 1] + outer + dotTextGap
        : left;
    return { centers, textX, textMaxW: null };
};

const exportDualLayout = (x, w, fieldCount) => {
    const labelW = exportTheme.labelColWidth;
    const dotsW = w - labelW;
    const fieldW = dotsW / fieldCount;
    const slots = [];
    for (let i = 0; i < fieldCount; i++) {
        slots.push({
            centerX: x + fieldW * i + fieldW / 2,
            dividerX: x + fieldW * i,
        });
    }
    return {
        slots,
        fieldW,
        dotsW,
        textX: x + dotsW + 8,
        textMaxW: labelW - 12,
    };
};

const drawDualColumnDividers = (ctx, x, y, h, fieldCount, fieldW) => {
    ctx.strokeStyle = exportTheme.border;
    ctx.lineWidth = 0.5;
    for (let i = 1; i < fieldCount; i++) {
        const lineX = x + fieldW * i;
        ctx.beginPath();
        ctx.moveTo(lineX, y);
        ctx.lineTo(lineX, y + h);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(x + fieldW * fieldCount, y);
    ctx.lineTo(x + fieldW * fieldCount, y + h);
    ctx.stroke();
};

const NOT_ENTERED = 'Not Entered';

const getExportRowChoices = (kinkRow) => {
    const choices = [];
    kinkRow.querySelectorAll('.choices').forEach(choicesEl => {
        const selected = choicesEl.querySelector('.choice.selected');
        const value = selected ? getData(selected, 'level') : NOT_ENTERED;
        choices.push(value === NOT_ENTERED ? null : value);
    });
    return choices;
};

const rowHasSelection = (choices) => choices.some(c => c !== null);

document.addEventListener('DOMContentLoaded', () => {
    const inputKinks = {
        columns: [],

        createCategory(name, fields) {
            const category = document.createElement('div');
            category.className = `kinkCategory cat-${strToClass(name)}`;
            setData(category, 'category', name);

            const heading = document.createElement('h2');
            heading.textContent = name;
            category.appendChild(heading);

            const table = document.createElement('table');
            table.className = 'kinkGroup';
            if (fields.length < 2) table.classList.add('single-field');
            setData(table, 'fields', fields);

            const thead = document.createElement('thead');
            for (const field of fields) {
                const th = document.createElement('th');
                th.className = 'choicesCol';
                th.textContent = field;
                thead.appendChild(th);
            }
            thead.appendChild(document.createElement('th'));
            table.appendChild(thead);
            table.appendChild(document.createElement('tbody'));

            const scroll = document.createElement('div');
            scroll.className = 'table-scroll';
            scroll.appendChild(table);
            category.appendChild(scroll);
            return category;
        },

        createChoice() {
            const container = document.createElement('div');
            container.className = 'choices';
            const levels = Object.keys(level);
            levels.forEach((lvl, i) => {
                const btn = document.createElement('button');
                btn.className = `choice ${level[lvl]}`;
                setData(btn, 'level', lvl);
                setData(btn, 'levelInt', i);
                btn.title = lvl;
                btn.addEventListener('click', () => {
                    container.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                });
                container.appendChild(btn);
            });
            return container;
        },

        createKink(fields, kink) {
            const row = document.createElement('tr');
            row.className = `kinkRow kink-${strToClass(kink.kinkName)}`;
            setData(row, 'kink', kink.kinkName);

            for (const field of fields) {
                const choices = inputKinks.createChoice();
                setData(choices, 'field', field);
                choices.classList.add(`choice-${strToClass(field)}`);
                const td = document.createElement('td');
                td.dataset.field = field;
                td.appendChild(choices);
                row.appendChild(td);
            }

            const label = document.createElement('td');
            label.textContent = kink.kinkName;
            if (kink.kinkDesc) showDescriptionButton(kink.kinkDesc, label);
            row.appendChild(label);
            return row;
        },

        createColumns() {
            const colClasses = ['100', '50', '33', '25'];
            const list = $('#InputList');
            const listWidth = list.clientWidth || document.documentElement.clientWidth;
            let numCols = Math.floor((listWidth - 20) / 400);
            if (!numCols) numCols = 1;
            if (window.matchMedia('(max-width: 900px)').matches) numCols = 1;
            if (numCols > 4) numCols = 4;
            const colClass = `col${colClasses[numCols - 1]}`;

            inputKinks.columns = [];
            for (let i = 0; i < numCols; i++) {
                const col = document.createElement('div');
                col.className = `col ${colClass}`;
                list.appendChild(col);
                inputKinks.columns.push(col);
            }
        },

        placeCategories(categories) {
            const body = document.body;
            let totalHeight = 0;
            const heights = categories.map(cat => {
                const clone = cat.cloneNode(true);
                body.appendChild(clone);
                const h = clone.offsetHeight;
                totalHeight += h;
                clone.remove();
                return h;
            });

            const colHeight = totalHeight / inputKinks.columns.length;
            let colIndex = 0;
            categories.forEach((cat, i) => {
                const curHeight = inputKinks.columns[colIndex].offsetHeight;
                const catHeight = heights[i];
                if (curHeight + catHeight / 2 > colHeight) colIndex++;
                while (colIndex >= inputKinks.columns.length) colIndex--;
                inputKinks.columns[colIndex].appendChild(cat);
            });
        },

        fillInputList() {
            const list = $('#InputList');
            list.replaceChildren();
            inputKinks.createColumns();

            const categories = [];
            for (const catName of Object.keys(kinks)) {
                const category = kinks[catName];
                const { fields, kinks: kinkArr } = category;
                const catEl = inputKinks.createCategory(catName, fields);
                const tbody = catEl.querySelector('tbody');
                for (const kink of kinkArr) {
                    tbody.appendChild(inputKinks.createKink(fields, kink));
                }
                categories.push(catEl);
            }
            inputKinks.placeCategories(categories);

            list.querySelectorAll('button.choice').forEach(btn => {
                btn.addEventListener('click', () => {
                    location.hash = inputKinks.updateHash();
                });
            });
        },

        init() {
            inputKinks.fillInputList();
            inputKinks.parseHash();

            $('#Export').addEventListener('click', () => inputKinks.export());

            let lastResize = 0;
            window.addEventListener('resize', () => {
                const curTime = Date.now();
                lastResize = curTime;
                setTimeout(() => {
                    if (lastResize === curTime) {
                        inputKinks.fillInputList();
                        inputKinks.parseHash();
                    }
                }, 500);
            });
        },

        hashChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.=+*^!@',

        maxPow(base, maxVal) {
            let maxPowVal = 1;
            for (let pow = 1; Math.pow(base, pow) <= maxVal; pow++) {
                maxPowVal = pow;
            }
            return maxPowVal;
        },

        prefix(input, len, char) {
            while (input.length < len) input = char + input;
            return input;
        },

        drawExportHeader(context, width, username) {
            const h = exportTheme.headerHeight;
            context.fillStyle = 'rgba(26, 30, 39, 0.95)';
            context.fillRect(0, 0, width, h);

            context.strokeStyle = exportTheme.border;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(0, h);
            context.lineTo(width, h);
            context.stroke();

            context.fillStyle = exportTheme.text;
            context.font = `700 24px ${exportTheme.font}`;
            context.textBaseline = 'middle';
            context.fillText('Kinklist', exportTheme.pad, 30);

            if (username) {
                context.fillStyle = exportTheme.textMuted;
                context.font = `400 15px ${exportTheme.font}`;
                context.fillText(username, exportTheme.pad, 54);
            }

            const levels = Object.keys(colors);
            const chipY = 27;
            const chipH = 22;
            let chipX = width - exportTheme.pad;

            levels.slice().reverse().forEach(lvl => {
                context.font = `500 10px ${exportTheme.font}`;
                const labelW = context.measureText(lvl).width;
                const chipPad = 10;
                const dotX = chipPad + exportTheme.dotRadius + 1;
                const textX = dotX + exportTheme.dotRadius + exportTheme.dotStroke + 6;
                const chipW = textX + labelW + chipPad;
                chipX -= chipW;

                roundRect(context, chipX, chipY, chipW, chipH, chipH / 2);
                context.fillStyle = exportTheme.cardHeader;
                context.fill();
                context.strokeStyle = exportTheme.border;
                context.lineWidth = 1;
                context.stroke();

                drawChoiceDot(context, chipX + dotX, chipY + chipH / 2, lvl, 4.5);
                context.fillStyle = exportTheme.textMuted;
                context.textBaseline = 'middle';
                context.fillText(lvl, chipX + textX, chipY + chipH / 2);

                chipX -= 8;
            });
        },

        drawCategoryBg(context, drawCall) {
            const x = drawCall.x + exportTheme.cardInset;
            const y = drawCall.y;
            const w = drawCall.colWidth - exportTheme.cardInset * 2;
            const h = drawCall.categoryHeight;

            roundRect(context, x, y, w, h, exportTheme.cardRadius);
            context.fillStyle = exportTheme.card;
            context.fill();
            context.strokeStyle = exportTheme.border;
            context.lineWidth = 1;
            context.stroke();
        },

        setupCanvas(width, height, username) {
            document.querySelectorAll('canvas').forEach(c => c.remove());
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');

            const bgGrad = context.createLinearGradient(0, 0, width * 0.3, height);
            bgGrad.addColorStop(0, '#12141a');
            bgGrad.addColorStop(1, '#16131c');
            context.fillStyle = bgGrad;
            context.fillRect(0, 0, width, height);

            const glow = context.createRadialGradient(width * 0.5, 0, 0, width * 0.5, 0, width * 0.55);
            glow.addColorStop(0, 'rgba(196, 94, 138, 0.1)');
            glow.addColorStop(1, 'transparent');
            context.fillStyle = glow;
            context.fillRect(0, 0, width, height);

            inputKinks.drawExportHeader(context, width, username);
            return { context, canvas };
        },

        drawCallHandlers: {
            simpleTitle(context, drawCall) {
                const x = drawCall.x + exportTheme.cardInset;
                const y = drawCall.y;
                const w = drawCall.colWidth - exportTheme.cardInset * 2;
                const h = exportTheme.simpleHeaderH;

                roundRect(context, x, y, w, h, [exportTheme.cardRadius, exportTheme.cardRadius, 0, 0]);
                context.fillStyle = exportTheme.cardHeader;
                context.fill();

                context.fillStyle = exportTheme.accent;
                context.font = `600 10px ${exportTheme.font}`;
                context.textBaseline = 'middle';
                context.fillText(drawCall.data.toUpperCase(), x + 12, y + h / 2);
            },
            fieldHeader(context, drawCall) {
                const x = drawCall.x + exportTheme.cardInset;
                const y = drawCall.y;
                const w = drawCall.colWidth - exportTheme.cardInset * 2;
                const fields = drawCall.data.fields;
                const h = exportTheme.dualFieldHeaderH;
                const layout = exportDualLayout(x, w, fields.length);

                context.fillStyle = exportTheme.card;
                context.fillRect(x, y, layout.dotsW, h);

                drawDualColumnDividers(context, x, y, h, fields.length, layout.fieldW);

                context.font = `600 9px ${exportTheme.font}`;
                context.fillStyle = exportTheme.textMuted;
                context.textBaseline = 'middle';
                context.textAlign = 'center';
                fields.forEach((field, i) => {
                    context.fillText(field, layout.slots[i].centerX, y + h / 2);
                });
                context.textAlign = 'left';

                context.strokeStyle = exportTheme.border;
                context.lineWidth = 0.5;
                context.beginPath();
                context.moveTo(x, y + h - 0.5);
                context.lineTo(x + w, y + h - 0.5);
                context.stroke();
            },
            kinkRow(context, drawCall) {
                const x = drawCall.x + exportTheme.cardInset;
                const rowY = drawCall.y;
                const w = drawCall.colWidth - exportTheme.cardInset * 2;
                const rowH = exportTheme.rowHeight;
                const midY = rowY + rowH / 2;
                const { text, choices, rowIndex, isLastRow, fields } = drawCall.data;

                if (rowIndex % 2 === 1) {
                    context.fillStyle = exportTheme.rowAlt;
                    context.fillRect(x + 1, rowY + 1, w - 2, rowH - 2);
                }

                let textX;
                let maxTextW;

                if (fields && fields.length >= 2) {
                    const layout = exportDualLayout(x, w, fields.length);
                    drawDualColumnDividers(context, x, rowY, rowH, fields.length, layout.fieldW);

                    choices.forEach((choice, i) => {
                        if (choice !== null) {
                            drawChoiceDot(context, layout.slots[i].centerX, midY, choice);
                        }
                    });

                    textX = layout.textX;
                    maxTextW = layout.textMaxW;
                } else {
                    const layout = exportRowLayout(x, choices.length);
                    choices.forEach((choice, i) => {
                        if (choice !== null) {
                            drawChoiceDot(context, layout.centers[i], midY, choice);
                        }
                    });
                    textX = layout.textX;
                    maxTextW = x + w - 10 - textX;
                }

                context.fillStyle = exportTheme.text;
                context.font = `400 11px ${exportTheme.font}`;
                context.textBaseline = 'middle';
                let label = text;
                while (label.length > 3 && context.measureText(label).width > maxTextW) {
                    label = label.slice(0, -4) + '…';
                }
                context.fillText(label, textX, midY);

                if (!isLastRow) {
                    context.strokeStyle = exportTheme.border;
                    context.lineWidth = 0.5;
                    context.beginPath();
                    context.moveTo(x + 8, rowY + rowH - 1);
                    context.lineTo(x + w - 8, rowY + rowH - 1);
                    context.stroke();
                }
            },
        },

        export() {
            let username = prompt('Please enter your name');
            if (typeof username !== 'string') return;
            if (username.length) username = '(' + username + ')';

            const numCols = 6;
            const columnWidth = 300;
            const { simpleHeaderH, dualFieldHeaderH, titleGap, rowHeight } = exportTheme;
            const catGap = 12;
            const offsets = {
                left: exportTheme.pad,
                right: exportTheme.pad,
                top: exportTheme.headerHeight + 16,
                bottom: exportTheme.pad,
            };

            const exportCategories = [];
            $$('.kinkCategory').forEach(catEl => {
                const catName = getData(catEl, 'category');
                const category = kinks[catName];
                const rows = [];
                catEl.querySelectorAll('.kinkRow').forEach(kinkRow => {
                    const choices = getExportRowChoices(kinkRow);
                    if (!rowHasSelection(choices)) return;
                    rows.push({
                        text: getData(kinkRow, 'kink'),
                        choices,
                    });
                });
                if (rows.length === 0) return;
                exportCategories.push({
                    catName,
                    fields: category.fields,
                    rows,
                });
            });

            if (exportCategories.length === 0) {
                alert('Nothing to export — fill in at least one item first.');
                return;
            }

            let totalHeight = 0;
            let dualCats = 0;
            let simpleCats = 0;
            let numKinks = 0;
            exportCategories.forEach(({ fields, rows }) => {
                const fieldHeaderH = fields.length >= 2 ? dualFieldHeaderH : 0;
                totalHeight += simpleHeaderH + fieldHeaderH + titleGap + rows.length * rowHeight + catGap;
                numKinks += rows.length;
                if (fields.length < 2) simpleCats++;
                else dualCats++;
            });

            const columns = Array.from({ length: numCols }, () => ({ height: 0, drawStack: [] }));
            const avgColHeight = totalHeight / numCols;
            let columnIndex = 0;

            exportCategories.forEach(({ catName, fields, rows }) => {
                const isDual = fields.length >= 2;
                const fieldHeaderH = isDual ? dualFieldHeaderH : 0;
                const catHeight = simpleHeaderH + fieldHeaderH + titleGap + rows.length * rowHeight;

                if (columns[columnIndex].height + (catHeight + catGap) / 2 > avgColHeight) columnIndex++;
                while (columnIndex >= numCols) columnIndex--;
                const column = columns[columnIndex];

                if (column.height > 0) column.height += catGap;

                const titleCall = { y: column.height, categoryHeight: catHeight, colWidth: columnWidth };
                column.drawStack.push(titleCall);
                column.height += simpleHeaderH;
                titleCall.type = 'simpleTitle';
                titleCall.data = catName;

                if (isDual) {
                    column.drawStack.push({
                        y: column.height,
                        type: 'fieldHeader',
                        colWidth: columnWidth,
                        data: { fields },
                    });
                    column.height += dualFieldHeaderH;
                }

                column.height += titleGap;
                rows.forEach((row, rowIndex) => {
                    const drawCall = {
                        y: column.height,
                        type: 'kinkRow',
                        colWidth: columnWidth,
                        data: {
                            text: row.text,
                            choices: row.choices,
                            rowIndex,
                            isLastRow: rowIndex === rows.length - 1,
                            fields: isDual ? fields : null,
                        },
                    };
                    column.drawStack.push(drawCall);
                    column.height += rowHeight;
                });
            });

            const tallestColumnHeight = Math.max(...columns.map(c => c.height));
            const canvasWidth = offsets.left + offsets.right + columnWidth * numCols;
            const canvasHeight = offsets.top + offsets.bottom + tallestColumnHeight;
            const { context, canvas } = inputKinks.setupCanvas(canvasWidth, canvasHeight, username);

            columns.forEach((column, i) => {
                const drawX = offsets.left + columnWidth * i;
                column.drawStack.forEach(drawCall => {
                    drawCall.x = drawX;
                    drawCall.y += offsets.top;
                    drawCall.colWidth = columnWidth;
                });
            });

            columns.forEach(column => {
                column.drawStack.forEach(drawCall => {
                    if (drawCall.categoryHeight) {
                        inputKinks.drawCategoryBg(context, drawCall);
                    }
                });
            });

            columns.forEach(column => {
                column.drawStack.forEach(drawCall => {
                    inputKinks.drawCallHandlers[drawCall.type](context, drawCall);
                });
            });

            const slug = username.replace(/[()]/g, '').trim().replace(/[^\w.-]+/g, '-').replace(/^-|-$/g, '');
            const filename = slug ? `kinklist-${slug}.png` : 'kinklist.png';

            canvas.toBlob(blob => {
                if (!blob) {
                    alert('Failed to generate image');
                    return;
                }
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/png');
        },

        encode(base, input) {
            const hashBase = inputKinks.hashChars.length;
            const outputPow = inputKinks.maxPow(hashBase, Number.MAX_SAFE_INTEGER);
            const inputPow = inputKinks.maxPow(base, Math.pow(hashBase, outputPow));

            let output = '';
            const numChunks = Math.ceil(input.length / inputPow);
            let inputIndex = 0;
            for (let chunkId = 0; chunkId < numChunks; chunkId++) {
                let inputIntValue = 0;
                for (let pow = 0; pow < inputPow; pow++) {
                    const inputVal = input[inputIndex++];
                    if (inputVal === undefined) break;
                    inputIntValue += inputVal * Math.pow(base, pow);
                }

                let outputCharValue = '';
                while (inputIntValue > 0) {
                    const maxPowVal = Math.floor(log(inputIntValue, hashBase));
                    const powVal = Math.pow(hashBase, maxPowVal);
                    const charInt = Math.floor(inputIntValue / powVal);
                    outputCharValue += inputKinks.hashChars[charInt];
                    inputIntValue -= charInt * powVal;
                }
                output += inputKinks.prefix(outputCharValue, outputPow, inputKinks.hashChars[0]);
            }
            return output;
        },

        decode(base, output) {
            const hashBase = inputKinks.hashChars.length;
            const outputPow = inputKinks.maxPow(hashBase, Number.MAX_SAFE_INTEGER);
            const values = [];
            const numChunks = Math.max(output.length / outputPow);
            for (let i = 0; i < numChunks; i++) {
                const chunk = output.substring(i * outputPow, (i + 1) * outputPow);
                values.push(...inputKinks.decodeChunk(base, chunk));
            }
            return values;
        },

        decodeChunk(base, chunk) {
            const hashBase = inputKinks.hashChars.length;
            const outputPow = inputKinks.maxPow(hashBase, Number.MAX_SAFE_INTEGER);
            const inputPow = inputKinks.maxPow(base, Math.pow(hashBase, outputPow));

            let chunkInt = 0;
            for (let i = 0; i < chunk.length; i++) {
                const charInt = inputKinks.hashChars.indexOf(chunk[i]);
                const pow = chunk.length - 1 - i;
                chunkInt += Math.pow(hashBase, pow) * charInt;
            }

            const output = [];
            for (let pow = inputPow - 1; pow >= 0; pow--) {
                const posBase = Math.floor(Math.pow(base, pow));
                const posVal = Math.floor(chunkInt / posBase);
                output.push(posVal);
                chunkInt -= posBase * posVal;
            }
            output.reverse();
            return output;
        },

        updateHash() {
            const hashValues = [];
            $$('#InputList .choices').forEach(choicesEl => {
                const selected = choicesEl.querySelector('.selected');
                hashValues.push(selected ? getData(selected, 'levelInt') : 0);
            });
            return inputKinks.encode(Object.keys(colors).length, hashValues);
        },

        parseHash() {
            const hash = location.hash.substring(1);
            if (hash.length < 10) return;

            const values = inputKinks.decode(Object.keys(colors).length, hash);
            let valueIndex = 0;
            $$('#InputList .choices').forEach(choicesEl => {
                const value = values[valueIndex++];
                const child = choicesEl.children[value];
                if (child) child.classList.add('selected');
            });
        },

        saveSelection() {
            const selection = [];
            $$('.choice.selected').forEach(btn => {
                const choices = btn.closest('.choices');
                const row = btn.closest('tr.kinkRow');
                const cat = btn.closest('.kinkCategory');
                const selector = '.' + [...cat.classList].join('.') + ' .' +
                    [...row.classList].join('.') + ' .' +
                    [...choices.classList].join('.') + ' .' +
                    [...btn.classList].filter(c => c !== 'selected').join('.');
                selection.push(selector);
            });
            return selection;
        },

        inputListToText() {
            let text = '';
            for (const catName of Object.keys(kinks)) {
                const { fields, kinks: catKinks } = kinks[catName];
                text += '#' + catName + '\r\n';
                text += '(' + fields.join(', ') + ')\r\n';
                for (const kink of catKinks) {
                    text += '* ' + kink.kinkName + '\r\n';
                    if (kink.kinkDesc) text += '? ' + kink.kinkDesc + '\r\n';
                }
                text += '\r\n';
            }
            return text;
        },

        restoreSavedSelection(selection) {
            setTimeout(() => {
                for (const selector of selection) {
                    const el = document.querySelector(selector);
                    if (el) el.classList.add('selected');
                }
                location.hash = inputKinks.updateHash();
            }, 300);
        },

        parseKinksText(kinksText) {
            const newKinks = {};
            const lines = kinksText.replace(/\r/g, '').split('\n');

            let cat = null;
            let catName = null;
            let kink = null;

            const finalizeCategory = () => {
                if (!catName) return;
                if (!(cat.fields instanceof Array) || cat.fields.length < 1) {
                    alert(catName + ' does not have any fields defined!');
                    return false;
                }
                if (!(cat.kinks instanceof Array) || cat.kinks.length < 1) {
                    alert(catName + ' does not have any kinks listed!');
                    return false;
                }
                newKinks[catName] = cat;
                return true;
            };

            for (const line of lines) {
                if (!line.length) continue;

                if (line[0] === '#') {
                    if (catName && !newKinks[catName]) {
                        if (!finalizeCategory()) return;
                    }
                    catName = line.substring(1).trim();
                    cat = { kinks: [] };
                }
                if (!catName) continue;
                if (line[0] === '(') {
                    cat.fields = line.substring(1, line.length - 1).trim().split(',').map(f => f.trim());
                }
                if (line[0] === '*') {
                    kink = { kinkName: line.substring(1).trim() };
                    cat.kinks.push(kink);
                }
                if (line[0] === '?') {
                    kink.kinkDesc = line.substring(1).trim();
                }
            }
            if (catName && !newKinks[catName]) {
                if (!finalizeCategory()) return;
            }
            return newKinks;
        },

        async loadList(filename) {
            const response = await fetch(filename);
            const data = await response.text();
            $('#Kinks').value = data;
            kinks = inputKinks.parseKinksText(data);
        },
    };

    function showDescriptionButton(description, attachElement) {
        const btn = document.createElement('button');
        btn.className = 'KinkDesc';
        btn.addEventListener('click', () => {
            $('#Description').textContent = description;
            show($('#DescriptionOverlay'));
        });
        attachElement.appendChild(btn);
    }

    $$('.legend .choice').forEach(choice => {
        const parent = choice.parentElement;
        const text = parent.textContent.trim();
        const color = choice.dataset.color;
        const cssClass = choice.className.replace('choice ', '').trim();
        addCssRule('.choice.' + cssClass, 'background-color: ' + color + ';');
        colors[text] = color;
        level[text] = cssClass;
    });

    $('#Edit').addEventListener('click', () => {
        $('#Kinks').value = inputKinks.inputListToText().trim();
        show($('#EditOverlay'));
    });
    $('#EditOverlay').addEventListener('click', () => hide($('#EditOverlay')));
    $('#KinksOK').addEventListener('click', () => {
        const selection = inputKinks.saveSelection();
        try {
            kinks = inputKinks.parseKinksText($('#Kinks').value);
            inputKinks.fillInputList();
        } catch {
            alert('An error occured trying to parse the text entered, please correct it and try again');
            return;
        }
        inputKinks.restoreSavedSelection(selection);
        hide($('#EditOverlay'));
    });
    $$('.overlay > *').forEach(child => {
        child.addEventListener('click', e => e.stopPropagation());
    });
    $('#DescriptionOverlay').addEventListener('click', () => hide($('#DescriptionOverlay')));
    $('#Description').addEventListener('click', () => hide($('#DescriptionOverlay')));

    $('#listType').addEventListener('change', async () => {
        const selection = inputKinks.saveSelection();
        await inputKinks.loadList($('#listType').value + '.txt');
        inputKinks.fillInputList();
        inputKinks.restoreSavedSelection(selection);
    });

    inputKinks.loadList('classic.txt').then(() => inputKinks.init());

    // Guided input popup
    const popup = $('#InputOverlay');
    const previous = $('#InputPrevious');
    const next = $('#InputNext');
    const categoryEl = $('#InputCategory');
    const fieldEl = $('#InputField');
    const options = $('#InputValues');

    function getChoiceValue(choicesEl) {
        const selected = choicesEl.querySelector('.choice.selected');
        return selected ? getData(selected, 'level') : undefined;
    }

    function getChoicesElement(category, kink, field) {
        const selector = `.cat-${strToClass(category)} .kink-${strToClass(kink.kinkName)} .choice-${strToClass(field)}`;
        return $(selector);
    }

    inputKinks.getAllKinks = function () {
        const list = [];
        for (const category of Object.keys(kinks)) {
            const { fields, kinks: kinkArr } = kinks[category];
            for (const field of fields) {
                for (const kink of kinkArr) {
                    const choicesEl = getChoicesElement(category, kink, field);
                    list.push({
                        category,
                        kink: { name: kink.kinkName, desc: kink.kinkDesc },
                        field,
                        value: getChoiceValue(choicesEl),
                        choicesEl,
                        showField: fields.length >= 2,
                    });
                }
            }
        }
        return list;
    };

    inputKinks.inputPopup = {
        numPrev: 3,
        numNext: 3,
        allKinks: [],

        kinkByIndex(i) {
            const numKinks = inputKinks.inputPopup.allKinks.length;
            return inputKinks.inputPopup.allKinks[(numKinks + i) % numKinks];
        },

        generatePrimary(kink) {
            const container = document.createElement('div');
            let btnIndex = 0;
            $$('.legend > div').forEach(legendDiv => {
                const btn = legendDiv.cloneNode(true);
                btn.classList.add('big-choice');
                container.appendChild(btn);

                const numSpan = document.createElement('span');
                numSpan.className = 'btn-num-text';
                numSpan.textContent = btnIndex++;
                btn.appendChild(numSpan);

                const text = btn.textContent.trim().replace(/[0-9]/g, '');
                if (kink.value === text) btn.classList.add('selected');

                btn.addEventListener('click', () => {
                    container.querySelectorAll('.big-choice').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    kink.value = text;
                    const choiceClass = strToClass(text);
                    const choiceBtn = kink.choicesEl.querySelector('.' + choiceClass);
                    if (choiceBtn) choiceBtn.click();
                    inputKinks.inputPopup.showNext();
                });
            });
            return container;
        },

        generateSecondary(kink) {
            const container = document.createElement('div');
            container.className = 'kink-simple';

            const dot = document.createElement('span');
            dot.className = `choice ${level[kink.value] || ''}`;
            container.appendChild(dot);

            const catSpan = document.createElement('span');
            catSpan.className = 'txt-category';
            catSpan.textContent = kink.category;
            container.appendChild(catSpan);

            if (kink.showField) {
                const fieldSpan = document.createElement('span');
                fieldSpan.className = 'txt-field';
                fieldSpan.textContent = kink.field;
                container.appendChild(fieldSpan);
            }

            const kinkSpan = document.createElement('span');
            kinkSpan.className = 'txt-kink';
            kinkSpan.textContent = kink.kink.name;
            container.appendChild(kinkSpan);
            return container;
        },

        showIndex(index) {
            previous.replaceChildren();
            next.replaceChildren();
            options.replaceChildren();
            setData(popup, 'index', index);

            const currentKink = inputKinks.inputPopup.kinkByIndex(index);
            const currentEl = inputKinks.inputPopup.generatePrimary(currentKink);
            options.appendChild(currentEl);
            categoryEl.textContent = currentKink.category;

            fieldEl.replaceChildren();
            const labelText = (currentKink.showField ? '(' + currentKink.field + ') ' : '') + currentKink.kink.name;
            fieldEl.appendChild(document.createTextNode(labelText));
            if (currentKink.kink.desc) showDescriptionButton(currentKink.kink.desc, fieldEl);

            for (let i = inputKinks.inputPopup.numPrev; i > 0; i--) {
                const prevKink = inputKinks.inputPopup.kinkByIndex(index - i);
                const prevEl = inputKinks.inputPopup.generateSecondary(prevKink);
                previous.appendChild(prevEl);
                prevEl.addEventListener('click', () => inputKinks.inputPopup.showPrev(i));
            }
            for (let i = 1; i <= inputKinks.inputPopup.numNext; i++) {
                const nextKink = inputKinks.inputPopup.kinkByIndex(index + i);
                const nextEl = inputKinks.inputPopup.generateSecondary(nextKink);
                next.appendChild(nextEl);
                nextEl.addEventListener('click', () => inputKinks.inputPopup.showNext(i));
            }
        },

        showPrev(skip = 1) {
            const index = getData(popup, 'index') - skip;
            const numKinks = inputKinks.inputPopup.allKinks.length;
            inputKinks.inputPopup.showIndex((numKinks + index) % numKinks);
        },

        showNext(skip = 1) {
            const index = getData(popup, 'index') + skip;
            const numKinks = inputKinks.inputPopup.allKinks.length;
            inputKinks.inputPopup.showIndex((numKinks + index) % numKinks);
        },

        show() {
            inputKinks.inputPopup.allKinks = inputKinks.getAllKinks();
            inputKinks.inputPopup.showIndex(0);
            show(popup);
        },
    };

    window.addEventListener('keydown', e => {
        if (e.altKey || e.shiftKey || e.ctrlKey) return;
        if (popup.classList.contains('hidden')) return;

        if (e.key === 'ArrowUp') {
            inputKinks.inputPopup.showPrev();
            e.preventDefault();
            return;
        }
        if (e.key === 'ArrowDown') {
            inputKinks.inputPopup.showNext();
            e.preventDefault();
            return;
        }

        let btn = -1;
        if (e.keyCode >= 96 && e.keyCode <= 101) btn = e.keyCode - 96;
        else if (e.keyCode >= 48 && e.keyCode <= 53) btn = e.keyCode - 48;
        else return;

        const btns = options.querySelectorAll('.big-choice');
        if (btns[btn]) btns[btn].click();
    });

    $('#StartBtn').addEventListener('click', () => inputKinks.inputPopup.show());
    $('#InputCurrent .closePopup').addEventListener('click', () => hide(popup));
    popup.addEventListener('click', () => hide(popup));
});
