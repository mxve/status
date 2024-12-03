const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');

const app = express();
let latestStatuses = [];
const scheduler = new ToadScheduler();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

async function loadModules(type) {
    const modules = {};
    try {
        const files = await fs.readdir(path.join(__dirname, type));
        for (const file of files) {
            if (file.endsWith('.js')) {
                const module = require(path.join(__dirname, type, file));
                modules[module.name] = module;
            }
        }
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
    }
    return modules;
}

async function sendNotifications(newStatus, oldStatus) {
    if (!oldStatus || oldStatus.status === newStatus.status) return;

    const config = require('./config.json');
    const notifiers = await loadModules('notifiers');

    if (config.globalNotifications) {
        for (const notification of config.globalNotifications) {
            const notifier = notifiers[notification.type];
            if (!notifier) continue;

            try {
                await notifier.notify([newStatus], notification.config);
            } catch (error) {
                console.error(`Failed to send global notification via ${notification.type}:`, error);
            }
        }
    }

    const watcher = require('./config.json').watchers.find(w => w.name === newStatus.name);
    if (!watcher?.notifications) return;

    for (const notification of watcher.notifications) {
        const notifier = notifiers[notification.type];
        if (!notifier) continue;

        try {
            await notifier.notify([newStatus], notification.config);
        } catch (error) {
            console.error(`Failed to send notification via ${notification.type} for ${watcher.name}:`, error);
        }
    }
}

async function checkStatus(watcher, protocol) {
    try {
        const status = await protocol.check(watcher);
        return {
            name: watcher.name,
            status: status.up ? 'up' : 'down',
            responseTime: status.responseTime,
            lastChecked: new Date().toISOString(),
            statusCode: status.statusCode,
            message: status.message
        };
    } catch (error) {
        return {
            name: watcher.name,
            status: 'error',
            lastChecked: new Date().toISOString(),
            statusCode: 0,
            message: error.message
        };
    }
}

async function setupWatchers() {
    const config = require('./config.json');
    const protocols = await loadModules('protocols');

    try {
        latestStatuses = JSON.parse(await fs.readFile(path.join(__dirname, 'status.json'), 'utf8'));
    } catch (error) {
        console.log('No persisted status found:', error.message);
    }

    config.watchers.forEach((watcher, i) => {
        const protocol = protocols[watcher.protocol];

        if (!latestStatuses[i]) {
            latestStatuses[i] = {
                name: watcher.name,
                status: 'unknown',
                lastChecked: new Date().toISOString()
            };
        }

        const task = new AsyncTask(
            `check-${watcher.name}`,
            async() => {
                const status = protocol ? await checkStatus(watcher, protocol) : {
                    name: watcher.name,
                    status: 'error',
                    message: 'Protocol not found'
                };

                const oldStatus = latestStatuses[i];
                latestStatuses[i] = status;

                await fs.writeFile(path.join(__dirname, 'status.json'), JSON.stringify(latestStatuses, null, 2));
                await sendNotifications(status, oldStatus);
            },
            error => console.error(`Status check failed for ${watcher.name}:`, error)
        );

        scheduler.addSimpleIntervalJob(new SimpleIntervalJob({
            seconds: watcher.checkInterval || config.checkInterval || 30,
            runImmediately: true
        }, task));
    });
}

setupWatchers().catch(error => {
    console.error('Failed to setup watchers:', error);
    process.exit(1);
});

app.get('/', async(req, res) => {
    try {
        res.render('status', { statuses: latestStatuses });
    } catch (error) {
        res.status(500).render('error', { error });
    }
});

process.on('SIGINT', () => process.exit(0));
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

const config = require('./config.json');
const PORT = process.env.PORT || config.port || 3000;
app.listen(PORT, () => console.log(`Status page running on port ${PORT}`));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        error: {
            message: process.env.NODE_ENV === 'production' ?
                'Internal Server Error' : err.message
        }
    });
});

app.get('/api/status', (req, res) => {
    const publicData = latestStatuses.map(status => ({
        name: status.name,
        status: status.status,
        responseTime: status.responseTime,
        lastChecked: status.lastChecked,
        message: status.message
    }));

    res.json({
        timestamp: new Date().toISOString(),
        services: publicData
    });
});