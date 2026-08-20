// Mock implementation for local development without a backend.
// Every function returns a Promise and resolves/rejects with the SAME
// shape your real API will use, so nothing calling this file has to
// change once the backend + JWT auth exist.
//
// TO SWITCH TO A REAL BACKEND, replace the body of each function, e.g.:
//   export async function login({ email, password }) {
//     const res = await fetch("http://localhost:8000/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//     if (!res.ok) {
//       const err = await res.json();
//       throw new Error(err.detail || "Login failed");
//     }
//     return res.json(); // { user, token }
//   }
// Keep the function name, params, and { user, token } shape the same
// and AuthContext.jsx / Login.jsx need zero changes.

const MOCK_DELAY_MS = 400;

// In-memory only — resets on refresh. That's intentional: it stands in
// for your database until the real backend exists.
let mockUsers = [];

function wait() {
    return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

export async function signup({ email, password }) {
    await wait();
    if (mockUsers.some((account) => account.email === email)) {
        throw new Error("An account with this email already exists.");
    }

    const user = { id: crypto.randomUUID(), email };
    mockUsers.push({ ...user, password }); // a real backend hashes this server-side, never client-side
    return { user, token: `mock-token-${user.id}` };
}

export async function login({ email, password }) {
    await wait();
    const account = mockUsers.find((entry) => entry.email === email && entry.password === password);
    if (!account) {
        throw new Error("Email or password is incorrect.");
    }

    const { password: _password, ...user } = account;
    return { user, token: `mock-token-${user.id}` };
}

export async function logout() {
    await wait();
    return true;
}