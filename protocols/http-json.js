module.exports = {
    name: 'http-json',
    async check(watcher) {
        const startTime = Date.now();
        try {
            const response = await fetch(watcher.url, {
                signal: AbortSignal.timeout(watcher.timeout || 5000)
            });
            const responseTime = Date.now() - startTime;
            const statusCode = response.status;

            const allowedCodes = watcher.allowedStatusCodes || [200];
            const isAllowed = allowedCodes.includes(statusCode);

            if (!isAllowed) {
                return {
                    up: false,
                    responseTime,
                    statusCode,
                    message: `Status Code: ${statusCode} (expected ${allowedCodes.join(' or ')})`
                };
            }

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                return {
                    up: false,
                    responseTime,
                    statusCode,
                    message: `Status Code: ${statusCode} | Error: Invalid JSON response`
                };
            }

            if (watcher.jsonPath) {
                const value = watcher.jsonPath.split('.').reduce((obj, key) => obj?.[key], data);

                if (watcher.condition) {
                    switch (watcher.condition.type) {
                        case 'array-length':
                            return {
                                up: Array.isArray(value) && value.length > watcher.condition.min,
                                responseTime,
                                statusCode,
                                message: `Status Code: ${statusCode} | Array length: ${Array.isArray(value) ? value.length : 'not an array'}`
                            };
                        case 'equals':
                            return {
                                up: value === watcher.condition.value,
                                responseTime,
                                statusCode,
                                message: `Status Code: ${statusCode} | Value: ${value}`
                            };
                    }
                }
            }

            return {
                up: true,
                responseTime,
                statusCode,
                message: `Status Code: ${statusCode} | JSON validated`
            };
        } catch (error) {
            let statusCode = 0;
            if (error.cause?.code === 'ECONNREFUSED') statusCode = 502;
            else if (error.name === 'TimeoutError') statusCode = 504;
            else if (error.name === 'AbortError') statusCode = 504;

            return {
                up: false,
                responseTime: Date.now() - startTime,
                statusCode,
                message: `Error: ${error.message}`
            };
        }
    }
};