const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;
const WORKFLOW_ID = process.env.WORKFLOW_ID;
const ARTIFACT_NAME = process.env.ARTIFACT_NAME;

async function getLatestSuccessfulRun() {
  const response = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_ID}/runs`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`
    },
    params: {
      status: 'success',
      per_page: 1
    }
  });

  const run = response.data.workflow_runs[0];
  return run ? run.id : null;
}

async function getArtifactId(runId) {
  const response = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${runId}/artifacts`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`
    }
  });

  const artifact = response.data.artifacts.find(artifact => artifact.name === ARTIFACT_NAME);
  return artifact ? artifact.id : null;
}

async function downloadArtifact(artifactId) {
  const response = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/actions/artifacts/${artifactId}/zip`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`
    },
    responseType: 'arraybuffer'
  });

  const zipPath = path.join(__dirname, `${ARTIFACT_NAME}.zip`);
  fs.writeFileSync(zipPath, Buffer.from(response.data));
  return zipPath;
}

function extractArtifact(zipPath) {
  const zip = new AdmZip(zipPath);
  const extractPath = path.join(__dirname, 'extracted_artifact');
  zip.extractAllTo(extractPath, true);
  return extractPath;
}

(async () => {
  try {
    const runId = await getLatestSuccessfulRun();
    if (!runId) {
      console.log('No successful workflow run found');
      fs.writeFileSync('artifact_error.flag', '');
      return;
    }

    const artifactId = await getArtifactId(runId);
    if (!artifactId) {
      console.log(`Artifact ${ARTIFACT_NAME} not found`);
      fs.writeFileSync('artifact_error.flag', '');
      return;
    }

    const zipPath = await downloadArtifact(artifactId);
    const extractPath = extractArtifact(zipPath);

    const artifactFilePath = path.join(extractPath, 'stryker-incremental.json');
    if (!fs.existsSync(artifactFilePath)) {
      console.log(`Artifact file ${artifactFilePath} not found`);
      fs.writeFileSync('artifact_error.flag', '');
      return;
    }

    console.log(`Artifact extracted to ${extractPath}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    fs.writeFileSync('artifact_error.flag', '');
  }
})();