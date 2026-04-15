import test from "node:test";
import assert from "node:assert/strict";

import {
  healthPayload,
  isLoopbackAddress,
  localOnlyMiddleware
} from "../server.js";

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    ended: false,
    header(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    sendStatus(code) {
      this.statusCode = code;
      this.ended = true;
      return this;
    }
  };
}

test("health payload advertises local-only mode", () => {
  const payload = healthPayload("127.0.0.1", 3030);

  assert.deepEqual(payload, {
    ok: true,
    app: "Luci's Inbox Helper local server",
    localOnly: true,
    host: "127.0.0.1",
    port: 3030
  });
});

test("loopback helper accepts supported local addresses", () => {
  assert.equal(isLoopbackAddress("127.0.0.1"), true);
  assert.equal(isLoopbackAddress("::1"), true);
  assert.equal(isLoopbackAddress("::ffff:127.0.0.1"), true);
  assert.equal(isLoopbackAddress("192.168.1.20"), false);
});

test("middleware allows localhost origin from loopback", () => {
  const req = {
    headers: { origin: "http://localhost:3030" },
    socket: { remoteAddress: "127.0.0.1" },
    method: "GET"
  };
  const res = createMockResponse();
  let nextCalled = false;

  localOnlyMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.headers["access-control-allow-origin"], "http://localhost:3030");
  assert.equal(res.headers["vary"], "Origin");
});

test("middleware rejects unexpected origins even from loopback", () => {
  const req = {
    headers: { origin: "http://evil.example" },
    socket: { remoteAddress: "127.0.0.1" },
    method: "GET"
  };
  const res = createMockResponse();

  localOnlyMiddleware(req, res, () => {
    throw new Error("next should not be called");
  });

  assert.equal(res.statusCode, 403);
  assert.match(res.body.error, /localhost/i);
});

test("middleware rejects non-loopback requests", () => {
  const req = {
    headers: {},
    socket: { remoteAddress: "10.0.0.9" },
    method: "GET"
  };
  const res = createMockResponse();

  localOnlyMiddleware(req, res, () => {
    throw new Error("next should not be called");
  });

  assert.equal(res.statusCode, 403);
  assert.match(res.body.error, /loopback/i);
});
