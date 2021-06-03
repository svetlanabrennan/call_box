const express = require("express");
const app = express();

//Loads the handlebars module
const handlebars = require('express-handlebars');

//Sets our app to use the handlebars engine
app.set('view engine', 'handlebars');

//Sets handlebars configurations (we will go through them later on)
app.engine('handlebars', handlebars({
  layoutsDir: __dirname + '/views/layouts',
}));


// connect to postgres database
const { Client } = require('pg');
const host = "localhost";
const port = 3002;

// used in sending file with path
const path = require("path")
const publicPath = path.join(__dirname, '/public');
app.use(express.static(publicPath));


// read request body 
const bodyParser = require('body-parser');

// connect to database
const client = new Client({
  user: 'sb',
  host: 'localhost',
  database: 'callbox',
  password: 'password',
  port: 5432,
});

client.connect();

let endpoint = ""
// created db called "callbox"

let db = {}

// created endpoints table
// CREATE TABLE endpoints (
//   id serial PRIMARY KEY,
//   created_at timestamp NOT NULL
//   name varchar(60) NOT NULL;
// );

// created requests table
// CREATE TABLE requests(
//   id serial PRIMARY KEY,
//   endpoint_id int NOT NULL,
//   FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE,
//   content jsonb NOT NULL DEFAULT '{}'::jsonb,
//   created_at timestamp NOT NULL
// );

// let mainAllTodosListTemplate = Handlebars.compile($('#inspectRequestTemplat').html());
// Handlebars.registerPartial('requestTemplate', $('#requestTemplate').html());


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"))
  console.log("this is the request headers", req.headers)
  //Serves the body of the page aka "main.handlebars" to the container //aka "index.handlebars"
  // res.render('main', { layout: 'index' });
})

// create new request bin
app.post('/new', (req, res) => {
  endpoint = "fgfdfdf4564";
  console.log("need to save this endpoint")
  // send initial test event to this endpoint
  // redirect to endpoint url
  res.redirect(`/${endpoint}`)

  // insert endpointurl into endpoint db table
  async function insertIntoDB() {
    let date = new Date();
    // implementing parameterized queries in the app code
    let queryText = `INSERT INTO endpoints (created_at, name) VALUES ($1, $2)`;
    let queryValues = [date, endpoint];
    await client.query(queryText, queryValues);
  }

  insertIntoDB()
})


// view the stored http requests to the endpoint
app.get('/:name/inspect', (req, res) => {
  let endpointUrl = req.params.name
  let body = req.body
  let headers = req.headers
  let method = req.method
  let result2;
  // console.log(endpointUrl)
  // console.log("body", body)
  // console.log("headers", headers)
  // console.log("method", method)

  // look up last 20 stored requests in db
  async function pullRequests() {
    // find id of endpoint
    let queryText = `SELECT id FROM endpoints WHERE name = $1`;
    let queryValues = [endpointUrl];
    let result = await client.query(queryText, queryValues);


    console.log("database result", result);
    if (result.rowCount === 0) {
      console.log("not found")
      res.status(404).send("Endpoint not found")
    }

    let endpointId = result.rows[0].id;

    // implementing parameterized queries in the app code
    let queryText2 = `SELECT content FROM requests WHERE endpoint_id = $1 ORDER BY created_at DESC LIMIT 20`;
    let queryValues2 = [endpointId];
    result2 = await client.query(queryText2, queryValues2);
    // console.log("this is the result from select first item", result2.rows[0])
    console.log("this is the result2", result2.rows[0])
    res.render('main', { layout: 'index', request: result2.rows, path: endpointUrl });
  }

  pullRequests();

})

// post http request to endpoint
app.post("/:name", (req, res) => {
  // need to validate data before adding to database
  console.log("these are params", req.query)
  // check if endpoint url exists in db
  let endpointUrl = req.params.name
  console.log("this is the endpoint", endpointUrl)
  async function locateEndpoint() {
    // implementing parameterized queries in the app code
    let queryText = `SELECT id FROM endpoints WHERE name = $1`;
    let queryValues = [endpointUrl];
    let result = await client.query(queryText, queryValues);


    console.log("database result", result);

    // move this to catch statement for this route?
    if (result.rowCount === 0) {
      console.log("not found")
      res.status(404).send("Endpoint not found")
    }

    let endpointId = result.rows[0].id;
    let body = req.body
    let headers = req.headers
    let method = req.method
    console.log(endpointUrl)
    console.log("body", body)
    console.log("headers", headers)
    console.log("method", method)
    db[endpointUrl] = [method, headers, body]
    console.log(db)

    let payload = {
      method: method,
      header: headers,
      body: body
    }

    jsonPayload = JSON.stringify(payload)

    console.log("json payload", jsonPayload)

    // insert http data into db
    async function saveRequest() {
      let date = new Date();

      // need to change this endpointID to match db lookup function above
      // let endpointId = 1;
      // implementing parameterized queries in the app code
      let queryText = `INSERT INTO requests (endpoint_id, content, created_at) VALUES ($1, $2, $3)`;
      let queryValues = [endpointId, jsonPayload, date];
      await client.query(queryText, queryValues);
    }

    saveRequest()
  }

  locateEndpoint();
})

app.get("*", (req, res) => {
  res.status(400).send("Endpoint not found")
})

app.listen(port, host, () => {
  console.log(`Call box is listening on port ${port} of ${host}!`);
});