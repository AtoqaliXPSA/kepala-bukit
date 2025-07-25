function getPrefix() {
  return process.env.PREFIX || '!';
}

module.exports = { getPrefix };