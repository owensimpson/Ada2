const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { colorFromEnergy } = require('../bungie-net-api/util')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mods')
        .setDescription('Queries Ada-1 for her current mods'),
    async execute(interaction) {
        await interaction.deferReply()
        try {
            const { getAdaCombatModsSaleDefinitons } = await import('../bungie-net-api/vendor.mjs');
            const mods = (await getAdaCombatModsSaleDefinitons()).map(d => {
                return {
                    // TODO abstract this with the reset mods info
                    name: d.inventoryDefinition.displayProperties?.name,
                    icon: 'https://bungie.net' + d.inventoryDefinition.displayProperties?.icon,
                    kind: d.inventoryDefinition.itemTypeDisplayName,
                    description: [d.inventoryDefinition.displayProperties?.description,
                        d.inventoryDefinition.tooltipNotifications[0].displayString].join('\n'),
                    energy: d.inventoryDefinition.plug.energyCost.energyType
                }
            });
            if (!mods.length) return await interaction.editReply(
                'Ada is not currently selling any combat style mods.');
            const embeds = mods.map(m => {
                return new EmbedBuilder()
                    .setTitle(m.name)
                    .setDescription(m.description)
                    .setImage(m.icon)
                    .setColor(colorFromEnergy(m.energy));
            })
            await interaction.editReply({ embeds });
        } catch (e) {
            console.error(e);
            await interaction.editReply(
                { content: `Failed to list the daily mods: \`${e.message}\`` });
        }

    }
};