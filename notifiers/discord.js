module.exports = {
    name: 'discord',
    async notify(changes, config) {
        if (!config.botToken || !config.channelId) {
            throw new Error('Discord configuration missing botToken or channelId');
        }

        const message = changes.map(status =>
            `**${status.name}** is **${status.status.toUpperCase()}**\n${status.message}`
        ).join('\n\n');

        await fetch(`https://discord.com/api/v10/channels/${config.channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bot ${config.botToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message
            })
        });
    }
};