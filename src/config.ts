import * as fs from 'fs';

export const CONFIG = {
    dev: {
        FASTIFY_OPTIONS: undefined,
        ADDRESS: 'localhost',
        PORT: 3000,
    },
    prod: {
        FASTIFY_OPTIONS: {
            https: {
                // key: fs.readFileSync('/etc/letsencrypt/live/api.miakova.ir/privkey.pem'),
                // cert: fs.readFileSync('/etc/letsencrypt/live/api.miakova.ir/fullchain.pem'),
            },
        },
        ADDRESS: 'api.miakova.ir',
        PORT: 3000,
    },
};

