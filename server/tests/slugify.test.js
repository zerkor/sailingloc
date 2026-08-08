const test = require('node:test');
const assert = require('node:assert/strict');
const slugify = require('../src/utils/slugify');

test('slugify removes accents and special characters', () => {
  assert.equal(slugify('Hanse 455 à Marseille'), 'hanse-455-marseille');
  assert.equal(slugify('Évasion Bleue'), 'evasion-bleue');
  assert.equal(slugify('Bateau moteur – Nice !'), 'bateau-moteur-nice');
});

test('slugify trims duplicated hyphens', () => {
  assert.equal(slugify('  Lagoon   42 --- Nice  '), 'lagoon-42-nice');
});
