import env from "../env";
import { btoa } from "./generics";

export const OPENVIDU_SERVER_URL = env.OPENVIDU_SERVER_URL;
export const OPENVIDU_SERVER_SECRET = env.OPENVIDU_SERVER_SECRET;
export const openviduRequestHeader = {
	headers: {
		Authorization: "Basic " + btoa("OPENVIDUAPP:" + OPENVIDU_SERVER_SECRET),
		"Content-Type": "application/json",
	},
};
