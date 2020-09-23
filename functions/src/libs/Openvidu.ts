import { btoa } from "./generics";

export const OPENVIDU_SERVER_URL =
	process.env.OPENVIDU_PROD_URL || process.env.OPENVIDU_DEV_URL;
export const OPENVIDU_SERVER_SECRET =
	process.env.OPENVIDU_PROD_SECURITY_TOKEN ||
	process.env.OPENVIDU_DEV_SECURITY_TOKEN;
export const openviduRequestHeader = {
	headers: {
		Authorization: "Basic " + btoa("OPENVIDUAPP:" + OPENVIDU_SERVER_SECRET),
		"Content-Type": "application/json",
	},
};
