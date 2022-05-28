const fs = require('fs');

const core = require('@actions/core');

const YAML = require('yaml');

const rxDependency = /([a-z_-]+)$/;

const getProjectFromDependency = (dependency) => {
    const match = dependency.match(rxDependency);
    return match[1];
};

const readFromPackageJson = async (configYaml) => {
    // Parsing the configuration
    const config = YAML.parse(configYaml);
    // Parsing the lock file as JSON
    const lock = JSON.parse(fs.readFileSync('package-lock.json'));
    // ... and get the list of dependencies
    const dependencies = lock.dependencies;

    // Resulting links
    const links = {};

    // For each link in the configuration
    config.forEach(link => {
        const dependency = link.dependency;
        if (dependency) {
            // Gets the dependency declaration in the lock file
            const lockDependency = dependencies[dependency];
            if (lockDependency) {
                // Gets the version
                const version = lockDependency.version;
                if (version) {
                    // Project name
                    let project = link.project;
                    if (!project) {
                        project = getProjectFromDependency(dependency);
                    }
                    // Build reference
                    let buildRef = version;
                    if (link['build-label'] === true) {
                        buildRef = `#${version}`;
                    }
                    // Adding the link
                    links[project] = buildRef;
                } else {
                    core.warning(`No dependency version found for: ${dependency}`);
                }
            }
            // No dependency found, warning and going on
            else {
                core.warning(`No dependency found for: ${dependency}`);
            }
        }
    });

    // OK
    return links;
};

module.exports = {
    readFromPackageJson: readFromPackageJson,
    getProjectFromDependency: getProjectFromDependency
};
