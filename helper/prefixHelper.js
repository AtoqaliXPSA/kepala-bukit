/**
 * Dapatkan prefix bot dari .env atau fallback
 * @returns {string}
 */
function getPrefix() {
  return process.env.PREFIX || '!';
}

module.exports = { getPrefix };