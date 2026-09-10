import { 
  ContextMenuCommandBuilder, 
  ApplicationCommandType, 
  EmbedBuilder, 
  PermissionFlagsBits 
} from 'discord.js';

export default {
  data: new ContextMenuCommandBuilder()
    .setName('Partner Doorsturen')
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // Het bericht waarop is geklikt
    const targetMessage = interaction.targetMessage;
    const messageLink = targetMessage.url;

    // Zoek het partner kanaal in de server op naam
    const partnerChannel = interaction.guild.channels.cache.find(
      channel => channel.name.includes('partners') || channel.name.includes('🙌')
    );

    if (!partnerChannel) {
      return interaction.editReply({
        content: '❌ Het partner kanaal kon niet worden gevonden. Zorg dat het kanaal bestaat!',
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🙌 | Nieuwe Partner')
      .setColor('#5865F2')
      .setDescription(
        `Er is een nieuwe samenwerking/partner bericht geplaatst!\n\n` +
        `🔗 **[Klik hier om naar het bericht te gaan](${messageLink})**`
      )
      .addFields({
        name: 'Geplaatst door',
        value: `${targetMessage.author}`,
        inline: true,
      })
      .setFooter({ text: 'A&M Watches | Partners' })
      .setTimestamp();

    try {
      await partnerChannel.send({ embeds: [embed] });
      await interaction.editReply({
        content: `✅ Het bericht is succesvol doorgestuurd naar ${partnerChannel}!`,
      });
    } catch (error) {
      console.error('Fout bij het versturen van partner bericht:', error);
      await interaction.editReply({
        content: '❌ Er is een fout opgetreden bij het versturen naar het partner kanaal.',
      });
    }
  },
};
