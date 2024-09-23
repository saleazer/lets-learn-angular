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
    console.log(`getLatestSuccessfulRun for ${WORKFLOW_ID}`);
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
    console.log(`latestSuccessfulRunId= ${run.id}`);
    return run ? run.id : null;
}

async function getArtifactId(runId) {
  console.log(`getArtifactId for run#: ${runId}`);
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${runId}/artifacts`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`
    }
  });

  console.log(`getArtifactId Response status: ${response.status}`);
  const artifact = response.data.artifacts.find(artifact => artifact.name.includes(ARTIFACT_NAME));
  if (artifact.name.includes('_')) {
    previousCount = artifact.name.split('_')[1];
  }
  console.log(`artifactId= ${artifact.id}`);
  return artifact ? artifact.id : null;
}

async function downloadArtifact(artifactId) {
  console.log(`downloadArtifact: ${artifactId}`);
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
    console.log(`extractArtifact from: ${zipPath}`);
  const zip = new AdmZip(zipPath);
  const extractPath = path.join(__dirname, 'extracted_artifact');
  zip.extractAllTo(extractPath, true);
    console.log(`extracted artifact path: ${extractPath}`);
  return extractPath;
}

async function getComponentFiles() {
    if (previousCount === 'complete') {
        core.exportVariable('COMPONENT_COUNT', 'complete');
        return;
    }
    try {
        const { context } = github;
        const octokit = github.getOctokit(GITHUB_TOKEN);
        
        const { data: files } = await octokit.rest.pulls.listFiles({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: context.payload.pull_request.number
        });

        const componentFiles = files
            .map(file => file.filename)
            .filter(filename => filename.endsWith('.component.ts'));

        const componentsToStryke = componentFiles.slice(0, previousCount+1);
  
        if (componentFiles.length > 0 && componentFiles.length === componentsToStryke.length) {
            core.exportVariable('COMPONENT_COUNT', 'complete');
        } else {
            core.exportVariable('COMPONENT_FILES', componentsToStryke.join(', '));
            core.exportVariable('COMPONENT_COUNT', previousCount+1);
        }

    } catch (error) {
        core.setFailed(error.message);
    }
  }

(async () => {
  try {
    const runId = await getLatestSuccessfulRun();
    if (!runId) {
      console.log('No successful workflow run found');
      return;
    }

    const artifactId = await getArtifactId(runId);
    if (!artifactId) {
      console.log(`Artifact ${ARTIFACT_NAME} not found`);
      return;
    }

    const zipPath = await downloadArtifact(artifactId);
    console.log(`Artifact downloaded to: ${zipPath}`);

    const extractPath = extractArtifact(zipPath);
    console.log(`Artifact extracted to: ${extractPath}`);

    const artifactFilePath = path.join(extractPath, 'stryker-incremental.json');
    if (!fs.existsSync(artifactFilePath)) {
      console.log(`Artifact file ${artifactFilePath} not found`);
      return;
    }
    console.log(`Artifact file found at: ${artifactFilePath}`);

    getComponentFiles();

  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
})();