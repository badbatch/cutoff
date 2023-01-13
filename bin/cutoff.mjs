#!/usr/bin/env node

const { init } = await import('../dist/main/index.mjs'); // eslint-disable-line import/no-unresolved
init();
