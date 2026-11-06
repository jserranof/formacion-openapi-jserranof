import { readFileSync } from "node:fs";
import { parse } from "yaml";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const leerContrato = (): any => parse(readFileSync(new URL("../openapi.yaml", import.meta.url), "utf8"));
