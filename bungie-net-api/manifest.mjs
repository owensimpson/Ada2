import { Manifest } from 'oodestiny';
import { client } from './main.mjs';

const cache = {}

/**
 * Clears the cache
 * @return void
 */
function clearManifestCache() {
    console.log('Manifest cache cleared')
    for (let prop in cache){
        if (cache.hasOwnProperty(prop)){
            delete cache[prop];
        }
    }
}

/**
 * Get the destiny manifest from cache or fetch it
 * @param {boolean} force force a fetch
 * @returns 
 */
async function destinyManifest(force) {
    console.log('Fetching Destiny 2 Manifest');
    cache.manifest =
        cache.manifest && !force ? cache.manifest : await (() => {
            setTimeout(clearManifestCache, 60 * 60000);
            return client.Destiny2.GetDestinyManifest().then(r => r.Response);
        })();
    return cache.manifest;
}

/**
 * Gets the DestinyInventoryItemDefinitions in english
 * @param {boolean} force force a fetch
 * @return {Promise<{[p: number]: DestinyInventoryItemDefinition}>}
 */
export async function getDestinyInventoryItemDefinitions(force) {
    cache.DestinyInventoryItemDefinition =
        cache.DestinyInventoryItemDefinition && !force ? cache.DestinyInventoryItemDefinition
            : Manifest.getDestinyManifestComponent({
                destinyManifest: await destinyManifest(force),
                tableName: Manifest.Components.DestinyInventoryItemDefinition,
                language: 'en'
            });
    return cache.DestinyInventoryItemDefinition;
}

/**
 * Get a manifest definition for a specifc hash
 * @template T
 * @param {T} definition
 * @param {number | string} hash
 * @return {Promise<DestinyDefinitionFrom<T>>}
 */
export async function getDefinition(definition, hash) {
    return client.Destiny2.GetDestinyEntityDefinition({
        entityType: definition,
        hashIdentifier: hash
    }).then(r => r.Response);
}