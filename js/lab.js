/* eslint-disable no-unused-vars */
'use strict';

const fontPath = 'assets/FiraMath-Regular.woff';
// const fontPath = 'assets/test/XITSMath-Regular.woff';

// Load the font file
const request = new XMLHttpRequest();
request.onload = () => {
  const font = parseFont(request.response);
  updateDOM(font);
};
request.open('GET', fontPath);
request.responseType = 'arraybuffer';
request.send();

function reshape(array, colCount) {
  const rowCount = Math.ceil(array.length / colCount);
  const fullRowCount = rowCount - (rowCount * colCount - array.length);
  const result = [];
  for (let i = 0; i < fullRowCount; i++) {
    result.push([...Array(colCount).keys()].map((e) => e * rowCount + i));
  }
  for (let i = fullRowCount; i < rowCount; i++) {
    result.push([...Array(colCount - 1).keys()].map((e) => e * rowCount + i));
  }
  return result.map((row) => row.map((e) => array[e]));
}

function updateDOM(font) {
  const glyphs    = font.glyphs;
  const mathTable = font.tables.MATH;

  const _glyph     = (e) => glyphs[e.glyphID];
  const _tableHTML = (html) => `<table><tbody>${html}</tbody></table>`;
  const _row       = (row) => '<tr>' + row.map((e) => `<td>${e}</td>`).join('') + '</tr>';
  const _reshape   = (arr, n) => reshape(arr, n).map((row) => _row(row.flat())).join('');
  const _table     = (t, f, n = 1) => _tableHTML(_reshape(t.map(f), n));
  const _mathValue = (val) => (typeof val === 'number') ? val : val.value;
  const _mathKern  = (val) => (typeof val === 'undefined') ? '' :
    `[${val.correctionHeight.map(_mathValue).join(', ')}] -> ` +
    `[${val.kernValues.map(_mathValue).join(', ')}]`;
  const _glyphPart = (e) => `${_glyph(e)} & `+
    `[${[e.startConnectorLength, e.endConnectorLength, e.fullAdvance].join(', ')}]` +
    (e.partFlags ? ' ext' : '');

  const _mathConstants   = (e) => [e, _mathValue(mathConstants[e])];
  const _mathItalicsCorr = (e) => [_glyph(e), e.italicsCorr.value];
  const _mathTopAccent   = (e) => [_glyph(e), e.topAccent.value];
  const _extendedShape   = (e) => glyphs[e];
  const _mathKernInfo    = (e) => [_glyph(e),
    [e.trMathKern, e.tlMathKern, e.brMathKern, e.blMathKern].map(_mathKern)].flat();
  const _glyphVariants   = (e) => [_glyph(e),
    e.variant.map((v) => `${glyphs[v.variantGlyph]} @ ${v.advanceMeasurement}`)].flat();
  const _glyphAssembly   = (e) => [_glyph(e),
    _mathValue(e.variant.italicsCorr), e.variant.partRecords.map(_glyphPart)].flat();

  const mathConstants     = mathTable.mathConstants;
  const mathItalicsCorr   = mathTable.mathGlyphInfo.mathItalicsCorrectionInfo;
  const mathTopAccent     = mathTable.mathGlyphInfo.mathTopAccentAttachment;
  const extendedShape     = mathTable.mathGlyphInfo.extendedShapeCoverage;
  const mathKernInfo      = mathTable.mathGlyphInfo.mathKernInfo;
  const vertGlyphVariants = mathTable.mathVariants.vertGlyphVariants;
  const horiGlyphVariants = mathTable.mathVariants.horiGlyphVariants;
  const vertGlyphAssembly = mathTable.mathVariants.vertGlyphAssembly;
  const horiGlyphAssembly = mathTable.mathVariants.horiGlyphAssembly;

  // Add `minConnectorOverlap` to `mathConstants`
  mathConstants.minConnectorOverlap = mathTable.mathVariants.minConnectorOverlap;

  const mathConstantsHTML   = _table(Object.keys(mathConstants), _mathConstants, 3);
  const mathItalicsCorrHTML = _table(mathItalicsCorr, _mathItalicsCorr, 8);
  const mathTopAccentHTML   = _table(mathTopAccent, _mathTopAccent, 8);
  const extendedShapeHTML   = _table(extendedShape, _extendedShape, 8);
  const mathKernInfoHTML    = _table(mathKernInfo, _mathKernInfo);
  const mathGlyphInfoHTML   =
      '<h3>MathItalicsCorrectionInfo Table</h3>' + mathItalicsCorrHTML
    + '<h3>MathTopAccentAttachment Table</h3>' + mathTopAccentHTML
    + '<h3>ExtendedShapeCoverage Table</h3>' + extendedShapeHTML
    + '<h3>MathKernInfo Table</h3>' + mathKernInfoHTML;
  const vertGlyphVariantsHTML = _table(vertGlyphVariants, _glyphVariants);
  const horiGlyphVariantsHTML = _table(horiGlyphVariants, _glyphVariants);
  const vertGlyphAssemblyHTML = _table(vertGlyphAssembly, _glyphAssembly);
  const horiGlyphAssemblyHTML = _table(horiGlyphAssembly, _glyphAssembly);
  const mathVariantsHTML      =
      '<h3>Vertical Glyph Variants</h3>' + vertGlyphVariantsHTML
    + '<h3>Horizontal Glyph Variants</h3>' + horiGlyphVariantsHTML
    + '<h3>Vertical Glyph Assembly</h3>' + vertGlyphAssemblyHTML
    + '<h3>Horizontal Glyph Assembly</h3>' + horiGlyphAssemblyHTML;

  document.getElementById('math-constants').innerHTML = mathConstantsHTML;
  document.getElementById('math-glyph-info').innerHTML = mathGlyphInfoHTML;
  document.getElementById('math-variants').innerHTML = mathVariantsHTML;
}

// Basic data types
// See https://docs.microsoft.com/zh-cn/typography/opentype/spec/otff#data-types
const getInt16  = (buffer, offset) => new DataView(buffer, offset, 2).getInt16(0, false);
const getInt32  = (buffer, offset) => new DataView(buffer, offset, 4).getInt32(0, false);
const getUint8  = (buffer, offset) => new DataView(buffer, offset, 1).getUint8(0, false);
const getUint16 = (buffer, offset) => new DataView(buffer, offset, 2).getUint16(0, false);
const getUint32 = (buffer, offset) => new DataView(buffer, offset, 4).getUint32(0, false);
const getFixed  = (buffer, offset) => [0, 2].map((i) => getUint16(buffer, offset + i)).join('.');
const getFWord  = (buffer, offset) => getInt16(buffer, offset);
const getOffset = (buffer, offset, offSize = 2) => {
  switch (offSize) {
    case 1:
      return getUint8(buffer, offset);
    case 2:
      return getUint16(buffer, offset);
    case 3:
      return getUint24(buffer, offset);
    case 4:
      return getUint32(buffer, offset);
    default:
      return -1;
  }
};
const getOffSize = (buffer, offset) => getUint8(buffer, offset);
const getTag = (buffer, offset) =>
  Array.from(new Uint8Array(buffer.slice(offset, offset + 4)))
      .map((x) => String.fromCharCode(x)).join('');
const getArray = (buffer, offset, length, callback, elemSize) =>
  Array.from({length: length}, (x, i) => callback(buffer, offset + elemSize * i));

const getRangeRecord = (buffer, offset) => ({
  startGlyphID:       getUint16(buffer, offset),
  endGlyphID:         getUint16(buffer, offset + 2),
  startCoverageIndex: getUint16(buffer, offset + 4),
});
const getMathValueRecord = (buffer, offset) => ({
  value:             getInt16(buffer, offset),
  deviceTableOffset: getOffset(buffer, offset + 2),
});
const getMathKernInfoRecord = (buffer, offset) => ({
  // tr= Top right, tl= Top left, br= Bottom right, bl= Bottom left
  trMathKernOffset: getOffset(buffer, offset),
  tlMathKernOffset: getOffset(buffer, offset + 2),
  brMathKernOffset: getOffset(buffer, offset + 4),
  blMathKernOffset: getOffset(buffer, offset + 6),
});
const getMathGlyphVariantRecord = (buffer, offset) => ({
  variantGlyph:       getUint16(buffer, offset),
  advanceMeasurement: getUint16(buffer, offset + 2),
});
const getGlyphPartRecord = (buffer, offset) => ({
  glyphID:              getUint16(buffer, offset),
  startConnectorLength: getUint16(buffer, offset + 2),
  endConnectorLength:   getUint16(buffer, offset + 4),
  fullAdvance:          getUint16(buffer, offset + 6),
  partFlags:            getUint16(buffer, offset + 8),
});

function getCoverage(buffer, offset) {
  const coverageFormat = getUint16(buffer, offset);
  switch (coverageFormat) {
    case 1:
      const glyphCount = getUint16(buffer, offset += 2);
      return getArray(buffer, offset += 2, glyphCount, getUint16, 2);
    case 2:
      const rangeCount = getUint16(buffer, offset += 2);
      const rangeRecords = getArray(buffer, offset += 2, rangeCount, getRangeRecord, 6);
      const glyphArray = [];
      for (const record of Object.values(rangeRecords)) {
        const start = record.startCoverageIndex;
        const end   = start + record.endGlyphID - record.startGlyphID + 1;
        for (let i = start; i < end; i++) {
          glyphArray[i] = record.startGlyphID + i - start;
        }
      }
      return glyphArray;
    default:
      throw new Error('Invalid coverageFormat ' + coverageFormat);
  }
}

function parseFont(buffer) {
  let offset = 0;
  const signature = getTag(buffer, offset); offset += 4;

  if (signature === 'wOFF') {
    // WOFF Header
    const woffHeader = {
      signature:      signature,
      flavor:         getTag(buffer, offset),
      length:         getUint32(buffer, offset += 4),
      numTables:      getUint16(buffer, offset += 4),
      totalSfntSize:  getUint32(buffer, offset += 2 + 2), // Reserved UInt16
      majorVersion:   getUint16(buffer, offset += 4),
      minorVersion:   getUint16(buffer, offset += 2),
      metaOffset:     getUint32(buffer, offset += 2),
      metaLength:     getUint32(buffer, offset += 4),
      metaOrigLength: getUint32(buffer, offset += 4),
      privOffset:     getUint32(buffer, offset += 4),
      privLength:     getUint32(buffer, offset += 4),
    };
    offset += 4;

    // Table Directory
    const tableDirectory = {};
    for (let i = 0; i < woffHeader.numTables; i++) {
      const [key, value] = getTableDirectoryEntry(buffer, offset);
      tableDirectory[key] = value;
      offset += 20;
    }

    const _parseTable = (_table, _callback) =>
      _callback(uncompress(buffer, tableDirectory[_table]));
    return {
      glyphs: Object.values(opentype.parse(buffer).glyphs.glyphs).map((e) => e.name),
      tables: {
        'CFF ': _parseTable('CFF ', parseCff),
        'post': _parseTable('post', parsePost),
        'MATH': _parseTable('MATH', parseMath),
      },
    };
  } else {
    throw new Error('Unsupported OpenType flavor ' + signature);
  }
}

function getTableDirectoryEntry(buffer, offset) {
  return [getTag(buffer, offset),
    {
      offset:       getUint32(buffer, offset + 4),
      compLength:   getUint32(buffer, offset + 8),
      origLength:   getUint32(buffer, offset + 12),
      origChecksum: getUint32(buffer, offset + 16),
    }];
}

function uncompress(buffer, metaData) {
  const [offset, compLength, origLength, origChecksum] = Object.values(metaData);
  const data = pako.inflate(new Uint8Array(buffer, offset, compLength));
  if (data.length === origLength) {
    return data.buffer;
  } else {
    throw new Error('Uncompress failed: length not valid');
  }
}


function parseCff(buffer) {
  let offset = 0;
  const cffHeader = {
    majorVersion: getUint8(buffer, offset),
    minorVersion: getUint8(buffer, offset += 1),
    headerSize:   getUint8(buffer, offset += 1),
    offsetSize:   getOffSize(buffer, offset += 1),
  };
  offset = cffHeader.offsetSize; // TODO?

  const _cffNameIndex = parseCffIndex(buffer, offset);
  const cffNameIndex = _cffNameIndex.indexData.map(
      (e) => Array.from(new Uint8Array(e)).map((x) => String.fromCharCode(x)).join(''));
  offset = _cffNameIndex.newOffset;

  const _cffTopDictIndex = parseCffIndex(buffer, offset);

  return {
    header:       cffHeader,
    nameIndex:    _cffNameIndex,
    topDictIndex: _cffTopDictIndex,
  };
}

function parseCffIndex(buffer, offset) {
  const indexCount   = getUint16(buffer, offset);
  const indexOffSize = getOffSize(buffer, offset += 2);
  const indexOffset  = getArray(
      buffer, offset += 1, indexCount + 1, (b, o) => getOffset(b, o, indexOffSize), indexOffSize);
  offset += indexCount * indexOffSize;

  const indexData = [];
  for (let i = 0; i < indexCount;) {
    const begin = offset + indexOffset[i];
    const end   = offset + indexOffset[++i];
    indexData.push(buffer.slice(begin, end));
  }

  return {
    indexData: indexData,
    newOffset: offset + indexOffset[indexCount],
  };
}

function parsePost(buffer) {
  let offset = 0;
  return {
    version:           getFixed(buffer, offset),
    italicAngle:       getFixed(buffer, offset += 4),
    underlinePosition: getFWord(buffer, offset += 4),
    isFixedPitch:      getUint32(buffer, offset += 4),
    minMemType42:      getUint32(buffer, offset += 4),
    maxMemType42:      getUint32(buffer, offset += 4),
    minMemType1:       getUint32(buffer, offset += 4),
    maxMemType1:       getUint32(buffer, offset += 4),
  };
}

function parseMath(buffer) {
  let offset = 0;
  const mathHeader = {
    majorVersion:        getUint16(buffer, offset),
    minorVersion:        getUint16(buffer, offset += 2),
    mathConstantsOffset: getOffset(buffer, offset += 2),
    mathGlyphInfoOffset: getOffset(buffer, offset += 2),
    mathVariantsOffset:  getOffset(buffer, offset += 2),
  };
  return {
    mathConstants: parseMathConstants(buffer, mathHeader.mathConstantsOffset),
    mathGlyphInfo: parseMathGlyphInfo(buffer, mathHeader.mathGlyphInfoOffset),
    mathVariants:  parseMathVariants(buffer, mathHeader.mathVariantsOffset),
  };
}

function parseMathConstants(buffer, mathConstantsOffset) {
  let offset = mathConstantsOffset;
  const _getInt16           = (o) => getInt16(buffer, o);
  const _getUint16          = (o) => getUint16(buffer, o);
  const _getMathValueRecord = (o) => getMathValueRecord(buffer, o);
  return {
    scriptPercentScaleDown:                   _getInt16(offset),
    scriptScriptPercentScaleDown:             _getInt16(offset += 2),
    delimitedSubFormulaMinHeight:             _getUint16(offset += 2),
    displayOperatorMinHeight:                 _getUint16(offset += 2),
    mathLeading:                              _getMathValueRecord(offset += 2), // The last uint16
    axisHeight:                               _getMathValueRecord(offset += 4),
    accentBaseHeight:                         _getMathValueRecord(offset += 4),
    flattenedAccentBaseHeight:                _getMathValueRecord(offset += 4),
    subscriptShiftDown:                       _getMathValueRecord(offset += 4),
    subscriptTopMax:                          _getMathValueRecord(offset += 4),
    subscriptBaselineDropMin:                 _getMathValueRecord(offset += 4),
    superscriptShiftUp:                       _getMathValueRecord(offset += 4),
    superscriptShiftUpCramped:                _getMathValueRecord(offset += 4),
    superscriptBottomMin:                     _getMathValueRecord(offset += 4),
    superscriptBaselineDropMax:               _getMathValueRecord(offset += 4),
    subSuperscriptGapMin:                     _getMathValueRecord(offset += 4),
    superscriptBottomMaxWithSubscript:        _getMathValueRecord(offset += 4),
    spaceAfterScript:                         _getMathValueRecord(offset += 4),
    upperLimitGapMin:                         _getMathValueRecord(offset += 4),
    upperLimitBaselineRiseMin:                _getMathValueRecord(offset += 4),
    lowerLimitGapMin:                         _getMathValueRecord(offset += 4),
    lowerLimitBaselineDropMin:                _getMathValueRecord(offset += 4),
    stackTopShiftUp:                          _getMathValueRecord(offset += 4),
    stackTopDisplayStyleShiftUp:              _getMathValueRecord(offset += 4),
    stackBottomShiftDown:                     _getMathValueRecord(offset += 4),
    stackBottomDisplayStyleShiftDown:         _getMathValueRecord(offset += 4),
    stackGapMin:                              _getMathValueRecord(offset += 4),
    stackDisplayStyleGapMin:                  _getMathValueRecord(offset += 4),
    stretchStackTopShiftUp:                   _getMathValueRecord(offset += 4),
    stretchStackBottomShiftDown:              _getMathValueRecord(offset += 4),
    stretchStackGapAboveMin:                  _getMathValueRecord(offset += 4),
    stretchStackGapBelowMin:                  _getMathValueRecord(offset += 4),
    fractionNumeratorShiftUp:                 _getMathValueRecord(offset += 4),
    fractionNumeratorDisplayStyleShiftUp:     _getMathValueRecord(offset += 4),
    fractionDenominatorShiftDown:             _getMathValueRecord(offset += 4),
    fractionDenominatorDisplayStyleShiftDown: _getMathValueRecord(offset += 4),
    fractionNumeratorGapMin:                  _getMathValueRecord(offset += 4),
    fractionNumDisplayStyleGapMin:            _getMathValueRecord(offset += 4),
    fractionRuleThickness:                    _getMathValueRecord(offset += 4),
    fractionDenominatorGapMin:                _getMathValueRecord(offset += 4),
    fractionDenomDisplayStyleGapMin:          _getMathValueRecord(offset += 4),
    skewedFractionHorizontalGap:              _getMathValueRecord(offset += 4),
    skewedFractionVerticalGap:                _getMathValueRecord(offset += 4),
    overbarVerticalGap:                       _getMathValueRecord(offset += 4),
    overbarRuleThickness:                     _getMathValueRecord(offset += 4),
    overbarExtraAscender:                     _getMathValueRecord(offset += 4),
    underbarVerticalGap:                      _getMathValueRecord(offset += 4),
    underbarRuleThickness:                    _getMathValueRecord(offset += 4),
    underbarExtraDescender:                   _getMathValueRecord(offset += 4),
    radicalVerticalGap:                       _getMathValueRecord(offset += 4),
    radicalDisplayStyleVerticalGap:           _getMathValueRecord(offset += 4),
    radicalRuleThickness:                     _getMathValueRecord(offset += 4),
    radicalExtraAscender:                     _getMathValueRecord(offset += 4),
    radicalKernBeforeDegree:                  _getMathValueRecord(offset += 4),
    radicalKernAfterDegree:                   _getMathValueRecord(offset += 4),
    radicalDegreeBottomRaisePercent:          _getInt16(offset += 4), // The last MathValueRecord
  };
}

function parseMathGlyphInfo(buffer, mathGlyphInfoOffset) {
  let offset = mathGlyphInfoOffset;
  const italicsCorrOffset = mathGlyphInfoOffset + getOffset(buffer, offset);
  const topAccentOffset   = mathGlyphInfoOffset + getOffset(buffer, offset += 2);
  const extendShapeOffset = mathGlyphInfoOffset + getOffset(buffer, offset += 2);
  const mathKernOffset    = mathGlyphInfoOffset + getOffset(buffer, offset += 2);
  const _parseMathGlyphInfo = (_offset, _callback) =>
    (_offset === mathGlyphInfoOffset) ? [] : _callback(buffer, _offset);
  return {
    mathItalicsCorrectionInfo: _parseMathGlyphInfo(italicsCorrOffset, parseItalicsCorr),
    mathTopAccentAttachment:   _parseMathGlyphInfo(topAccentOffset, parseTopAccent),
    extendedShapeCoverage:     _parseMathGlyphInfo(extendShapeOffset, getCoverage),
    mathKernInfo:              _parseMathGlyphInfo(mathKernOffset, parseMathKern),
  };
}

function parseItalicsCorr(buffer, offset) {
  const italicsCorrCoverageOffset = getOffset(buffer, offset);
  const italicsCorrCount          = getUint16(buffer, offset + 2);
  const italicsCorrCoverage       = getCoverage(buffer, offset + italicsCorrCoverageOffset);
  if (italicsCorrCoverage.length == italicsCorrCount) {
    const italicsCorr = getArray(buffer, offset += 4, italicsCorrCount, getMathValueRecord, 4);
    return italicsCorrCoverage.map((gid, i) => ({glyphID: gid, italicsCorr: italicsCorr[i]}));
  } else {
    throw new Error('Invalid MathItalicsCorrectionInfo Table');
  }
}

function parseTopAccent(buffer, offset) {
  const topAccentCoverageOffset = getOffset(buffer, offset);
  const topAccentCount          = getUint16(buffer, offset + 2);
  const topAccentCoverage       = getCoverage(buffer, offset + topAccentCoverageOffset);
  if (topAccentCoverage.length == topAccentCount) {
    const topAccent = getArray(buffer, offset += 4, topAccentCount, getMathValueRecord, 4);
    return topAccentCoverage.map((gid, i) => ({glyphID: gid, topAccent: topAccent[i]}));
  } else {
    throw new Error('Invalid MathTopAccentAttachment Table');
  }
}

function parseMathKern(buffer, offset) {
  const mathKernInfoOffset     = offset;
  const mathKernCoverageOffset = getOffset(buffer, offset);
  const mathKernCount          = getUint16(buffer, offset + 2);
  const mathKernCoverage       = getCoverage(buffer, offset + mathKernCoverageOffset);

  if (mathKernCoverage.length == mathKernCount) {
    const mathKernInfoRecords = getArray(
        buffer, offset += 4, mathKernCount, getMathKernInfoRecord, 8);
    const mathKernValuesOffsets = new Set(mathKernInfoRecords.map((e) => Object.values(e)).flat());
    const mathKernValuesCount = mathKernValuesOffsets.size - (mathKernValuesOffsets.has(0) ? 1 : 0);

    offset += mathKernCount * 8;
    const mathKernValues = {};
    for (let i = 0; i < mathKernValuesCount; i++) {
      const _offset = offset - mathKernInfoOffset;
      const heightCount = getUint16(buffer, offset);
      mathKernValues[_offset] = {
        correctionHeight: getArray(buffer, offset += 2, heightCount, getMathValueRecord, 4),
        kernValues:       getArray(
            buffer, offset += heightCount * 4, heightCount + 1, getMathValueRecord, 4),
      };
      offset += heightCount * 4 + 4;
    };

    return mathKernInfoRecords.map((record, i) => ({
      glyphID:    mathKernCoverage[i],
      trMathKern: mathKernValues[record.trMathKernOffset],
      tlMathKern: mathKernValues[record.tlMathKernOffset],
      brMathKern: mathKernValues[record.brMathKernOffset],
      blMathKern: mathKernValues[record.blMathKernOffset],
    }));
  } else {
    throw new Error('Invalid MathKernInfo Table');
  }
}

function parseMathVariants(buffer, mathVariantsOffset) {
  let offset = mathVariantsOffset;
  const minConnectorOverlap     = getUint16(buffer, offset);
  const vertGlyphCoverageOffset = getOffset(buffer, offset += 2);
  const horiGlyphCoverageOffset = getOffset(buffer, offset += 2);
  const vertGlyphCount          = getUint16(buffer, offset += 2);
  const horiGlyphCount          = getUint16(buffer, offset += 2);
  const vertConstructionOffsets = getArray(
      buffer, offset += 2, vertGlyphCount, getOffset, 2);
  const horiConstructionOffsets = getArray(
      buffer, offset += 2 * vertGlyphCount, horiGlyphCount, getOffset, 2);

  const vertGlyphCoverage = getCoverage(
      buffer, mathVariantsOffset + vertGlyphCoverageOffset);
  const horiGlyphCoverage = getCoverage(
      buffer, mathVariantsOffset + horiGlyphCoverageOffset);
  const vertConstruction = vertConstructionOffsets.map(
      (o) => parseGlyphConstruction(buffer, mathVariantsOffset + o));
  const horiConstruction = horiConstructionOffsets.map(
      (o) => parseGlyphConstruction(buffer, mathVariantsOffset + o));

  const _getResult = (_count, _coverage, _construction) => {
    const _glyphVariants = [];
    const _glyphAssembly = [];
    for (let i = 0; i < _count; i++) {
      if (_construction[i].glyphVariants.length) {
        _glyphVariants.push({glyphID: _coverage[i], variant: _construction[i].glyphVariants});
      }
      if (Object.keys(_construction[i].glyphAssembly).length) {
        _glyphAssembly.push({glyphID: _coverage[i], variant: _construction[i].glyphAssembly});
      }
    }
    return {glyphVariants: _glyphVariants, glyphAssembly: _glyphAssembly};
  };
  const vertResult = _getResult(vertGlyphCount, vertGlyphCoverage, vertConstruction);
  const horiResult = _getResult(horiGlyphCount, horiGlyphCoverage, horiConstruction);

  return {
    minConnectorOverlap: minConnectorOverlap,
    vertGlyphVariants:   vertResult.glyphVariants,
    horiGlyphVariants:   horiResult.glyphVariants,
    vertGlyphAssembly:   vertResult.glyphAssembly,
    horiGlyphAssembly:   horiResult.glyphAssembly,
  };
}

function parseGlyphConstruction(buffer, offset) {
  let glyphConstructionOffset = offset;
  const glyphAssemblyOffset = getOffset(buffer, glyphConstructionOffset);
  const variantCount        = getUint16(buffer, glyphConstructionOffset += 2);
  const glyphVariants       = getArray(
      buffer, glyphConstructionOffset += 2, variantCount, getMathGlyphVariantRecord, 4);
  if (glyphAssemblyOffset === 0) {
    return {glyphVariants: glyphVariants, glyphAssembly: {}};
  } else {
    const glyphAssembly = parseGlyphAssembly(buffer, offset + glyphAssemblyOffset);
    return {glyphVariants: glyphVariants, glyphAssembly: glyphAssembly};
  }
}

function parseGlyphAssembly(buffer, offset) {
  const italicsCorr = getMathValueRecord(buffer, offset);
  const partCount   = getUint16(buffer, offset += 4);
  const partRecords = getArray(buffer, offset += 2, partCount, getGlyphPartRecord, 10);
  return {italicsCorr: italicsCorr, partRecords: partRecords};
}
