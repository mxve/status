module.exports = {
    name: 'discord-webhook',
    async notify(changes, config) {
        if (!config.webhookUrl) {
            throw new Error('Discord webhook configuration missing webhookUrl');
        }

        const message = changes.map(status =>
            `**${status.name}** is **${status.status.toUpperCase()}**\n${status.message}`
        ).join('\n\n');

        await fetch(config.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message
            })
        });
    }
};