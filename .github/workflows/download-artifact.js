const axios = require('axios');
const AdmZip = require('adm-zip');
const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;
const ARTIFACT_NAME = process.env.ARTIFACT_NAME;

async function getWorkflowId() {
  console.log("getting WorkflowId");
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows`;
  const response = await axios.get(url, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });
  console.log(`getWorkflowId Response status: ${response.status}`);
  const workflow = response.data.workflows.find(workflow => workflow.name === process.env.GITHUB_WORKFLOW);
  return workflow ? workflow.id : null;
}

// async function getLatestSuccessfulRun(workflowId) {
//     if (!workflowId) {
//         console.log(`Invalid workflowId provided (${workflowId}), unable to get latest successful runId`);
//         return null;
//     }
//     console.log(`gettingLatestSuccessfulRun for ${workflowId}`);
//     const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${workflowId}/runs`;
//     const response = await axios.get(url, {
//         headers: { Authorization: `token ${GITHUB_TOKEN}` },
//         params: {
//             status: 'success',
//             per_page: 1
//         }
//     });
//     console.log(`getLatestSuccessfulRun Response status: ${response.status}`);
//     const run = response.data.workflow_runs[0];
//     console.log(`latestSuccessfulRunId = ${run.id}`);
//     return run ? run.id : null;
// }

async function findLatestIncrementalArtifactId(workflowId) {
    if (!workflowId) {
        console.log(`Invalid workflowId provided (${workflowId}), unable to find latest incremental artifact`);
        return null;
    }

    console.log(`gettingWorkflowRuns for ${workflowId}`);
    const workflowRunsUrl = `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${workflowId}/runs`;
    const response = await axios.get(workflowRunsUrl, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        params: {
            status: 'success'
        }
    });
    console.log(`gettingWorkflowRuns Response status: ${response.status}`);
    const runs = response.data.workflow_runs;

    for (let i = 0; i < runs.length; i++) { 
        const runId = runs[i].id;
        console.log(`gettingArtifacts for run #${i}, runId: ${runId}`);
        const artifactsUrl = `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${runId}/artifacts`;
        const response = await axios.get(artifactsUrl, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
        console.log(`getArtifacts Response status: ${response.status}`);

        const artifact = response.data.artifacts.find(artifact => artifact.name.includes(ARTIFACT_NAME));
        if (artifact) {
          let previousCount = artifact.name.split('_')[1];
          core.exportVariable('FILESTOSTRYKE_COUNT', previousCount);
          console.log(`artifactId = ${artifact.id}`);
          return artifact.id;
        }
    }
}

// async function getArtifactId(runId) {
//   if (!runId) {
//       console.log(`Invalid runId provided (${runId}), unable to get artifactId`);
//       return null;
//     }

//     console.log(`Valid runId provided, gettingArtifactId for run#: ${runId}`);
//     const url = `https://api.github.com/repos/${OWNER}/${REPO}/actions/runs/${runId}/artifacts`;
//     const response = await axios.get(url, {
//         headers: {
//           Authorization: `token ${GITHUB_TOKEN}`
//         }
//     });

//     console.log(`getArtifactId Response status: ${response.status}`);
//     const artifact = response.data.artifacts.find(artifact => artifact.name.includes(ARTIFACT_NAME));

//     if (!artifact) {
//       console.log(`No artifact found for runId ${runId} with name: ${ARTIFACT_NAME}`);
//       return null;
//     }

//     let previousCount = artifact.name.split('_')[1];
//     core.exportVariable('FILESTOSTRYKE_COUNT', previousCount);
//     console.log(`artifactId = ${artifact.id}`);
//     return artifact.id;
// }

async function downloadArtifact(artifactId) {
    if (!artifactId) {
      console.log(`Invalid artifactId provided (${artifactId}), unable to download artifact`);
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
      console.log(`Invalid zipPath provided (${zipPath}), unable to extract artifact`);
      return null;
    }
    console.log(`Valid zipPath provided, extractingArtifact from: ${zipPath}`);
    const zip = new AdmZip(zipPath);
    const extractPath = path.join(__dirname, 'extracted_artifact');

    zip.extractAllTo(extractPath, true);
    console.log(`extracted artifact to: ${extractPath}`);

    const artifactFilePath = path.join(extractPath, 'stryker-incremental.json');

    if (fs.existsSync(artifactFilePath)) {
      console.log(`Artifact file found at: ${artifactFilePath}!`);
    } else {
      console.log(`Artifact file ${artifactFilePath} not found`);
    }
}

(async () => {
    try {
        const workflowId = await getWorkflowId();
        const artifactId = await findLatestIncrementalArtifactId(workflowId);
        const zipPath = await downloadArtifact(artifactId);
        extractArtifact(zipPath);

    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
})();
