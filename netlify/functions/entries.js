const OWNER = process.env.GITHUB_OWNER || 'nikhil-r-kumar';
const REPO = process.env.GITHUB_REPO || 'nikhil-r-kumar.github.io';
const FILE_PATH = process.env.GITHUB_FILE_PATH || 'nikhil-home/public/entries.json';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN = process.env.GITHUB_TOKEN;

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

const githubHeaders = () => {
  const headers = {
    Accept: 'application/vnd.github+json',
    ...DEFAULT_HEADERS,
  };

  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }

  return headers;
};

async function fetchFile() {
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`, {
    method: 'GET',
    headers: githubHeaders(),
  });
}

async function updateFile(content, sha) {
  return fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify({
      message: 'Update balance tracker entries',
      content: Buffer.from(JSON.stringify(content, null, 2), 'utf8').toString('base64'),
      sha,
      branch: BRANCH,
    }),
  });
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: DEFAULT_HEADERS,
      body: '',
    };
  }

  if (event.httpMethod === 'GET') {
    const response = await fetchFile();
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ error: 'Could not read entries file' }),
      };
    }

    const data = await response.json();
    const decoded = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    return {
      statusCode: 200,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ ...decoded, sha: data.sha }),
    };
  }

  if (event.httpMethod === 'PUT' || event.httpMethod === 'POST') {
    if (!TOKEN) {
      return {
        statusCode: 500,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ error: 'GITHUB_TOKEN is not configured' }),
      };
    }

    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (error) {
      return {
        statusCode: 400,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      };
    }

    const readResponse = await fetchFile();
    if (!readResponse.ok) {
      return {
        statusCode: readResponse.status,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ error: 'Unable to read existing file for update' }),
      };
    }

    const existing = await readResponse.json();
    const updateResponse = await updateFile(payload, existing.sha);
    if (!updateResponse.ok) {
      const errorBody = await updateResponse.text();
      return {
        statusCode: updateResponse.status,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ error: 'Failed to update file', details: errorBody }),
      };
    }

    return {
      statusCode: 200,
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ success: true }),
    };
  }

  return {
    statusCode: 405,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
