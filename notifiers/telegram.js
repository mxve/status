module.exports = {
    name: 'telegram',
    async notify(changes, config) {
        if (!config.botToken || !config.chatId) {
            throw new Error('Telegram configuration missing botToken or chatId');
        }

        const message = changes.map(status =>
            `${status.name} is ${status.status.toUpperCase()}\n${status.message}`
        ).join('\n\n');

        await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: config.chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
    }
};