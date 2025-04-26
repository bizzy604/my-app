// jest.polyfills.js
// This file runs BEFORE the test environment is set up.

const { TextEncoder, TextDecoder } = require('util');
// Remove undici import
// const { fetch, Headers, Request, Response } = require('undici');
// Add required stream/web and worker_threads components
const { ReadableStream } = require('node:stream/web');
const { MessageChannel } = require('node:worker_threads');

// Assign TextEncoder/Decoder globally
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
// Add other required globals
global.ReadableStream = ReadableStream;
global.MessageChannel = MessageChannel;

// Remove fetch assignments
// global.fetch = fetch;
// global.Headers = Headers;
// global.Request = Request;
// global.Response = Response;

// Remove previous temporary note
// We might need more globals like MessagePort, etc., but let's try this first.

console.log('Polyfills for TextEncoder/Decoder, ReadableStream, MessageChannel applied.'); // Updated log
