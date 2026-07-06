import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

/**
 * getCollection() logs a noisy "collection does not exist or is empty" message
 * for our intentionally-empty held collections. This wrapper swallows that for
 * the empty case and returns [] — held sections ship empty by design.
 */
export async function safeCollection<C extends CollectionKey>(
  collection: C,
  filter?: (entry: CollectionEntry<C>) => boolean
): Promise<CollectionEntry<C>[]> {
  try {
    const entries = await getCollection(collection);
    if (!entries || entries.length === 0) return [];
    return filter ? entries.filter(filter) : entries;
  } catch {
    return [];
  }
}
