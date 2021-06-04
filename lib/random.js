function createRandomEndpoint() {
  return Math.random().toString(36).substring(2);
}


module.exports = createRandomEndpoint;