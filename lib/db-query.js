const { Client } = require('pg');
const host = "localhost";
const port = 3002;

const client = new Client({
  user: 'sb',
  host: 'localhost',
  database: 'callbox',
  password: 'password',
  port: 5432,
});

client.connect();

// async function saveRequest(...queryValues) {
//   // let date = new Date();

//   // need to change this endpointID to match db lookup function above
//   // let endpointId = 1;
//   // implementing parameterized queries in the app code
//   let queryText = `INSERT INTO requests (endpoint_id, content, created_at) VALUES ($1, $2, $3)`;
//   // let queryValues = [endpointId, jsonPayload, date];
//   await client.query(queryText, queryValues);
// }

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
    // implementing parameterized queries in the app code
    // add endpoint path to database
    let queryText = `INSERT INTO endpoints (created_at, name) VALUES ($1, $2)`;
    let queryValues = [date, endpoint];
    await client.query(queryText, queryValues);
  },

  async pullRequests(endpointUrl) {
    // find id of endpoint
    // let queryText = `SELECT id FROM endpoints WHERE name = $1`;
    // let queryValues = [endpointUrl];
    // let result = await client.query(queryText, queryValues);

    let result = await findEndpointId(endpointUrl);

    if (result.rowCount === 0) {
      return false;
    }

    let endpointId = result.rows[0].id;

    // implementing parameterized queries in the app code
    // return last 20 requests for endpoint
    let queryText2 = `SELECT content FROM requests WHERE endpoint_id = $1 ORDER BY created_at DESC LIMIT 20`;
    let queryValues2 = [endpointId];
    let allRequests = await client.query(queryText2, queryValues2);
    return allRequests
  },

  async addRequest(endpointUrl, method, headers, body) {
    // implementing parameterized queries in the app code
    // let queryText = `SELECT id FROM endpoints WHERE name = $1`;
    // let queryValues = [endpointUrl];
    // let result = await client.query(queryText, queryValues);


    // console.log("database result", result);

    // move this to catch statement for this route?

    let result = await findEndpointId(endpointUrl);

    if (result.rowCount === 0) {
      // console.log("not found")
      // res.status(404).send("Endpoint not found")
      return false;
    }

    let endpointId = result.rows[0].id;
    // let body = req.body
    // let headers = req.headers
    // let method = req.method
    // console.log(endpointUrl)
    // console.log("body", body)
    // console.log("headers", headers)
    // console.log("method", method)
    // db[endpointUrl] = [method, headers, body];
    // console.log(db)

    let payload = {
      method: method,
      header: headers,
      body: body
    }

    let date = new Date();
    jsonPayload = JSON.stringify(payload)

    // console.log("json payload", jsonPayload)

    // insert http data into db
    // async function saveRequest() {
    //   let date = new Date();

    //   // need to change this endpointID to match db lookup function above
    //   // let endpointId = 1;
    //   // implementing parameterized queries in the app code
    //   let queryText = `INSERT INTO requests (endpoint_id, content, created_at) VALUES ($1, $2, $3)`;
    //   let queryValues = [endpointId, jsonPayload, date];
    //   await client.query(queryText, queryValues);
    // }

    let queryText = `INSERT INTO requests (endpoint_id, content, created_at) VALUES ($1, $2, $3)`;
    let queryValues = [endpointId, jsonPayload, date];
    let insertResult = await client.query(queryText, queryValues);
    return insertResult.rowCount > 0;
  }
}
