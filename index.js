// noinspection ExceptionCaughtLocallyJS

const core = require('@actions/core');
const github = require('@actions/github');

const YAML = require('yaml');

const client = require('@nemerosa/ontrack-github-action-client');

const packageJsonLinks = require('./package-json-links');

const buildLinksByRunId = async (clientEnvironment, logging, owner, repository, runId, addOnly, buildLinks) => {
    const query = `
        mutation BuildLinksByRunId(
            $owner: String!,
            $repository: String!,
            $runId: Long!,
            $addOnly: Boolean!,
            $buildLinks: [GitHubIngestionLink!]!,
        ) {
            gitHubIngestionBuildLinksByRunId(input: {
                owner: $owner,
                repository: $repository,
                runId: $runId,
                addOnly: $addOnly,
                buildLinks: $buildLinks,
            }) {
                errors {
                    message
                }
            }
        }
    `;
    const buildLinksInput = [];
    for (const project in buildLinks) {
        buildLinksInput.push({
            project: project,
            buildRef: buildLinks[project]
        });
    }
    const variables = {
        owner: owner,
        repository: repository,
        runId: runId,
        addOnly: addOnly,
        buildLinks: buildLinksInput,
    };
    await client.graphQL(
        clientEnvironment,
        query,
        variables,
        logging
    );
};

const buildLinksByBuildName = async (clientEnvironment, logging, owner, repository, buildName, addOnly, buildLinks) => {
    const query = `
        mutation BuildLinksByBuildName(
            $owner: String!,
            $repository: String!,
            $buildName: String!,
            $addOnly: Boolean!,
            $buildLinks: [GitHubIngestionLink!]!,
        ) {
            gitHubIngestionBuildLinksByBuildName(input: {
                owner: $owner,
                repository: $repository,
                buildName: $buildName,
                addOnly: $addOnly,
                buildLinks: $buildLinks,
            }) {
                errors {
                    message
                }
            }
        }
    `;
    const buildLinksInput = [];
    for (const project in buildLinks) {
        buildLinksInput.push({
            project: project,
            buildRef: buildLinks[project]
        });
    }
    const variables = {
        owner: owner,
        repository: repository,
        buildName: buildName,
        addOnly: addOnly,
        buildLinks: buildLinksInput,
    };
    await client.graphQL(
        clientEnvironment,
        query,
        variables,
        logging
    );
};

const buildLinksByBuildLabel = async (clientEnvironment, logging, owner, repository, buildLabel, addOnly, buildLinks) => {
    const query = `
        mutation BuildLinksByBuildLabel(
            $owner: String!,
            $repository: String!,
            $buildLabel: String!,
            $addOnly: Boolean!,
            $buildLinks: [GitHubIngestionLink!]!,
        ) {
            gitHubIngestionBuildLinksByBuildLabel(input: {
                owner: $owner,
                repository: $repository,
                buildLabel: $buildLabel,
                addOnly: $addOnly,
                buildLinks: $buildLinks,
            }) {
                errors {
                    message
                }
            }
        }
    `;
    const buildLinksInput = [];
    for (const project in buildLinks) {
        buildLinksInput.push({
            project: project,
            buildRef: buildLinks[project]
        });
    }
    const variables = {
        owner: owner,
        repository: repository,
        buildLabel: buildLabel,
        addOnly: addOnly,
        buildLinks: buildLinksInput,
    };
    await client.graphQL(
        clientEnvironment,
        query,
        variables,
        logging
    );
};

async function run() {
    try {
        const logging = core.getBooleanInput('logging');

        let clientEnvironment = client.checkEnvironment(logging);
        if (!clientEnvironment) {
            core.info("Ontrack is not configured. Not doing anything.");
            return;
        } else if (logging) {
            core.info(`Ontrack URL: ${clientEnvironment.url}`)
        }

        // Getting all the arguments
        let owner = core.getInput('owner');
        let repository = core.getInput('repository');
        const buildName = core.getInput('build-name');
        const buildLabel = core.getInput('build-label');

        // Setting the owner
        if (!owner) {
            owner = github.context.repo.owner;
        }

        // Setting the repository
        if (!repository) {
            repository = github.context.repo.repo;
        }

        // Build name & label cannot be specified together
        if (buildName && buildLabel) {
            throw Error('"build-name" and "build-label" cannot be both declared.');
        }

        // Build links resolution
        const addOnly = core.getBooleanInput('add-only');
        const buildLinksYaml = core.getInput('build-links');
        const buildLinksYamlPackageJson = core.getInput('build-links-from-package-json');

        // Resolution of the build links
        let buildLinks = {};

        if (buildLinksYaml) {
            buildLinks = YAML.parse(buildLinksYaml);
        } else if (buildLinksYamlPackageJson) {
            buildLinks = await packageJsonLinks.readFromPackageJson(buildLinksYamlPackageJson)
        }

        // Checking the build links
        if (!buildLinks) {
            core.warning('No build links was specified. Not doing anything.');
        }
        // Calling
        else {
            if (logging) {
                core.info(`Build links: ${buildLinks}`)
            }
            // By build label
            if (buildLabel) {
                await buildLinksByBuildLabel(clientEnvironment, logging, owner, repository, buildLabel, addOnly, buildLinks);
            }
            // By build name
            else if (buildName) {
                await buildLinksByBuildName(clientEnvironment, logging, owner, repository, buildName, addOnly, buildLinks);
            }
            // By run ID
            else {
                await buildLinksByRunId(clientEnvironment, logging, owner, repository, github.context.runId, addOnly, buildLinks);
            }
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
