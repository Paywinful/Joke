const http = require('http');
const { parse } = require('url');
const { parse: parseQuery } = require('querystring');


// Database variable
let db = [];

// Helper function to parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(parseQuery(body));
    });
    req.on('error', err => {
      reject(err);
    });
  });
}


function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Create server
const server = http.createServer(async (req, res) => {
  const { pathname, query } = parse(req.url, true);

  if (req.method === 'GET' && pathname === '/') {
    sendResponse(res, 200, db);
  } else if (req.method === 'POST' && pathname === '/') {
    const body = await parseBody(req);
    db.push(body);
    sendResponse(res, 200, db);
  } else if (req.method === 'PATCH' && pathname.startsWith('/joke/')) {
    const id = parseInt(pathname.slice(6));
    const body = await parseBody(req);
    db = db.map(joke => {
      if (joke.id === id) {
        return { ...joke, ...body };
      }
      return joke;
    });
    const updatedJoke = db.find(joke => joke.id === id);
    sendResponse(res, 200, updatedJoke);
  } else if (req.method === 'DELETE' && pathname.startsWith('/joke/')) {
    const id = parseInt(pathname.slice(6));
    const deletedJoke = db.find(joke => joke.id === id);
    db = db.filter(joke => joke.id !== id);
    sendResponse(res, 200, deletedJoke);
  } else {
    sendResponse(res, 404, { error: 'Route not found' });
  }
});

// Start server
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
