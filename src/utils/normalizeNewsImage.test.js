import test from 'node:test'
import assert from 'node:assert/strict'

import { calculateCoverDimensions } from './normalizeNewsImage.js'

test('calculateCoverDimensions crops a wide image to 1600x900 without distortion', () => {
  const dimensions = calculateCoverDimensions(2400, 1200)

  assert.deepEqual(dimensions, {
    drawWidth: 2133.333333333333,
    drawHeight: 1200,
    offsetX: 133.33333333333348,
    offsetY: 0,
    canvasWidth: 1600,
    canvasHeight: 900,
  })
})

test('calculateCoverDimensions crops a tall image to 1600x900 without distortion', () => {
  const dimensions = calculateCoverDimensions(900, 1800)

  assert.deepEqual(dimensions, {
    drawWidth: 900,
    drawHeight: 506.25,
    offsetX: 0,
    offsetY: 646.875,
    canvasWidth: 1600,
    canvasHeight: 900,
  })
})
