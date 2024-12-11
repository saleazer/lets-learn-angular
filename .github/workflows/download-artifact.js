const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;
const WORKFLOW_ID = process.env.WORKFLOW_ID;
const ARTIFACT_NAME = process.env.ARTIFACT_NAME;

let previousCount = 0;

async function getLatestSuccessfulRun() {
    console.log(`gettingLatestSuccessfulRun for ${WORKFLOW_ID}`);
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_ID}/runs`;
    const response = await axios.get(url, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        params: {
            status: 'success',
            per_page: 1
        }
    });
    console.log(`getLatestSuccessfulRun Response status: ${response.status}`);
    const run = response.data.workflow_runs[0];
    console.log(`latestSuccessfulRunId = ${run.id}`);
    return run ? run.id : null;
}

async function getArtifactId(runId) {
    if (!runId) {
      console.log('NULL runId provided, unable to get artifactId');
      return null;
    }
    console.log(`Valid runId provided, gettingArtifactId for run#: ${runId}`);
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${runId}/artifacts`;
    const response = await axios.get(url, {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`
        }
    });

    console.log(`getArtifactId Response status: ${response.status}`);
    const artifact = response.data.artifacts.find(artifact => artifact.name.includes(ARTIFACT_NAME));
    // if (artifact.name.includes('_')) {
    //   previousCount = artifact.name.split('_')[1];
    // }
    console.log(`artifactId = ${artifact.id}`);
    return artifact ? artifact.id : null;
}

async function downloadArtifact(artifactId) {
    if (!artifactId) {
      console.log('NULL artifactId provided, unable to download artifact');
      return null;
    }
    console.log(`Valid artifactId provided, downloadingArtifact: ${artifactId}`);
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/artifacts/${artifactId}/zip`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      },
      responseType: 'arraybuffer'
    });

    console.log(`downloadArtifact Response status: ${response.status}`);
    const zipPath = path.join(__dirname, `${ARTIFACT_NAME}.zip`);
    fs.writeFileSync(zipPath, Buffer.from(response.data));
    console.log(`zipped artifact path: ${zipPath}`);
    return zipPath;
}

function extractArtifact(zipPath) {
    if (!zipPath) {
      console.log('NULL zipPath provided, unable to extract artifact');
      return null;
    }
    console.log(`Valid zipPath provided, extractingArtifact from: ${zipPath}`);
    const zip = new AdmZip(zipPath);
    const extractPath = path.join(__dirname, 'extracted_artifact');
    zip.extractAllTo(extractPath, true);
    console.log(`extracted artifact path: ${extractPath}`);
    return extractPath;
}

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

async function getComponentFiles() {
    try {
        const { context } = github;
        const octokit = github.getOctokit(GITHUB_TOKEN);
              
        const allFiles = await getAllFiles(octokit, context.repo.owner, context.repo.repo, 'src');

        const allFilesWithTests = allFiles
            .filter(filename => filename.endsWith('.spec.ts'))
            .map(testFile => testFile.replace('.spec.ts', '.ts'));
        console.log(allFilesWithTests);        

        if (allFilesWithTests.length() === 0) {
            core.exportVariable('COMPONENT_FILES', '');

        } else if (allFilesWithTests.length() > previousCount) {
            const filesToStryke = allFilesWithTests.slice(0, previousCount+1);
            core.exportVariable('COMPONENT_FILES', filesToStryke.join(', '));
            core.exportVariable('COMPONENT_COUNT', previousCount+1);

        } else if (allFilesWithTests.length() === previousCount) {
            core.exportVariable('COMPONENT_FILES', allFilesWithTests.join(', '));
        }
  
    } catch (error) {
        core.setFailed(error.message);
    }
  }

(async () => {
    try {
        const runId = await getLatestSuccessfulRun();
        const artifactId = await getArtifactId(runId);
        const zipPath = await downloadArtifact(artifactId);
        const extractPath = extractArtifact(zipPath);
        const artifactFilePath = path.join(extractPath, 'stryker-incremental.json');
        
        if (!fs.existsSync(artifactFilePath)) {
          console.log(`Artifact file ${artifactFilePath} not found`);
        }
        console.log(`Artifact file found at: ${artifactFilePath}`);

        getComponentFiles();

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
})();