import { handleShopTicketEvents } from './shopTicketHandler.js';
import { logger } from '../utils/logger.js';

export default {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      // 1. Afhandeling van de Shop / Ticket knoppen en selectiemenu's
      if (interaction.isButton() || interaction.isStringSelectMenu()) {
        await handleShopTicketEvents(interaction);
        return;
      }

      // 2. Afhandeling van Slash Commands
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
          logger.warn(`Geen commando gevonden voor ${interaction.commandName}`);
          return;
        }

        await command.execute(interaction);
      }
    } catch (error) {
      logger.error('Fout bij het verwerken van interactionCreate:', error);

      const errorMessage = {
        content: '❌ Er is een fout opgetreden bij het uitvoeren van deze actie.',
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorMessage).catch(() => {});
      } else {
        await interaction.reply(errorMessage).catch(() => {});
      }
    }
  },
};
