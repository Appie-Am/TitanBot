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
    const rating = interaction.options.getInteger('rating');
    const product = interaction.options.getString('product');
    const review = interaction.options.getString('review');

    // Genereer sterren en een visuele ratingbalk
    const stars = '⭐'.repeat(rating);
    const scoreBar = '🟩'.repeat(rating) + '⬜'.repeat(5 - rating);
    const vouchId = Math.floor(1000 + Math.random() * 9000); // Uniek Vouch ID (#1234)

    // Bepaal het review kanaal
    const reviewChannel = interaction.guild.channels.cache.find(
      c => c.name.includes('reviews') || c.name.includes('💌')
    ) || interaction.channel;

    // 1. Luxe Review Embed
    const reviewEmbed = new EmbedBuilder()
      .setAuthor({ 
        name: `${interaction.user.username} heeft een review geplaatst!`, 
        iconURL: interaction.user.displayAvatarURL({ dynamic: true }) 
      })
      .setTitle(`✨ A&M Watches Vouch #${vouchId}`)
      .setColor('#2F3136')
      .addFields(
        { 
          name: '👤 Medewerker', 
          value: `> ${person}`, 
          inline: true 
        },
        { 
          name: '📦 Product', 
          value: `> \`${product}\``, 
          inline: true 
        },
        { 
          name: '⭐ Beoordeling', 
          value: `> ${stars} **(${rating}/5)**\n>${scoreBar}`, 
          inline: false 
        },
        { 
          name: '💬 Ervaring', 
          value: ````${review}
