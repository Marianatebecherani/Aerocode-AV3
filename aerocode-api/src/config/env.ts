import * as fs from "fs";
import * as path from "path";

function loadEnvFile(): void {
    const envPath = path.resolve(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) {
        return;
    }

    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            return;
        }

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) {
            return;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const rawValue = trimmed.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^["']|["']$/g, "");

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    });
}

loadEnvFile();

const toBoolean = (value: string | undefined, defaultValue: boolean) => {
    if (value === undefined) {
        return defaultValue;
    }

    return ["true", "1", "yes", "sim"].includes(value.trim().toLowerCase());
};

const toNumber = (value: string | undefined, defaultValue: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

export const env = {
    authTokenRequired: toBoolean(process.env.AUTH_TOKEN_REQUIRED, false),
    authTokenSecret: process.env.AUTH_TOKEN_SECRET || "aerocode-dev-secret",
    authTokenExpiresInSeconds: toNumber(process.env.AUTH_TOKEN_EXPIRES_IN_SECONDS, 24 * 60 * 60)
};
