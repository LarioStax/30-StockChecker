/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../app.js');

chai.use(chaiHttp);

let googLikes;
let msftLikes;

suite('Functional Tests', function () {

  suite('GET /api/stock-prices => stockData object', function () {

    test('1 stock', function (done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'goog' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(typeof res.body, "object");
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.isAtLeast(res.body.stockData.likes, 0);
          assert.isAtLeast(res.body.stockData.price, 0);
          done();
        });
    });

    test('1 stock with like', function (done) {
      chai.request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", likes: "true" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(typeof res.body, "object");
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.isAtLeast(res.body.stockData.likes, 1);
          assert.isAtLeast(res.body.stockData.price, 0);
          googLikes = res.body.stockData.likes;
          done();
        })
    });

    test('1 stock with like again (ensure likes arent double counted)', function (done) {
      chai.request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", likes: "true" })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(typeof res.body, "object");
          assert.equal(res.body.stockData.stock, "GOOG");
          assert.equal(res.body.stockData.likes, googLikes);
          assert.isAtLeast(res.body.stockData.price, 0);
          done();
        })
    });

    test('2 stocks', function (done) {
      chai.request(server)
        .get("/api/stock-prices")
        .query({ stock: ["goog", "msft"] })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, "GOOG");
          assert.exists(res.body.stockData[0].rel_likes, "Not null or undefined");
          assert.isAtLeast(res.body.stockData[0].price, 0);
          assert.equal(res.body.stockData[1].stock, "MSFT");
          assert.exists(res.body.stockData[1].rel_likes, "Not null or undefined");
          assert.isAtLeast(res.body.stockData[1].price, 0);
          msftLikes = res.body.stockData[1].likes;
          done()
        });
      });

      test('2 stocks with like', function (done) {

      });

    });

  });
