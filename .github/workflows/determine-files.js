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
    let prevCount = parseInt(process.env.FILESTOSTRYKE_COUNT, 10);
    
    const allFiles = await getAllFiles(octokit, context.repo.owner, context.repo.repo, 'src/app');
    console.log("All files: ", allFiles);

    const allFilesWithTests = allFiles
        .filter(filename => filename.endsWith('.spec.ts'))
        .map(testFile => testFile.replace('.spec.ts', '.ts'));
    console.log("All files with tests: ", allFilesWithTests);

    if (allFilesWithTests.length === 0) {
        console.log('No test files found');
        core.exportVariable('FILESTOSTRYKE', '');
        core.exportVariable('FILESTOSTRYKE_COUNT', 0);
    } else if (allFilesWithTests.length > prevCount) {
        const filesToStryke = allFilesWithTests.slice(0, prevCount+1);
        core.exportVariable('FILESTOSTRYKE', filesToStryke.join(', '));
        core.exportVariable('FILESTOSTRYKE_COUNT', prevCount+1);
    } else {
        core.exportVariable('FILESTOSTRYKE', allFilesWithTests.join(', '));
    }

  } catch (error) {
    core.setFailed(error.message);
  }
})();

//commenting a change to see what the next Stryker run does