const core = require('@actions/core');

async function run() {
    try {
        const logging = core.getBooleanInput('logging');
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
