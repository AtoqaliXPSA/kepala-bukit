const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Auto-load semua event dari folder events
 * @param {Client} client
 */
function loadEvents(client) {
  const eventsPath = path.join(__dirname, '../events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  const eventsList = [];

  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));

    if (!event.name || typeof event.execute !== 'function') {
      console.warn(chalk.yellow(`[SKIP] Event invalid: ${file}`));
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }

    eventsList.push(`${event.name}${event.once ? ' (once)' : ''}`);
  }
  console.log('=======================================');
  console.log(chalk.cyan(`[EVENTS LOADED]`));
  console.log(eventsList.join('\n'));
  console.log('=======================================');
}

module.exports = { loadEvents };