import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockStore = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => mockStore.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      mockStore.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      mockStore.delete(key);
    }),
  },
}));

import { universalStorage } from './storage';

describe('Mobile universalStorage Adapter', () => {
  beforeEach(async () => {
    mockStore.clear();
  });

  it('setItem and getItem should store and retrieve values', async () => {
    await universalStorage.setItem('test_key', 'test_value');
    const value = await universalStorage.getItem('test_key');
    expect(value).toBe('test_value');
  });

  it('removeItem should clear stored key', async () => {
    await universalStorage.setItem('key_to_delete', 'value123');
    await universalStorage.removeItem('key_to_delete');
    const value = await universalStorage.getItem('key_to_delete');
    expect(value).toBeNull();
  });

  it('getItem returns null for non-existent keys', async () => {
    const value = await universalStorage.getItem('non_existent_key_xyz');
    expect(value).toBeNull();
  });
});
