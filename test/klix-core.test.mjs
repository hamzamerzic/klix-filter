import assert from 'node:assert/strict'
import test from 'node:test'

import {
  BoundedCache,
  decodeJsonString,
  findBlockedKeyword,
  isKlixHostedAsset,
  normalizeStoredState,
  normalizeText,
} from '../klix-core.js'

test('keyword filters match whole words and phrases rather than substrings', () => {
  const article = {
    title: 'Povratak reprezentacije poslije rata',
    category: 'Sport',
    lead: '',
    bodyText: '',
  }

  assert.equal(findBlockedKeyword(article, ['rat']), '')
  assert.equal(findBlockedKeyword({ ...article, title: 'Rat je završen' }, ['rat']), 'rat')
  assert.equal(findBlockedKeyword(article, ['poslije rata']), 'poslije rata')
})

test('normalization keeps Bosnian input comparable and stored state predictable', () => {
  assert.equal(normalizeText('  ČETIRI  ĐAKA '), 'cetiri djaka')
  assert.deepEqual(normalizeStoredState({
    keywords: [' Rat ', 'rat', '', 7, 'Četiri'],
    activeTab: 'latest',
  }), {
    keywords: ['Rat', 'Četiri'],
    activeTab: 'latest',
  })
  assert.equal(normalizeStoredState({ activeTab: 'unknown' }).activeTab, 'popular')
})

test('gallery JSON strings decode escaped URLs', () => {
  assert.equal(
    decodeJsonString('https:\\/\\/example.test\\/image.jpg'),
    'https://example.test/image.jpg',
  )
})

test('Klix-hosted images use the authenticated proxy path', () => {
  assert.equal(isKlixHostedAsset('https://static.klix.ba/media/image.jpg'), true)
  assert.equal(isKlixHostedAsset('https://www.klix.ba/media/image.jpg'), true)
  assert.equal(isKlixHostedAsset('https://klix.ba/media/image.jpg'), true)
  assert.equal(isKlixHostedAsset('https://notklix.ba/media/image.jpg'), false)
  assert.equal(isKlixHostedAsset('not a URL'), false)
})

test('bounded cache evicts the least recently used entry', () => {
  const cache = new BoundedCache(2)
  cache.set('first', 1).set('second', 2)
  assert.equal(cache.get('first'), 1)
  cache.set('third', 3)

  assert.equal(cache.get('second'), undefined)
  assert.equal(cache.get('first'), 1)
  assert.equal(cache.get('third'), 3)
  assert.equal(cache.size, 2)
})
