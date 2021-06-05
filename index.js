const express = require("express");
const bodyParser = require('body-parser');
const path = require("path");
const app = express();

// add this to .env file?
const host = "localhost";
const port = 3002;

const handlebars = require('express-handlebars');

app.set('view engine', 'handlebars');

app.engine('handlebars', handlebars({
  layoutsDir: __dirname + '/views/layouts',
}));

const publicPath = path.join(__dirname, '/public');
app.use(express.static(publicPath));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

const createRandomEndpoint = require("./lib/random");
const { addEndpointToDB, endpointExists, pullRequests, addRequest } = require("./lib/db-query");

// need to create db called "callbox" when adding to vps

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// create new callbox bin
app.post('/new', async (_, res) => {
  let endpoint = createRandomEndpoint();
  await addEndpointToDB(endpoint);
  res.redirect(`/${endpoint}/inspect`);
});

// view the stored http requests to the endpoint
app.get('/:name/inspect', async (req, res) => {
  let endpointUrl = req.params.name;
  let result = await pullRequests(endpointUrl);
  let domain = `http://${req.hostname}`;

  if (!result) {
    res.status(404).send("Endpoint not found");
  }

  res.render('main', { layout: 'index', request: result.rows, path: endpointUrl, host: domain });
});


app.get("/:name", async (req, res) => {
  let endpointUrl = req.params.name;

  let body = req.body;
  let headers = req.headers;
  let method = req.method;

  let result = await addRequest(endpointUrl, method, headers, body);

  if (!result) {
    res.status(404).send("Endpoint not found");
  } else {
    res.status(200).send("Success");
  }
});

app.put("/:name", async (req, res) => {
  let endpointUrl = req.params.name;

  let body = req.body;
  let headers = req.headers;
  let method = req.method;

  let result = await addRequest(endpointUrl, method, headers, body);

  if (!result) {
    res.status(404).send("Endpoint not found");
  } else {
    res.status(200).send("Success");
  }
});

// post http request to endpoint
app.post("/:name", async (req, res) => {
  let endpointUrl = req.params.name;
  let body = req.body;
  let headers = req.headers;
  let method = req.method;

  let result = await addRequest(endpointUrl, method, headers, body);

  if (!result) {
    res.status(404).send("Endpoint not found");
  }

  res.status(200).send("Success");
});

app.get("*", (_, res) => {
  res.status(400).send("Endpoint not found");
});

app.listen(port, host, () => {
  console.log(`Call box is listening on port ${port} of ${host}!`);
});