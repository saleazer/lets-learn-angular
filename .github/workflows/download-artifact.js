const axios = require('axios');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;
const WORKFLOW_NAME = process.env.WORKFLOW_FILE_NAME;
const ARTIFACT_NAME = process.env.ARTIFACT_NAME;

async function fetchWorkflowId() {
    console.log(`fetchWorkflowId: ${WORKFLOW_FILE_NAME}`);
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows`;
    const response = await axios.get(url, {
        headers: {
        Authorization: `token ${GITHUB_TOKEN}`
        }
    });

    console.log(`fetchWorkflowId Response is: ${response}`);


    const workflow = response.data.workflows.find(wf => wf.name.contains(WORKFLOW_NAME));
    if (!workflow) {
        throw new Error(`Workflow file ${WORKFLOW_FILE_NAME} not found`);
    }

    console.log(`fetchWorkflowId= ${workflow.id}`);
    return workflow.id;
}

async function getLatestSuccessfulRun() {
    const WORKFLOW_ID = await fetchWorkflowId();
    console.log(`getLatestSuccessfulRun: ${WORKFLOW_ID}`);
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_ID}/runs`;
    const response = await axios.get(url, {
    headers: {
        Authorization: `token ${GITHUB_TOKEN}`
    },
    params: {
        status: 'success',
        per_page: 1
    }
    });

    console.log(`getLatestSuccessfulRun Response status: ${response.status}`);
    const run = response.data.workflow_runs[0];
    console.log(`getLatestSuccessfulRun= ${run.id}`);
    return run ? run.id : null;
}

async function getArtifactId(runId) {
  console.log(`getArtifactId: ${runId}`);
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${runId}/artifacts`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`
    }
  });

  console.log(`getArtifactId Response status: ${response.status}`);
  console.log(`getArtifactId: ${response.data.artifacts}`);
  const artifact = response.data.artifacts.find(artifact => artifact.name === ARTIFACT_NAME);
  console.log(`getArtifactId: ${artifact}`);
  return artifact ? artifact.id : null;
}

async function downloadArtifact(artifactId) {
  console.log(`downloadArtifact: ${artifactId}`);
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/artifacts/${artifactId}/zip`;
  console.log(`Request URL: ${url}`);
  const response = await axios.get(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`
    },
    responseType: 'arraybuffer'
  });

  console.log(`downloadArtifact Response status: ${response.status}`);
  const zipPath = path.join(__dirname, `${ARTIFACT_NAME}.zip`);
  fs.writeFileSync(zipPath, Buffer.from(response.data));
  console.log(`downloadArtifact: ${zipPath}`);
  return zipPath;
}

function extractArtifact(zipPath) {
    console.log(`extractArtifact: ${zipPath}`);
  const zip = new AdmZip(zipPath);
  const extractPath = path.join(__dirname, 'extracted_artifact');
  zip.extractAllTo(extractPath, true);
    console.log(`extractArtifact: ${extractPath}`);
  return extractPath;
}

(async () => {
  try {
    const runId = await getLatestSuccessfulRun();
    if (!runId) {
      console.log('No successful workflow run found');
      fs.writeFileSync('artifact_not_found.flag', '');
      return;
    }

    const artifactId = await getArtifactId(runId);
    if (!artifactId) {
      console.log(`Artifact ${ARTIFACT_NAME} not found`);
      fs.writeFileSync('artifact_not_found.flag', '');
      return;
    }

    const zipPath = await downloadArtifact(artifactId);
    console.log(`Artifact downloaded to: ${zipPath}`);

    const extractPath = extractArtifact(zipPath);
    console.log(`Artifact extracted to: ${extractPath}`);

    const artifactFilePath = path.join(extractPath, 'stryker-incremental.json');
    if (!fs.existsSync(artifactFilePath)) {
      console.log(`Artifact file ${artifactFilePath} not found`);
      fs.writeFileSync('artifact_not_found.flag', '');
      return;
    }
    console.log(`Artifact file found at: ${artifactFilePath}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    fs.writeFileSync('artifact_not_found.flag', '');
  }
})();