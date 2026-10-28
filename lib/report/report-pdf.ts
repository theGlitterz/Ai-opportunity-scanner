import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SCANNER_QUESTIONS } from '../../data/scanner-questions';
import type { ProfitOpportunityReport, ScannerAnswers, ScannerProfile } from '../../types';

type PdfInput = {
  scanId: string;
  completedAt: string;
  profile: ScannerProfile;
  answers: ScannerAnswers;
  report: ProfitOpportunityReport;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 46;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FONT_PATH = join(process.cwd(), 'assets', 'fonts', 'NotoSans-Regular.ttf');

type FontMetrics = {
  unitsPerEm: number;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  ascent: number;
  descent: number;
  glyphForCodePoint: (codePoint: number) => number;
  advanceForGlyph: (glyphId: number) => number;
};

function tableOffset(font: Buffer, tag: string): number {
  const tableCount = font.readUInt16BE(4);
  for (let index = 0; index < tableCount; index += 1) {
    const offset = 12 + index * 16;
    if (font.toString('ascii', offset, offset + 4) === tag) return font.readUInt32BE(offset + 8);
  }
  throw new Error(`Required TrueType table ${tag} is missing.`);
}

function parseFont(font: Buffer): FontMetrics {
  const head = tableOffset(font, 'head');
  const hhea = tableOffset(font, 'hhea');
  const hmtx = tableOffset(font, 'hmtx');
  const cmap = tableOffset(font, 'cmap');
  const unitsPerEm = font.readUInt16BE(head + 18);
  const numberOfHMetrics = font.readUInt16BE(hhea + 34);
  const advances = Array.from({ length: numberOfHMetrics }, (_, index) => font.readUInt16BE(hmtx + index * 4));

  const subtableCount = font.readUInt16BE(cmap + 2);
  const subtables = Array.from({ length: subtableCount }, (_, index) => {
    const record = cmap + 4 + index * 8;
    const platform = font.readUInt16BE(record);
    const encoding = font.readUInt16BE(record + 2);
    const offset = cmap + font.readUInt32BE(record + 4);
    return { platform, encoding, offset, format: font.readUInt16BE(offset) };
  });
  const selected = subtables.find(item => item.format === 12 && item.platform === 3)
    ?? subtables.find(item => item.format === 12)
    ?? subtables.find(item => item.format === 4 && item.platform === 3)
    ?? subtables.find(item => item.format === 4);
  if (!selected) throw new Error('The bundled font has no supported Unicode character map.');

  let glyphForCodePoint: (codePoint: number) => number;
  if (selected.format === 12) {
    const groupCount = font.readUInt32BE(selected.offset + 12);
    const groups = Array.from({ length: groupCount }, (_, index) => {
      const offset = selected.offset + 16 + index * 12;
      return { start: font.readUInt32BE(offset), end: font.readUInt32BE(offset + 4), startGlyph: font.readUInt32BE(offset + 8) };
    });
    glyphForCodePoint = codePoint => {
      let low = 0;
      let high = groups.length - 1;
      while (low <= high) {
        const middle = (low + high) >>> 1;
        const group = groups[middle];
        if (codePoint < group.start) high = middle - 1;
        else if (codePoint > group.end) low = middle + 1;
        else return group.startGlyph + codePoint - group.start;
      }
      return 0;
    };
  } else {
    const segmentCount = font.readUInt16BE(selected.offset + 6) / 2;
    const endCodes = selected.offset + 14;
    const startCodes = endCodes + segmentCount * 2 + 2;
    const deltas = startCodes + segmentCount * 2;
    const rangeOffsets = deltas + segmentCount * 2;
    glyphForCodePoint = codePoint => {
      if (codePoint > 0xffff) return 0;
      for (let index = 0; index < segmentCount; index += 1) {
        const end = font.readUInt16BE(endCodes + index * 2);
        if (codePoint > end) continue;
        const start = font.readUInt16BE(startCodes + index * 2);
        if (codePoint < start) return 0;
        const delta = font.readInt16BE(deltas + index * 2);
        const rangeOffsetPosition = rangeOffsets + index * 2;
        const rangeOffset = font.readUInt16BE(rangeOffsetPosition);
        if (rangeOffset === 0) return (codePoint + delta) & 0xffff;
        const glyph = font.readUInt16BE(rangeOffsetPosition + rangeOffset + (codePoint - start) * 2);
        return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
      }
      return 0;
    };
  }

  return {
    unitsPerEm,
    xMin: font.readInt16BE(head + 36),
    yMin: font.readInt16BE(head + 38),
    xMax: font.readInt16BE(head + 40),
    yMax: font.readInt16BE(head + 42),
    ascent: font.readInt16BE(hhea + 4),
    descent: font.readInt16BE(hhea + 6),
    glyphForCodePoint,
    advanceForGlyph: glyphId => advances[Math.min(glyphId, advances.length - 1)],
  };
}

function streamObject(extraDictionary: string, data: Buffer): Buffer {
  const dictionary = extraDictionary ? ` ${extraDictionary}` : '';
  return Buffer.concat([
    Buffer.from(`<< /Length ${data.length}${dictionary} >>\nstream\n`, 'ascii'),
    data,
    Buffer.from('\nendstream', 'ascii'),
  ]);
}

class EmbeddedFont {
  readonly data = readFileSync(FONT_PATH);
  readonly metrics = parseFont(this.data);
  private readonly codePointToCid = new Map<number, number>();
  private readonly cidToCodePoint: number[] = [];
  private readonly cidToGlyph: number[] = [];

  private cidFor(codePoint: number): number {
    const existing = this.codePointToCid.get(codePoint);
    if (existing !== undefined) return existing;
    const glyph = this.metrics.glyphForCodePoint(codePoint);
    if (glyph === 0 && codePoint !== 0) {
      const notation = `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
      throw new Error(`The PDF font does not support character ${notation}; submitted content was not changed.`);
    }
    const cid = this.cidToCodePoint.length + 1;
    if (cid > 0xffff) throw new Error('The PDF contains too many distinct characters.');
    this.codePointToCid.set(codePoint, cid);
    this.cidToCodePoint.push(codePoint);
    this.cidToGlyph.push(glyph);
    return cid;
  }

  encode(value: string): string {
    return Array.from(value, character => this.cidFor(character.codePointAt(0)!).toString(16).padStart(4, '0')).join('');
  }

  width(value: string, fontSize: number): number {
    let units = 0;
    for (const character of value) {
      const glyph = this.metrics.glyphForCodePoint(character.codePointAt(0)!);
      units += this.metrics.advanceForGlyph(glyph);
    }
    return units * fontSize / this.metrics.unitsPerEm;
  }

  buildObjects(add: (value: Buffer | string) => number): number {
    const fontFileId = add(streamObject(`/Length1 ${this.data.length}`, this.data));
    const glyphMap = Buffer.alloc((this.cidToGlyph.length + 1) * 2);
    this.cidToGlyph.forEach((glyph, index) => glyphMap.writeUInt16BE(glyph, (index + 1) * 2));
    const glyphMapId = add(streamObject('', glyphMap));

    const mappings = this.cidToCodePoint.map((codePoint, index) => {
      const cid = (index + 1).toString(16).padStart(4, '0');
      const unicode = codePoint <= 0xffff
        ? codePoint.toString(16).padStart(4, '0')
        : (() => {
            const scalar = codePoint - 0x10000;
            return `${(0xd800 + (scalar >>> 10)).toString(16)}${(0xdc00 + (scalar & 0x3ff)).toString(16)}`;
          })();
      return `<${cid}> <${unicode}>`;
    });
    const mappingBlocks: string[] = [];
    for (let index = 0; index < mappings.length; index += 100) {
      const block = mappings.slice(index, index + 100);
      mappingBlocks.push(`${block.length} beginbfchar\n${block.join('\n')}\nendbfchar`);
    }
    const toUnicode = `/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /NotoSansUnicode def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${mappingBlocks.join('\n')}\nendcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
    const toUnicodeId = add(streamObject('', Buffer.from(toUnicode, 'ascii')));

    const scale = (value: number) => Math.round(value * 1000 / this.metrics.unitsPerEm);
    const descriptorId = add(`<< /Type /FontDescriptor /FontName /NotoSans-Regular /Flags 32 /FontBBox [${scale(this.metrics.xMin)} ${scale(this.metrics.yMin)} ${scale(this.metrics.xMax)} ${scale(this.metrics.yMax)}] /ItalicAngle 0 /Ascent ${scale(this.metrics.ascent)} /Descent ${scale(this.metrics.descent)} /CapHeight ${scale(this.metrics.ascent)} /StemV 80 /FontFile2 ${fontFileId} 0 R >>`);
    const widthEntries = this.cidToGlyph.map((glyph, index) => `${index + 1} [${Math.round(this.metrics.advanceForGlyph(glyph) * 1000 / this.metrics.unitsPerEm)}]`).join(' ');
    const cidFontId = add(`<< /Type /Font /Subtype /CIDFontType2 /BaseFont /NotoSans-Regular /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptorId} 0 R /DW 600 /W [${widthEntries}] /CIDToGIDMap ${glyphMapId} 0 R >>`);
    return add(`<< /Type /Font /Subtype /Type0 /BaseFont /NotoSans-Regular /Encoding /Identity-H /DescendantFonts [${cidFontId} 0 R] /ToUnicode ${toUnicodeId} 0 R >>`);
  }
}

function cleanText(value: unknown): string {
  return String(value ?? '').replace(/[\t\r\n]+/g, ' ').replace(/\s+/gu, ' ').trim();
}

function money(value: number): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function answerLabel(input: PdfInput, questionId: string): string {
  const question = SCANNER_QUESTIONS.find(item => item.id === questionId);
  if (!question) return '';
  const raw = questionId in input.profile ? input.profile[questionId as keyof ScannerProfile] : input.answers[questionId];
  const values = Array.isArray(raw) ? raw : [raw];
  return values.map(value => question.options.find(option => option.value === value)?.label ?? String(value ?? '')).join(', ');
}

function wrap(font: EmbeddedFont, value: string, maxWidth: number, size: number): string[] {
  const text = cleanText(value);
  if (!text) return [''];
  const lines: string[] = [];
  let line = '';
  for (const originalWord of text.split(' ')) {
    let word = originalWord;
    while (font.width(word, size) > maxWidth) {
      let split = 1;
      while (split < word.length && font.width(word.slice(0, split + 1), size) <= maxWidth) split += 1;
      if (line) lines.push(line);
      lines.push(word.slice(0, split));
      line = '';
      word = word.slice(split);
    }
    const candidate = line ? `${line} ${word}` : word;
    if (line && font.width(candidate, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

type Page = { commands: string[] };

class ReportPdf {
  readonly font = new EmbeddedFont();
  pages: Page[] = [];
  page: Page = { commands: [] };
  y = PAGE_HEIGHT - MARGIN;

  constructor() { this.pages.push(this.page); }

  addPage() {
    this.page = { commands: [] };
    this.pages.push(this.page);
    this.y = PAGE_HEIGHT - MARGIN;
    this.headerRule();
  }

  ensure(height: number) { if (this.y - height < MARGIN + 18) this.addPage(); }

  headerRule() {
    this.page.commands.push('0.31 0.41 1 RG 1 w 46 812 m 549 812 l S');
    this.y = 798;
  }

  rect(x: number, y: number, width: number, height: number, fill: string, stroke?: string) {
    this.page.commands.push(`${fill} rg${stroke ? ` ${stroke} RG` : ''} ${x} ${y} ${width} ${height} re ${stroke ? 'B' : 'f'}`);
  }

  text(value: string, x: number, y: number, size = 10, bold = false, color = '0.23 0.29 0.38') {
    const rendering = bold ? `${color} RG 0.32 w 2 Tr` : '0 Tr';
    this.page.commands.push(`BT ${color} rg ${rendering} /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm <${this.font.encode(value)}> Tj ET`);
  }

  paragraph(value: string, options: { size?: number; bold?: boolean; color?: string; indent?: number; gap?: number; maxCharacters?: number } = {}) {
    const size = options.size ?? 9.5;
    const leading = size * 1.42;
    const indent = options.indent ?? 0;
    const availableWidth = options.maxCharacters ? Math.min(CONTENT_WIDTH - indent, options.maxCharacters * size * 0.52) : CONTENT_WIDTH - indent;
    for (const line of wrap(this.font, value, availableWidth, size)) {
      this.ensure(leading);
      this.text(line, MARGIN + indent, this.y, size, options.bold, options.color);
      this.y -= leading;
    }
    const gap = options.gap ?? 8;
    this.ensure(gap);
    this.y -= gap;
  }

  heading(value: string, level: 1 | 2 | 3 = 2) {
    const size = level === 1 ? 21 : level === 2 ? 15 : 11;
    const gap = level === 1 ? 13 : 8;
    this.ensure(size * 2.2);
    this.paragraph(value, { size, bold: true, color: '0.05 0.09 0.15', gap, maxCharacters: level === 1 ? 44 : 70 });
  }

  label(value: string) {
    this.paragraph(value.toLocaleUpperCase('en-IE'), { size: 7.5, bold: true, color: '0.31 0.41 1', gap: 4, maxCharacters: 90 });
  }
}

export function generateReportPdf(input: PdfInput): Buffer {
  const pdf = new ReportPdf();
  const { profile, report } = input;
  const company = profile.companyName.trim() || 'Prepared by VRise';
  const date = new Date(input.completedAt).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

  pdf.headerRule();
  pdf.text('Vrise', MARGIN, pdf.y, 17, true, '0.31 0.41 1');
  pdf.y -= 32;
  pdf.heading('AI Profit Opportunity Report', 1);
  pdf.paragraph(`${company} | ${date} | Scan ${input.scanId}`, { size: 8, color: '0.45 0.50 0.58', gap: 17 });

  pdf.ensure(145);
  const cardTop = pdf.y;
  pdf.rect(MARGIN, cardTop - 126, CONTENT_WIDTH, 126, '0.04 0.09 0.17');
  pdf.text('EXECUTIVE RESULT', MARGIN + 18, cardTop - 24, 7.5, true, '0.56 0.65 1');
  const headline = report.opportunityLevel === 'Very High' ? 'High-value AI profit opportunity identified' : report.opportunityLevel === 'Low' ? 'Targeted AI profit opportunity identified' : 'Significant AI profit opportunity identified';
  pdf.text(headline, MARGIN + 18, cardTop - 48, 16, true, '1 1 1');
  wrap(pdf.font, report.summary, CONTENT_WIDTH - 36, 8.5).slice(0, 4).forEach((line, index) => pdf.text(line, MARGIN + 18, cardTop - 69 - index * 13, 8.5, false, '0.84 0.87 0.92'));
  pdf.y = cardTop - 145;

  pdf.heading('Opportunity summary', 2);
  pdf.paragraph(`Estimated annual opportunity: ${money(report.annualOpportunity.low)}–${money(report.annualOpportunity.high)}`, { bold: true, color: '0.31 0.41 1', gap: 3 });
  pdf.paragraph(`EBITDA-equivalent impact: ${report.marginImpact.low}–${report.marginImpact.high}% | Capacity opportunity: ${money(report.capacityOpportunity.low)}–${money(report.capacityOpportunity.high)} | Confidence: ${report.confidence}`, { gap: 5 });
  pdf.paragraph('The annual opportunity is the estimated value pool across revenue uplift, cost efficiency, operating capacity, working-capital improvement, and risk leakage reduction. EBITDA-equivalent impact is directional and would be validated during a paid pilot using real workflows, tools, and business data. This is not a guaranteed saving figure.', { size: 8.2, color: '0.35 0.40 0.48', gap: 15 });

  pdf.heading('What we based this on', 2);
  for (const question of SCANNER_QUESTIONS) pdf.paragraph(`${question.text}: ${answerLabel(input, question.id)}`, { size: 8.5, gap: 3 });
  pdf.y -= 8;

  pdf.heading('Top 3 AI profit opportunities', 2);
  report.topLevers.forEach((lever, index) => {
    pdf.ensure(112);
    pdf.label(`${index + 1}. ${lever.name}`);
    pdf.paragraph(`${money(lever.valueLow)}–${money(lever.valueHigh)} | Speed to value: ${lever.speedToValue} | Complexity: ${lever.complexity}`, { bold: true, color: '0.31 0.41 1', gap: 4 });
    pdf.paragraph(lever.whyItMatters, { size: 8.8, gap: 4 });
    pdf.paragraph(`What AI could do: ${lever.exampleImplementation}`, { size: 8.8, gap: 11 });
  });

  pdf.heading('Recommended first area', 2);
  pdf.paragraph(report.recommendation.area, { size: 12, bold: true, color: '0.05 0.09 0.15', gap: 5 });
  pdf.paragraph(report.recommendation.whyFirst, { gap: 5 });
  pdf.paragraph(`Validate: ${report.recommendation.validate}`, { gap: 4 });
  pdf.paragraph(`Review: ${report.recommendation.review}`, { gap: 4 });
  pdf.paragraph(`Client output: ${report.recommendation.output}`, { gap: 15 });

  pdf.heading('How to read these numbers', 2);
  pdf.paragraph('These estimates are indicative and based on your selected company profile, sector patterns, operating maturity, and AI readiness. They are not guaranteed savings or a financial forecast. VRise validates the opportunity during a paid pilot using real workflows, tools, and business data.', { size: 8.8, gap: 8 });
  pdf.heading('Assumptions', 3);
  report.assumptions.forEach(item => pdf.paragraph(`• ${item}`, { size: 8.2, indent: 6, gap: 3 }));

  const objects: Buffer[] = [];
  const add = (value: Buffer | string) => { objects.push(typeof value === 'string' ? Buffer.from(value, 'ascii') : value); return objects.length; };
  const catalogId = add('');
  const pagesId = add('');
  const fontId = pdf.font.buildObjects(add);
  const pageIds: number[] = [];
  for (const page of pdf.pages) {
    const contentId = add(streamObject('', Buffer.from(page.commands.join('\n'), 'ascii')));
    pageIds.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`));
  }
  objects[catalogId - 1] = Buffer.from(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`, 'ascii');
  objects[pagesId - 1] = Buffer.from(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`, 'ascii');

  const parts: Buffer[] = [Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1')];
  const offsets = [0];
  let length = parts[0].length;
  objects.forEach((object, index) => {
    offsets.push(length);
    const wrapped = Buffer.concat([Buffer.from(`${index + 1} 0 obj\n`, 'ascii'), object, Buffer.from('\nendobj\n', 'ascii')]);
    parts.push(wrapped);
    length += wrapped.length;
  });
  const trailer = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${length}\n%%EOF`;
  parts.push(Buffer.from(trailer, 'ascii'));
  return Buffer.concat(parts);
}
