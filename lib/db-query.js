const config = require("./config");

const { Client } = require('pg');

const client = new Client({
  user: config.DATABASE_USER,
  host: 'localhost',
  database: config.DATABASE_NAME,
  password: config.DATABASE_PASSWORD,
  port: 5432,
});

client.connect();

async function findEndpointId(endpointUrl) {
  // find id of endpoint
  let queryText = `SELECT id FROM endpoints WHERE name = $1`;
  let queryValues = [endpointUrl];
  let result = await client.query(queryText, queryValues);
  return result;
}

module.exports = {
  async addEndpointToDB(endpoint) {
    let date = new Date();
    let queryText = `INSERT INTO endpoints (created_at, name) VALUES ($1, $2)`;
    let queryValues = [date, endpoint];
    await client.query(queryText, queryValues);
  },

  async endpointExists(endpointUrl) {
    let result = findEndpointId(endpointUrl)
    return result;
  },

  async pullRequests(endpointUrl) {
    let result = await findEndpointId(endpointUrl);

    if (result.rowCount === 0) {
      return false;
    }

    let endpointId = result.rows[0].id;

    let queryText2 = `SELECT content, created_at FROM requests WHERE endpoint_id = $1 ORDER BY created_at DESC LIMIT 20`;
    let queryValues2 = [endpointId];
    let allRequests = await client.query(queryText2, queryValues2);
    return allRequests
  },

  async addRequest(endpointUrl, method, headers, body) {
    let result = await findEndpointId(endpointUrl);

    if (result.rowCount === 0) {
      return false;
    }

    let endpointId = result.rows[0].id;

    let payload = {
      method: method,
      header: headers,
      body: body
    }

    let date = new Date();
    jsonPayload = JSON.stringify(payload)

    let queryText = `INSERT INTO requests (endpoint_id, content, created_at) VALUES ($1, $2, $3)`;
    let queryValues = [endpointId, jsonPayload, date];
    let insertResult = await client.query(queryText, queryValues);
    return insertResult.rowCount > 0;
  }
}
