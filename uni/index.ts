/**
 * Combines an emoji with U+FE0E variation selector to force text-style rendering
 * @param {string} emoji - The emoji to modify
 * @returns {string} The emoji with text-style rendering
 */
function forceTextStyleEmoji(emoji) {
    const VARIATION_SELECTOR_15 = '\uFE0E'; // Forces text-style rendering
    return emoji + VARIATION_SELECTOR_15;
}

// Test with different emoji
const emojis = ['🫠', '😊', '❤️', '🔒'];

console.log('Testing text-style rendering:');
emojis.forEach(emoji => {
    const textStyle = forceTextStyleEmoji(emoji);
    console.log(`Original: ${emoji} (${emoji.codePointAt(0).toString(16)})`);
    console.log(`Text-style: ${textStyle} (${textStyle.codePointAt(0).toString(16)} ${textStyle.codePointAt(1)?.toString(16)})`);
    console.log('---');
});