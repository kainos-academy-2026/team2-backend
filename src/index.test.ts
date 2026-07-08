import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, test } from "node:test";

import { app } from "./app.js";

let server: Server | undefined;

after(async () => {
	await new Promise<void>((resolve, reject) => {
		if (!server) {
			resolve();
			return;
		}

		server.close((error) => {
			if (error) {
				reject(error);
				return;
			}

			resolve();
		});
	});
});

test("health endpoint returns a healthy response", async () => {
	server = createServer(app);
	await new Promise<void>((resolve) => {
		server?.listen(0, resolve);
	});

	const address = server.address();
	if (!address || typeof address === "string") {
		throw new Error("Expected test server to listen on a port");
	}

	const response = await fetch(`http://127.0.0.1:${address.port}/health`);
	assert.equal(response.status, 200);

	const body = (await response.json()) as { status: string; timestamp: string };
	assert.equal(body.status, "UP");
	assert.equal(typeof body.timestamp, "string");
});
