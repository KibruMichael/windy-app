import PocketBase from "pocketbase";

const PB_URL = import.meta.env.VITE_PB_URL;
// If VITE_PB_URL is set (like in local dev), use it. 
// Otherwise, pass nothing so it defaults to the current domain.
const pb = PB_URL && PB_URL !== "/" ? new PocketBase(PB_URL) : new PocketBase();

export default pb;
