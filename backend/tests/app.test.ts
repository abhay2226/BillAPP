import assert from "node:assert/strict";
import { test } from "node:test";

import app from "../src/app.js";

test("GET / reports that the API is running", async (t) => {
    const server = app.listen(0, "127.0.0.1");

    t.after(async () => {
        await new Promise<void>((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    });

    await new Promise<void>((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    });

    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("Test server did not bind to a TCP port.");
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        success: true,
        message: "BillAPP API is running."
    });
});
