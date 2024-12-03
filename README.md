# Status Monitor🚦

Simple service monitoring with a status page, configurable and extensible protocols and notifications.

![Screenshot](.github/assets/screenshot.png)

## Table of Contents 📑
- [Features](#features-)
- [Configuration](#configuration-)
- [Protocols](#protocols-)
  - [HTTP](#http-)
  - [HTTP-JSON](#http-json-)
  - [Minecraft](#minecraft-)
- [Notifiers](#notifiers-)
  - [Discord Webhook](#discord-webhook-)
  - [Discord](#discord-)
  - [Telegram](#telegram-)
  - [Webhook](#webhook-)
- [Extending](#extending-)
  - [Custom Protocols](#custom-protocols)
  - [Custom Notifiers](#custom-notifiers)

## Features 🚀
- Extensible monitoring protocols & notifications
- Status page

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
```json
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

## Extending 🔧

### Custom Protocols
Create new files in the `protocols/` directory. See existing protocols for reference.

Each protocol must export:
- `name`: Protocol identifier used in config
- `check(watcher)`: Async function returning status object

### Custom Notifiers
Create new files in the `notifiers/` directory. See existing notifiers for reference.

Each notifier must export:
- `name`: Notifier identifier used in config
- `notify(changes, config)`: Async function to send notifications

