"use client";

import { createContext } from "react";
import type { Backend } from "~/backend/Backend";
import { BackendImpl } from "~/backend/BackendImpl";

export const BackendContext = createContext<Backend>(new BackendImpl("/api/user/"));