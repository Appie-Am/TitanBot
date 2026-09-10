import { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionFlagsBits, 
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setupshop')
    .setDescription('Plaats het A&M Watches aankoop paneel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName('categorie')
        .setDescription('De categorie voor nieuwe aankooptickets')
        .setRequired(true)
    ),

  async execute(interaction) {
    const categoryChannel = interaction.options.getChannel('categorie');

    if (categoryChannel.type !== ChannelType.GuildCategory) {
      return interaction.reply({ 
        content: '❌ Selecteer een geldige categorie (geen tekstkanaal).', 
        ephemeral: true 
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🛒 A&M Watches | Aankoop Station')
      .setColor('#2F3136')
      .setDescription(
        'Wil je een horloge aanschaffen?\n' +
        'Klik op de knop hieronder om direct een ticket te openen!'
      )
      .setFooter({ text: 'A&M Watches' });

    const buyButton = new ButtonBuilder()
      .setCustomId(`simple_buy_${categoryChannel.id}`)
      .setLabel('Horloge Kopen')
      .setEmoji('⌚')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(buyButton);

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: '✅ Aankoop paneel geplaatst!', ephemeral: true });
  },
};

// Luister direct in hetzelfde bestand naar knoppen, formulieren en sluitknoppen
export async function handleSimpleShop(interaction) {
  // 1. KLANT KLIKT OP 'HORLOGE KOPEN' -> LAAT FORMULIER ZIEN
  if (interaction.isButton() && interaction.customId.startsWith('simple_buy_')) {
    const categoryId = interaction.customId.replace('simple_buy_', '');

    const modal = new ModalBuilder()
      .setCustomId(`buy_modal_${categoryId}`)
      .setTitle('Aankoop Gegevens');

    const productInput = new TextInputBuilder()
      .setCustomId('product_name')
      .setLabel('Welk horloge wil je kopen?')
      .setPlaceholder('bijv. Or Royal, Duo Argent, etc.')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const paymentInput = new TextInputBuilder()
      .setCustomId('payment_method')
      .setLabel('Gewenste betaalmethode?')
      .setPlaceholder('bijv. iDEAL, Bancontact, PayPal, Crypto')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(productInput),
      new ActionRowBuilder().addComponents(paymentInput)
    );

    await interaction.showModal(modal);
  }

  // 2. KLANT VULT FORMULIER IN -> MAAK KANAAL AAN
  if (interaction.isModalSubmit() && interaction.customId.startsWith('buy_modal_')) {
    const categoryId = interaction.customId.replace('buy_modal_', '');
    const product = interaction.fields.getTextInputValue('product_name');
    const payment = interaction.fields.getTextInputValue('payment_method');
    const { user, guild } = interaction;

    await interaction.deferReply({ ephemeral: true });

    // Maak het kanaal aan
    const ticketChannel = await guild.channels.create({
      name: `aankoop-${user.username}`,
      type: ChannelType.GuildText,
      parent: categoryId,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel, 
            PermissionFlagsBits.SendMessages, 
            PermissionFlagsBits.AttachFiles
          ],
        },
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setTitle('📋 Nieuwe Aankoop Bestelling')
      .setColor('#57F287')
      .addFields(
        { name: '👤 Klant', value: `${user}`, inline: true },
        { name: '⌚ Product', value: `\`${product}\``, inline: true },
        { name: '💳 Betaalmethode', value: `\`${payment}\``, inline: true }
      )
      .setDescription('Een medewerker helpt je zo snel mogelijk verder met de betaling!')
      .setTimestamp();

    const closeButton = new ButtonBuilder()
      .setCustomId('close_simple_ticket')
      .setLabel('Sluit Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    await ticketChannel.send({ content: `${user}`, embeds: [ticketEmbed], components: [row] });
    await interaction.editReply({ content: `✅ Je ticket is aangemaakt: ${ticketChannel}` });
  }

  // 3. TICKET SLUITEN
  if (interaction.isButton() && interaction.customId === 'close_simple_ticket') {
    await interaction.reply({ content: '🔒 Ticket wordt over 5 seconden verwijderd...' });
    setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
  }
}
