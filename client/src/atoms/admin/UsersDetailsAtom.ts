import { atom } from "jotai";
import type { UsersDetailsDto } from "../../generated-client";

export const UsersDetailsAtom = atom<UsersDetailsDto[]>([]);