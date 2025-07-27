module.exports = function clearCache(targetDir = '') {
  for (const key of Object.keys(require.cache)) {
    if (targetDir && !key.includes(targetDir)) continue;
    delete require.cache[key];
  }
  console.log(`[CLEAR] Cache for ${targetDir || 'ALL'}`);
};