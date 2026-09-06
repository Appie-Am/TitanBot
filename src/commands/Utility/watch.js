import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('watch')
    .setDescription('Bekijk de prijslijst en informatie over de horloges'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Pricelist | A&M Watches ⌚')
      .setColor('#00FF00') // Groene rand zoals op het voorbeeld
      .setDescription(
        '**Horloges Prijslijst**\n\n' +
        '• **Or Royal** — €44,99\n' +
        '• **Duo Argent** — €42,99\n' +
        '• **Noir Absolu** — €42,99\n' +
        '• **Acier Pur** — €37,99\n' +
        '• **Petrol Steel** — €32,99\n' +
        '• **Petrol Duo** — €42,99\n' +
        '• **Duo Noir** — €44,99\n' +
        '• **Vert Acier** — €39,99\n' +
        '• **Vert Duo** — €42,99\n\n' +
        '📸 Bekijk de foto’s van alle horloges in <#・⌚︱watches>!'
      )
      .setFooter({
        text: 'A&M Watches | Shop',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
