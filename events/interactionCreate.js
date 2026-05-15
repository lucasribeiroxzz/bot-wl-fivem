module.exports = {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);
        return;
      }

      if (interaction.isButton()) {
        const button = client.buttons.get(interaction.customId);
        if (button) {
          await button.execute(interaction, client);
          return;
        }

        if (interaction.customId.startsWith('wl_approve_') || interaction.customId.startsWith('wl_reject_')) {
          const reviewButton = client.buttons.get('wl_review');
          if (reviewButton) await reviewButton.execute(interaction, client);
          return;
        }
        return;
      }

      if (interaction.isModalSubmit()) {
        const modalId = interaction.customId.startsWith('wl_code_modal') ? 'wl_code_modal' : interaction.customId;
        const modal = client.modals.get(modalId);
        if (!modal) return;
        await modal.execute(interaction, client);
        return;
      }
    } catch (err) {
      console.error('[INTERACTION ERROR]', err);
      const reply = { content: 'Ocorreu um erro ao processar essa interação.', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  }
};
