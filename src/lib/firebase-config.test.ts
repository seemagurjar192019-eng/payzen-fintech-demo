import { describe, expect, it } from "vitest";
import { readFirebaseConfig } from "./firebase-config";

describe("Firebase connection requirements", () => {
  it("does not initialize a project without configuration", () => {
    expect(readFirebaseConfig({})).toBeNull();
  });
  it("requires an app ID as well as the project and auth configuration", () => {
    expect(readFirebaseConfig({ VITE_FIREBASE_API_KEY: "public-key", VITE_FIREBASE_AUTH_DOMAIN: "example.firebaseapp.com", VITE_FIREBASE_PROJECT_ID: "example" })).toBeNull();
  });
  it("uses the configured Firebase project", () => {
    expect(readFirebaseConfig({ VITE_FIREBASE_API_KEY: "public-key", VITE_FIREBASE_AUTH_DOMAIN: "example.firebaseapp.com", VITE_FIREBASE_PROJECT_ID: "example", VITE_FIREBASE_APP_ID: "web-app" })?.projectId).toBe("example");
  });
});