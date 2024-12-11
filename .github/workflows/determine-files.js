const core = require('@actions/core');
const github = require('@actions/github');

async function getAllFiles(octokit, owner, repo, path) {
  const { data: items } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path
  });

  let files = [];

  for (const item of items) {
    if (item.type === 'file') {
      files.push(item.path);
    } else if (item.type === 'dir') {
      const subFiles = await getAllFiles(octokit, owner, repo, item.path);
      files = files.concat(subFiles);
    }
  }

  return files;
}

(async () => {
  try {
    const { context } = github;
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    let prevCount = parseInt(process.env.COMPONENT_COUNT, 10);
    
    const allFiles = await getAllFiles(octokit, context.repo.owner, context.repo.repo, 'src/app');

    const allFilesWithTests = allFiles
        .filter(filename => filename.endsWith('.spec.ts'))
        .map(testFile => `src/app/**/${testFile.replace('.spec.ts', '.ts')}`);

    if (allFilesWithTests.length === 0) {
        console.log('No test files found');
        core.exportVariable('COMPONENT_FILES', '');
        core.exportVariable('COMPONENT_COUNT', 0);
    } else if (allFilesWithTests.length > prevCount) {
        const filesToStryke = allFilesWithTests.slice(0, prevCount+1);
        core.exportVariable('COMPONENT_FILES', filesToStryke.join(', '));
        core.exportVariable('COMPONENT_COUNT', prevCount+1);
    } else {
        core.exportVariable('COMPONENT_FILES', allFilesWithTests.join(', '));
    }

  } catch (error) {
    core.setFailed(error.message);
  }
})();
