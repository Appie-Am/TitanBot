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
    await interaction.deferReply({ ephemeral: true });

    const person = interaction.options.getUser('person');
    const ratingCount = interaction.options.getInteger('rating');
    const product = interaction.options.getString('product');
    const review = interaction.options.getString('review');

    // Zet het aantal sterren om naar emoji's (bijv. 5 -> ⭐⭐⭐⭐⭐)
    const starEmojis = '⭐'.repeat(ratingCount);

    // Zoek het reviews kanaal op
    const reviewChannel = interaction.guild.channels.cache.find(
      channel => channel.name.includes('reviews') || channel.name.includes('💌')
    ) || interaction.channel;

    // 1. Maak de review embed
    const reviewEmbed = new EmbedBuilder()
      .setTitle('✅ A&M Watches Vouch')
      .setColor('#57F287')
      .addFields(
        { name: '👤 Person', value: `${person}`, inline: false },
        { name: '⭐ Rating', value: starEmojis, inline: false },
        { name: '📦 Product', value: `\`${product}\``, inline: false },
        { name: '💬 Review', value: `> ${review}`, inline: false }
      )
      .setFooter({ 
        text: `A&M Watches | Geplaatst door ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();

    // 2. Maak het Sticky Informatie Bericht
    const stickyEmbed = new EmbedBuilder()
      .setTitle('📌 Vouch System')
      .setColor('#2B2D31')
      .setDescription(
        'Gebruik het onderstaande commando om een review achter te laten:\n' +
        '```/vouch person:@lid rating:1-5 product:naam review:bericht```\n' +
        '⚠️ **Let op:** Als je geen review achterlaat heb je **geen garantie**, ' +
        'tenzij expliciet anders vermeld.'
      )
      .setFooter({ text: 'A&M Watches | Klantenservice' });

    try {
      // Verwijder het vorige sticky bericht als dat er al stond (voorkomt dubbele berichten)
      const recentMessages = await reviewChannel.messages.fetch({ limit: 10 });
      const lastSticky = recentMessages.find(
        m => m.author.id === interaction.client.user.id && m.embeds[0]?.title === '📌 Vouch System'
      );
      if (lastSticky) {
        await lastSticky.delete().catch(() => {});
      }

      // Stuur eerst de review en daarna direct de nieuwe sticky eronder
      await reviewChannel.send({ embeds: [reviewEmbed] });
      await reviewChannel.send({ embeds: [stickyEmbed] });

      await interaction.editReply({ 
        content: `✅ Je review is succesvol geplaatst in ${reviewChannel}!` 
      });
    } catch (error) {
      console.error('Fout bij het plaatsen van vouch:', error);
      await interaction.editReply({ content: '❌ Er is een fout opgetreden bij het plaatsen van de review.' });
    }
  },
};
