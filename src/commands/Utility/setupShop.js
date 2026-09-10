import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionFlagsBits 
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setupshop')
    .setDescription('Plaats het A&M Watches aankoop paneel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName('categorie')
        .setDescription('De categorie waar de nieuwe aankoop tickets in moeten komen')
        .setRequired(true)
    ),

  async execute(interaction) {
    const categoryChannel = interaction.options.getChannel('categorie');

    if (categoryChannel.type !== 4) { // 4 = GuildCategory
      return interaction.reply({ 
        content: '❌ Selecteer een geldige categorie (geen tekstkanaal).', 
        ephemeral: true 
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🛒 A&M Watches | Aankoop Station')
      .setColor('#2F3136')
      .setDescription(
        'Wil je een horloge of product aanschaffen? Klik op de knop hieronder om een aankoopticket te openen.\n\n' +
        '**Wat kun je verwachten?**\n' +
        '• Direct product & betaalmethode selecteren\n' +
        '• Snelle afhandeling door ons team\n' +
        '• Veilige en overzichtelijke afhandeling'
      )
      .setFooter({ text: 'A&M Watches | Kopen', iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    const buyButton = new ButtonBuilder()
      .setCustomId(`buy_ticket_${categoryChannel.id}`)
      .setLabel('Horloge Kopen')
      .setEmoji('⌚')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(buyButton);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Aankoop paneel succesvol geplaatst!', ephemeral: true });
  },
};
