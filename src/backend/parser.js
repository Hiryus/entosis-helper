import levenshtein from 'fast-levenshtein';
import Log from './log.js';
import ALL_SYSTEMS from './systems.list.js';

// Regular expressions for parsing
const STATUS_REG = '((?:new)|(?:friendly)|(?:allied)|(?:enemy)|(?:opponent)|(?:neutral)|(?:unknown)|(?:no view))';
const SYSTEM_REG = '([a-z0-9-]+)';
const NODE_REG = '([a-z][0-9]{2})';
const TIME_REG = '((?:warm)|(?:warmup)|(?:vanished)|(?:done)|(?:none)|(?:disappeared)|(?:[0-9]+.[0-9]+))';
const MSG_REG_EXP = new RegExp(SYSTEM_REG + '\\s?/\\s?' + NODE_REG + '\\s?/\\s?' + STATUS_REG + '(?:\\s?/\\s?' + TIME_REG + ')?', 'i');
const META_REG_EXP = /\[\s*([0-9]+).([0-9]+).([0-9]+)\s*([0-9]+):([0-9]+):([0-9]+)\s*\]\s*([^>]+)\s*>/i;

/**
 * @param {String} str
 */
function clean(str) {
    // Remove tags
    str = str.replace(/<\/?[^>]+(>|$)/g, '');
    // Remove symbols and other incorrect caracters
    str = str.replace(/[^a-z0-9:/\s-]/ig, '')
    // Remove extra spaces
    return str.replace(/ {2,}/g, ' ').trim();
}

/**
 * @param {String} line
 */
export function parse(line) {
    // Parse log metadata
    const { date, character } = parseMetadata(line) || {};
    if (!(date instanceof Date)) return null;
    // Parse message data
    const { system, node, state, minutes, seconds } = parseMessage(line) || {};
    if (typeof system !== 'string' || typeof state !== 'string') return null;
    // Compute timer expiration
    const expiration = (minutes == null || seconds == null)
        ? date.getTime() + 5 * 60 * 1000 // max warmup = 5 min
        : date.getTime() + (minutes * 60 * 1000) + (seconds * 1000);
    return new Log(character, date, new Date(expiration), node, state, system);
}

/**
 * @param {String} line
 */
export function parseMetadata(line) {
    // Parse metadata - ex: [ 2025.07.09 11:38:41 ] Lyss Aelys >
    const metaPatterns = line.match(META_REG_EXP);
    if(metaPatterns === null || metaPatterns.length < 7) return null; // Nothing recognized
    // Parse date - ex: 2025.07.09
    const date = new Date();
    date.setUTCFullYear(metaPatterns[1]);
    date.setUTCMonth(metaPatterns[2] - 1); // starts at 0 :(
    date.setUTCDate(metaPatterns[3]); // starts at 1 ¯\_(ツ)_/¯
    // Parse time - ex: 11:38:41
    date.setUTCHours(metaPatterns[4]);
    date.setUTCMinutes(metaPatterns[5]);
    date.setUTCSeconds(metaPatterns[6]);
    // Return results
    const character = metaPatterns[7].trim();
    return { date, character };
}

/**
 * @param {String} line
 */
export function parseMessage(line) {
    // Remove extra spaces, special characters, etc. in order to avoid typos
    const log = clean(line);
    // Parse message - ex: DO6-HQ / D66 / friendly / 55:00
    const logPatterns = log.match(MSG_REG_EXP);
    if(logPatterns === null || logPatterns.length < 4) return null; // nothing recognized
    if(log.match(/EVE System Channel MOTD/i)) return null; // don't parse MOTD
    // Parse system
    const system = parseSystemName(logPatterns[1].trim());
    if (system == null) return null; // system not recognized
    // Parse node
    const node = logPatterns[2].trim();
    // Parse state
    const state = logPatterns[3].match(/((?:friendly)|(?:allied))/i) ? 'friendly'
        : logPatterns[3].match(/((?:enemy)|(?:opponent))/i) ? 'enemy'
        : 'neutral';
    // Parse time
    if (logPatterns[4].match(/(?:vanished)|(?:done)|(?:none)|(?:disappeared)/i)) {
        return { system, node, state, minutes: 0, seconds: 0 };
    }
    const timePatterns = logPatterns[4].match(/([0-9]+).([0-9]+)/i);
    if(timePatterns == null) {
        return { system, node, state };
    }
    const minutes = parseInt(timePatterns[1]);
    const seconds = parseInt(timePatterns[2]);
    return { system, node, state, minutes, seconds };
}

/**
 * @param {String} name
 */
export function parseSystemName(name) {
    const system = name.toUpperCase();
    const systemWithoutDash = system.replace('-', '');
    // 1. Look for exact match
    if(ALL_SYSTEMS.indexOf(system) != -1) return system;
    // 2. Look for match without dashes
    let match = ALL_SYSTEMS.find((name) => systemWithoutDash == name.replace('-', ''));
    if(match) return match;
    // 3. Look for partial match
    match = ALL_SYSTEMS.find((name) => systemWithoutDash.substring(0, name.length) == name);
    if(match) return match;
    // 4. Look for closest levenshtein match
    const map = ALL_SYSTEMS.map((name) => ({
        distance: levenshtein.get(system, name),
        name: name,
    })).sort((a, b) => a.distance - b.distance);
    if(map[0].distance <= 1) return map[0].name;
    // Still not found ? Return null
    return null;
}
