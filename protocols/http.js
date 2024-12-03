module.exports = {
    name: 'http',
    async check(watcher) {
        const startTime = Date.now();
        try {
            const response = await fetch(watcher.url, {
                signal: AbortSignal.timeout(watcher.timeout || 5000)
            });
            const responseTime = Date.now() - startTime;

            const allowedCodes = watcher.allowedStatusCodes || [200];
            const isAllowed = allowedCodes.includes(response.status);

            return {
                up: isAllowed,
                responseTime,
                statusCode: response.status,
                message: `Status Code: ${response.status}${isAllowed ? '' : ' (expected ' + allowedCodes.join(' or ') + ')'}`
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