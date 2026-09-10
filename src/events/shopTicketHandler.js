import { 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionFlagsBits, 
  ChannelType 
} from 'discord.js';

export async function handleShopTicketEvents(interaction) {
  // 1. TICKET AANMAKEN VIA HET PANEEL
  if (interaction.isButton() && interaction.customId.startsWith('buy_ticket_')) {
    const categoryId = interaction.customId.replace('buy_ticket_', '');
    const user = interaction.user;
    const guild = interaction.guild;

    await interaction.deferReply({ ephemeral: true });

    // Kanaal aanmaken onder de opgegeven categorie
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

    // Selectiemenu voor producten
    const productSelect = new StringSelectMenuBuilder()
      .setCustomId('select_product')
      .setPlaceholder('Kies je horloge/product...')
      .addOptions([
        { label: 'Or Royal', value: 'Or Royal - €44,99', emoji: '👑' },
        { label: 'Duo Argent', value: 'Duo Argent - €42,99', emoji: '🥈' },
        { label: 'Noir Absolu', value: 'Noir Absolu - €42,99', emoji: '🖤' },
        { label: 'Acier Pur', value: 'Acier Pur - €37,99', emoji: '⚙️' },
        { label: 'Petrol Steel', value: 'Petrol Steel - €32,99', emoji: '🟦' },
        { label: 'Petrol Duo', value: 'Petrol Duo - €42,99', emoji: '🔹' },
        { label: 'Duo Noir', value: 'Duo Noir - €44,99', emoji: '⬛' },
        { label: 'Vert Acier', value: 'Vert Acier - €39,99', emoji: '🟢' },
        { label: 'Vert Duo', value: 'Vert Duo - €42,99', emoji: '🟩' },
      ]);

    const productRow = new ActionRowBuilder().addComponents(productSelect);

    const welcomeEmbed = new EmbedBuilder()
      .setTitle('🛍️ Welkom bij je Aankoop Ticket')
      .setColor('#57F287')
      .setDescription(
        `Hallo ${user}, welkom in je aankoopticket!\n\n` +
        '**Stap 1:** Selecteer hieronder welk product je wilt kopen.\n' +
        '**Stap 2:** Kies je gewenste betaalmethode.'
      );

    await ticketChannel.send({ 
      content: `${user}`, 
      embeds: [welcomeEmbed], 
      components: [productRow] 
    });

    await interaction.editReply({ 
      content: `✅ Je ticket is aangemaakt: ${ticketChannel}` 
    });
  }

  // 2. PRODUCT SELECTIE
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_product') {
    const selectedProduct = interaction.values[0];

    const paymentSelect = new StringSelectMenuBuilder()
      .setCustomId(`select_payment_${selectedProduct}`)
      .setPlaceholder('Kies je betaalmethode...')
      .addOptions([
        { label: 'iDEAL / Bancontact', value: 'iDEAL / Bancontact', emoji: '💳' },
        { label: 'PayPal', value: 'PayPal', emoji: '🅿️' },
        { label: 'Paysafecard', value: 'Paysafecard', emoji: '🔒' },
        { label: 'Crypto', value: 'Crypto', emoji: '🪙' },
      ]);

    const paymentRow = new ActionRowBuilder().addComponents(paymentSelect);

    const productEmbed = new EmbedBuilder()
      .setTitle('📌 Product Geselecteerd')
      .setColor('#3498DB')
      .setDescription(`Geselecteerd product: **${selectedProduct}**\n\nKies nu hieronder je betaalmethode:`);

    await interaction.update({ embeds: [productEmbed], components: [paymentRow] });
  }

  // 3. BETAALMETHODE SELECTIE & OVERZICHT
  if (interaction.isStringSelectMenu() && interaction.customId.startsWith('select_payment_')) {
    const selectedProduct = interaction.customId.replace('select_payment_', '');
    const selectedPayment = interaction.values[0];

    const summaryEmbed = new EmbedBuilder()
      .setTitle('📋 Aankoop Overzicht')
      .setColor('#F1C40F')
      .addFields(
        { name: '👤 Klant', value: `${interaction.user}`, inline: true },
        { name: '⌚ Product', value: `\`${selectedProduct}\``, inline: true },
        { name: '💳 Betaalmethode', value: `\`${selectedPayment}\``, inline: true }
      )
      .setDescription('Een medewerker komt zo snel mogelijk bij je om de betaling af te handelen!')
      .setFooter({ text: 'A&M Watches Support' })
      .setTimestamp();

    const closeButton = new ButtonBuilder()
      .setCustomId('close_shop_ticket')
      .setLabel('Sluit Ticket')
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRowBuilder().addComponents(closeButton);

    await interaction.update({ 
      content: '✅ **Bestellingsinformatie ontvangen!**', 
      embeds: [summaryEmbed], 
      components: [actionRow] 
    });
  }

  // 4. TICKET SLUITEN
  if (interaction.isButton() && interaction.customId === 'close_shop_ticket') {
    await interaction.reply({ content: '🔒 Dit ticket wordt over 5 seconden gesloten...' });
    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }
}
