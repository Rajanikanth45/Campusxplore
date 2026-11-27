import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from './tokenStorage.js';

test('tokenStorage manages in-memory access token cleanly', () => {
  clearAccessToken();
  assert.equal(getAccessToken(), null);

  setAccessToken('jwt-sample-token-123');
  assert.equal(getAccessToken(), 'jwt-sample-token-123');

  clearAccessToken();
  assert.equal(getAccessToken(), null);
});
