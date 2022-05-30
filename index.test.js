const packageJsonLinks = require('./package-json-links');

const clientVersion = '0.1.8';

test('extraction of project name from JSON dependency', async () => {
    expect(packageJsonLinks.getProjectFromDependency('@actions/core')).toBe('core');
    expect(packageJsonLinks.getProjectFromDependency('color-name')).toBe('color-name');
    expect(packageJsonLinks.getProjectFromDependency('@babel/plugin-syntax-numeric-separator')).toBe('plugin-syntax-numeric-separator');
    expect(packageJsonLinks.getProjectFromDependency('@nemerosa/ontrack-github-action-client')).toBe('ontrack-github-action-client');
});

test('missing dependency field', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - name: "@nemerosa/ontrack-github-action-client"
    `)
    expect(links).toStrictEqual({});
});

test('missing dependency', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - name: "@nemerosa/unknown"
    `)
    expect(links).toStrictEqual({});
});

test('simple dependency', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - dependency: "@nemerosa/ontrack-github-action-client"
    `)
    expect(links).toStrictEqual({
        'ontrack-github-action-client': clientVersion
    });
});

test('project mapping', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - dependency: "@nemerosa/ontrack-github-action-client"
          project: github-action-client
    `)
    expect(links).toStrictEqual({
        'github-action-client': clientVersion
    });
});

test('build label', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - dependency: "@nemerosa/ontrack-github-action-client"
          build-label: true
    `)
    expect(links).toStrictEqual({
        'ontrack-github-action-client': `#${clientVersion}`
    });
});

test('build label and prefix', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - dependency: "@nemerosa/ontrack-github-action-client"
          build-label: true
          prefix: "v"
    `)
    expect(links).toStrictEqual({
        'ontrack-github-action-client': `#v${clientVersion}`
    });
});

test('build name and prefix', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - dependency: "@nemerosa/ontrack-github-action-client"
          prefix: "v"
    `)
    expect(links).toStrictEqual({
        'ontrack-github-action-client': `v${clientVersion}`
    });
});

test('two simple dependencies', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - dependency: "@nemerosa/ontrack-github-action-client"
        - dependency: "@actions/core"
    `)
    expect(links).toStrictEqual({
        'ontrack-github-action-client': clientVersion,
        'core': '1.8.2'
    });
});