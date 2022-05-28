const packageJsonLinks = require('./package-json-links');

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
        'ontrack-github-action-client': '0.1.6'
    });
});

test('project mapping', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - dependency: "@nemerosa/ontrack-github-action-client"
          project: github-action-client
    `)
    expect(links).toStrictEqual({
        'github-action-client': '0.1.6'
    });
});

test('build label', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - dependency: "@nemerosa/ontrack-github-action-client"
          build-label: true
    `)
    expect(links).toStrictEqual({
        'ontrack-github-action-client': '#0.1.6'
    });
});

test('two simple dependencies', async () => {
    const links = await packageJsonLinks.readFromPackageJson(`
        - dependency: "@nemerosa/ontrack-github-action-client"
        - dependency: "@actions/core"
    `)
    expect(links).toStrictEqual({
        'ontrack-github-action-client': '0.1.6',
        'core': '1.8.2'
    });
});