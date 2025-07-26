/**
 * replyHelper.js
 * Utility untuk handle reply dan edit dengan automatik
 */

module.exports = {
  /**
   * Balas mesej atau interaction
   * @param {Object} ctx - message atau interaction
   * @param {Object} options - content, embeds, components dll.
   */
  async send(ctx, options) {
    try {
      if (ctx.reply) {
        // Untuk interaction (slash commands)
        if (ctx.deferred || ctx.replied) {
          return await ctx.editReply(options);
        } else {
          return await ctx.reply(options);
        }
      } else if (ctx.channel?.send) {
        // Untuk message command
        return await ctx.channel.send(options);
      } else {
        throw new Error('Context tidak valid untuk send.');
      }
    } catch (err) {
      console.error('[REPLY_HELPER_SEND_ERROR]', err);
      throw err;
    }
  },

  /**
   * Edit balasan
   * @param {Object} ctx - message atau interaction
   * @param {Object} options - content, embeds, components dll.
   */
  async edit(ctx, options) {
    try {
      if (ctx.editReply) {
        return await ctx.editReply(options);
      } else if (ctx.edit) {
        return await ctx.edit(options);
      } else {
        throw new Error('Context tidak valid untuk edit.');
      }
    } catch (err) {
      console.error('[REPLY_HELPER_EDIT_ERROR]', err);
      throw err;
    }
  },

  /**
   * Balas ephemeral (hanya untuk interaction)
   */
  async ephemeral(ctx, content) {
    try {
      if (ctx.reply) {
        return await ctx.reply({ content, ephemeral: true });
      }
    } catch (err) {
      console.error('[REPLY_HELPER_EPHEMERAL_ERROR]', err);
      throw err;
    }
  }
};