import { EmbedBuilder, Events } from 'discord.js';

export default {
  name: Events.MessageCreate,
  async execute(message) {
    // Negeer berichten van bots of berichten die niet exact !pb / !PB zijn
    if (message.author.bot) return;
    if (message.content.trim().toLowerCase() !== '!pb') return;

    // Controleer of de gebruiker heeft gereageerd (reply) op een ander bericht
    if (!message.reference || !message.reference.messageId) {
      const replyMsg = await message.reply('❌ Je moet op een bericht reageren (reply) met `!pb`.');
      setTimeout(() => {
        message.delete().catch(() => {});
        replyMsg.delete().catch(() => {});
      }, 5000);
      return;
    }

    try {
      // Haal het originele bericht op waar op is gereageerd
      const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);

      // Zoek het partner kanaal
      const partnerChannel = message.guild.channels.cache.find(
        channel => channel.name.includes('partners') || channel.name.includes('🙌')
      );

      if (!partnerChannel) {
        const replyMsg = await message.reply('❌ Het partner kanaal (・🙌︱partners) is niet gevonden.');
        setTimeout(() => replyMsg.delete().catch(() => {}), 5000);
        return;
      }

      // Bouw de embed op met de inhoud van het originele bericht
      const embed = new EmbedBuilder()
        .setTitle('🙌 | Nieuwe Partner')
        .setColor('#5865F2')
        .setDescription(referencedMessage.content || '*Geen tekst (alleen bijlage)*')
        .addFields({
          name: 'Partner / Geplaatst door',
          value: `${referencedMessage.author}`,
          inline: true,
        })
        .setFooter({ text: 'A&M Watches | Partners' })
        .setTimestamp();

      // Als het originele bericht een afbeelding/bijlage had, voeg deze toe
      if (referencedMessage.attachments.size > 0) {
        const image = referencedMessage.attachments.first();
        if (image.contentType?.startsWith('image/')) {
          embed.setImage(image.url);
        }
      }

      // Stuur de embed naar het partner kanaal
      await partnerChannel.send({ embeds: [embed] });

      // Bevestiging en opruimen van de !pb commando berichten
      const successMsg = await message.channel.send(`✅ Partner bericht succesvol doorgestuurd naar ${partnerChannel}!`);
      
      setTimeout(() => {
        message.delete().catch(() => {});
        successMsg.delete().catch(() => {});
      }, 4000);

    } catch (error) {
      console.error('Fout bij verwerken van !pb reply:', error);
    }
  },
};
