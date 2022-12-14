const { SlashCommandBuilder } = require('discord.js');
const { updateReminderTime, disableReminders } = require('../database/users');
const { nextReset } = require('../misc/util.js');
const config = require('../config.json');

module.exports = {
    remindString,
    data: new SlashCommandBuilder()
        .setName('remindme')
        .setDescription('What time should the bot remind you about a mod?')
        .addSubcommand(subcommand =>
            subcommand
                .setName('time')
                .setDescription('Change the time you are reminded')
                .addNumberOption(option =>
                    option.setName('delta')
                        .setDescription('A number from between -23.99 and 23.99, ' +
                            'the delta from reset. Ex: -3.5 means 3.5h BEFORE reset')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Disable reminders from the bot')),
    async execute(interaction) {
        await interaction.deferReply();
        if (interaction.options.getSubcommand() === 'time') {
            /** @type number */
            const delta = interaction.options.getNumber('delta');
            try {
                const time = nextReset();
                if (delta >= 0) {
                    time.setUTCHours(config.UTCResetHour + Math.floor(delta), Math.round((delta % 1) * 60));
                } else {
                    time.setUTCHours(config.UTCResetHour + Math.ceil(delta), Math.round((delta % 1) * 60));
                }
                const str = await remindString(interaction.user.id, delta);
                await interaction.editReply({
                    content: `Updated reminder time to about ${str}. Your reminder will be DMed to you at <t:${time.getTime()
                    / 1000}:t> local time`
                })
            } catch (e) {
                await interaction.editReply(
                    { content: `Failed to update reminder time: \`${e.message}\`` })
            }
        } else if (interaction.options.getSubcommand() === 'disable') {
            try {
                await disableReminders(interaction.user.id)
                await interaction.editReply(
                    { content: `Reminders disabled` })
            } catch (e) {
                console.error(e);
                await interaction.editReply(
                    { content: `Failed to disable reminders: \`${e.message}\`` });
            }
        }
    }
};

/**
 *
 * @param delta
 * @param id
 * @return {Promise<string>}
 */
async function remindString(id, delta) {
    if (delta <= -24 || delta >= 24) {
        throw new Error('Please enter a valid number between -23.99 and 23.99');
    }
    return updateReminderTime(id, delta);
}