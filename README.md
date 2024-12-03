# Status Monitor🚦

Simple service monitoring with a status page, configurable and extensible protocols and notifications.

![Screenshot](.github/assets/screenshot.png)

## Features 🚀
- Premade & extensible monitoring protocols
- Premade & extensible notifications
- Per-service and global notifications

## Configuration 🛠

config.json structure:

```json
{
    "port": 3000,
    "checkInterval": 30,
    "globalNotifications": [
        {
            "type": "notifier-name",
            "trigger": "change",
            "config": {}
        }
    ],
    "watchers": [
        {
            "name": "Service Name",
            "protocol": "protocol-name",
            "checkInterval": 60,
            "url": "https://example.com",
            "notifications": []
        }
    ]
}
```

## Protocols 📡

### HTTP 🌐
```
{
    "name": "Example HTTP watcher",
    "protocol": "http",
    "checkInterval": 60,
    "url": "https://example.com",
    "timeout": 5000,
    "allowedStatusCodes": [200, 201, 204],
    "notifications": []
}
```

### HTTP-JSON 📄

```json
{
    "name": "Example JSON API watcher",
    "protocol": "http-json",
    "checkInterval": 15,
    "url": "https://example.com/api",
    "jsonPath": "data.status",
    "timeout": 5000,
    "allowedStatusCodes": [200, 201, 204],
    "condition": {
        "type": "equals",
        "value": "online"
    },
    "notifications": []
}
```

```json
"jsonPath": "data.statuses",
"condition": {
    "type": "array-length",
    "min": 1
}
```

### Minecraft 🎮

```json
{
    "name": "Example Minecraft watcher",
    "protocol": "minecraft",
    "checkInterval": 60,
    "host": "mc.example.com",
    "port": 25565,
    "timeout": 5000,
    "notifications": []
}
```

## Notifiers 📤

### Discord Webhook 📨

```json
{
    "type": "discord-webhook",
    "webhookUrl": "<discord-webhook-url>"
}
```

### Discord 📨

```json
{
    "type": "discord",
    "botToken": "<discord-bot-token>",
    "channelId": "<discord-channel-id>"
}
```

### Telegram 📨

```json
{
    "type": "telegram",
    "botToken": "<telegram-bot-token>",
    "chatId": "<telegram-chat-id>"
}
```

### Webhook 📨

```json
{
    "type": "webhook",
    "url": "<webhook-url>"
}
```

