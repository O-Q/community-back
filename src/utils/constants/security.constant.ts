import { FastifyRateLimitOptions } from 'fastify-rate-limit';
import { FastifyHelmetOptions } from 'fastify-helmet';

export const RATE_LIMIT_OPTIONS: FastifyRateLimitOptions = {};

export const HELMET_OPTIONS: FastifyHelmetOptions = {};

export const MULTIPART_OPTIONS = {
    limits: {
        fieldNameSize: 100, // Max field name size in bytes
        fieldSize: 1000000, // Max field value size in bytes
        fields: 10,         // Max number of non-file fields
        fileSize: 100,      // For multipart forms, the max file size
        files: 1,           // Max number of file fields
        // headerPairs: 2000,   // Max number of header key=>value pairs
    },
};