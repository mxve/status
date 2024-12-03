module.exports = {
    name: 'webhook',
    async notify(changes, config) {
        if (!config.url) {
            throw new Error('Webhook configuration missing url');
        }

        await fetch(config.url, {
            method: config.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(config.headers || {})
            },
            body: JSON.stringify({
                changes,
                timestamp: new Date().toISOString(),
                ...(config.extraData || {})
            })
        });
    }
};