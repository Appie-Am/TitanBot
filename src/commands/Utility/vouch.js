import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('vouch')
    .setDescription('Plaats een review/vouch voor A&M Watches')
    .addUserOption(option =>
      option.setName('person')
        .setDescription('De verkoper/medewerker die je geholpen heeft')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('rating')
        .setDescription('Aantal sterren (1 t/m 5)')
        .setMinValue(1)
        .setMaxValue(5)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('product')
        .setDescription('Het gekochte product')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('review')
        .setDescription('Je ervaring / review')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    const person = interaction.options.getUser('person');
    const ratingCount = interaction.options.getInteger('rating');
    const product = interaction.options.getString('product');
    const review = interaction.options.getString('review');

    // Zet het aantal sterren om naar emoji's (bijv. 5 -> ⭐⭐⭐⭐⭐)
    const stars = '⭐'.repeat(ratingCount);

    // Zoek het reviews kanaal op
    const reviewChannel = interaction.guild.channels.cache.find(
      channel => channel.name.includes('reviews') || channel.name.includes('💌')
    );

    const embed = new EmbedBuilder()
      .setTitle('✅ A&M Watches Vouch')
      .setColor('#00FF00')
      .setDescription(
        `👤 **Person**\n${person}\n\n` +
        `⭐ **Rating**\n${stars}\n\n` +
        `📦 **Product**\n${product}\n\n` +
        `💬 **Review**\n${review}`
      )
      .setFooter({ 
        text: `A&M Watches | Geplaatst door ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    if (reviewChannel) {
      await reviewChannel.send({ embeds: [embed] });
      await interaction.editReply({ 
        content: `✅ Je review is succesvol geplaatst in ${reviewChannel}!` 
      });
    } else {
      // Als het specifieke kanaal niet is gevonden, stuur het in het huidige kanaal
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
