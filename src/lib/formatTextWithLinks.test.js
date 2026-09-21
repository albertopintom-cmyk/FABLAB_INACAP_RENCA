import test from 'node:test'
import assert from 'node:assert/strict'

import { detectUrls, renderTextWithLinks } from './formatTextWithLinks.js'

test('detectUrls detects http, https and www links', () => {
  const urls = detectUrls('Más información en https://fablab.inacap.cl y http://example.com y www.example.com')

  assert.deepEqual(urls, [
    'https://fablab.inacap.cl',
    'http://example.com',
    'www.example.com',
  ])
})

test('renderTextWithLinks keeps plain text around urls and adds anchors', () => {
  const nodes = renderTextWithLinks('Más información en https://fablab.inacap.cl y www.example.com')
  const links = nodes.filter((node) => typeof node !== 'string' && node.props?.href)

  assert.equal(links.length, 2)
  assert.equal(links[0].props.href, 'https://fablab.inacap.cl')
  assert.equal(links[0].props.target, '_blank')
  assert.equal(links[0].props.rel, 'noopener noreferrer')
  assert.equal(links[1].props.href, 'https://www.example.com')
})
