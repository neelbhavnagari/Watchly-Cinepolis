const http = require('http');
http.get('http://localhost:3000', res => {
  console.log(res.statusCode);
  process.exit(0);
}).on('error', e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
