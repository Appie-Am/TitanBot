import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setupvouch')
    .setDescription('Plaats het uitlegbericht voor het vouch systeem')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Stickied Message:')
      .setColor('#2B2D31')
      .setDescription(
        '# Vouch System\n\n' +
        '`/vouch (person) (rating 1-5) (product) (review)`\n\n' +
        '**Note:** Als je geen review achterlaat heb je geen garantie, ' +
        'tenzij ergens anders vermeld staat dat het product geen garantie heeft.'
      );

    await interaction.channel.send({ embeds: [embed] });
    await interaction.reply({ content: '✅ Vouch uitleg geplaatst!', ephemeral: true });
  },
};
