import { createElement } from 'react'

const URL_PATTERN = /(https?:\/\/[^\s<>'")]+|www\.[^\s<>'")]+)/gi

export function detectUrls(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return []
  }

  const matches = []
  const pattern = new RegExp(URL_PATTERN)

  let match
  while ((match = pattern.exec(text)) !== null) {
    const url = match[0].replace(/[.,!?;:)](?:\s+)?$/g, '')
    if (url) {
      matches.push(url)
    }
  }

  return matches
}

export function renderTextWithLinks(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return text
  }

  const matches = detectUrls(text)

  if (matches.length === 0) {
    return text
  }

  const parts = []
  let lastIndex = 0

  for (const url of matches) {
    const index = text.indexOf(url, lastIndex)

    if (index === -1) {
      continue
    }

    if (index > lastIndex) {
      const before = text.slice(lastIndex, index)
      if (before) {
        parts.push(before)
      }
    }

    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
    parts.push(
      createElement(
        'a',
        {
          key: `${url}-${index}`,
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        url,
      ),
    )

    lastIndex = index + url.length
  }

  if (lastIndex < text.length) {
    const tail = text.slice(lastIndex)
    if (tail) {
      parts.push(tail)
    }
  }

  return parts.length === 1 ? parts[0] : parts
}
