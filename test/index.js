import http from 'http';
import assert from 'assert';

import '../server/index.js';

let port = process.env.PORT || 3000
describe('Example Node Server', () => {
  it('should return 200', done => {
    http.get('http://127.0.0.1:'+port, res => {
      assert.equal(200, res.statusCode);
      done();
    });
  });
});
