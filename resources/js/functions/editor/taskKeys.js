/**
 * Helpers for spotting task keys (e.g. `ABC-12`) inside stored TipTap JSON.
 *
 * The set of valid prefixes comes from the organization's project keys
 * (`useTextToLinkStore`), so only real projects the user can see are matched.
 * Document keys (`ABC-D-12`) are deliberately excluded — the `\d` right after
 * the dash never matches the `D-` form.
 */

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const buildTaskKeyPattern = (keys) => {
    if (!keys?.length) return null
    const alternatives = keys.map(escapeRegExp).join('|')

    return new RegExp(`\\b(?:${alternatives})-\\d+\\b`, 'g')
}

/**
 * Collect the plain text of a TipTap document, skipping code blocks so that
 * keys mentioned inside a snippet are left alone.
 */
const collectText = (node, out) => {
    if (!node || node.type === 'codeBlock') return
    if (node.type === 'text' && node.text) out.push(node.text)
    if (Array.isArray(node.content)) node.content.forEach((child) => collectText(child, out))
}

/**
 * Unique task keys referenced by a TipTap document, in the order they appear.
 */
export const extractTaskKeys = (json, pattern) => {
    if (!json || !pattern) return []

    const parts = []
    collectText(json, parts)
    if (!parts.length) return []

    const found = []
    const text = parts.join('\n')
    pattern.lastIndex = 0

    let match
    while ((match = pattern.exec(text)) !== null) {
        if (!found.includes(match[0])) found.push(match[0])
    }

    return found
}
