import axios from "axios";
import { openviduRequestHeader, OPENVIDU_SERVER_URL } from "../libs/Openvidu";

export const createSession = (sessionId: string) => {
	return new Promise((resolve) => {
		const data = JSON.stringify({ customSessionId: sessionId });
		axios
			.post(OPENVIDU_SERVER_URL + "/api/sessions", data, openviduRequestHeader)
			.then((response) => {
				console.log("CREATE SESSION", response);
				resolve(response.data.id);
			})
			.catch((response) => {
				console.log(response);
				const error = { ...response };
				if (!error.response) {
					console.error("Network error: ", error);
					if (error.request && error.request._response) {
						console.error("Response of the request: ", error.request._response);
					}
				} else if (
					error.response &&
					error.response.status &&
					error.response.status === 409
				) {
					console.log("RESOLVING WITH SESSIONID, 409");
					resolve(sessionId);
				} else {
					console.warn(
						"No connection to OpenVidu Server. This may be a certificate error at " +
							OPENVIDU_SERVER_URL
					);

					console.log(
						"No connection to OpenVidu Server.",
						'This may be a certificate error at "' +
							OPENVIDU_SERVER_URL +
							'"\n\nClick OK to navigate and accept it. ' +
							'If no certificate warning is shown, then check that your OpenVidu Server is up and running at "' +
							OPENVIDU_SERVER_URL +
							'"'
					);
					console.log(OPENVIDU_SERVER_URL + "/accept-certificate");
				}
			});
	});
};

export const createToken = (sessionId: string) => {
	return new Promise((resolve, reject) => {
		const data = JSON.stringify({ session: sessionId });
		axios
			.post(OPENVIDU_SERVER_URL + "/api/tokens", data, openviduRequestHeader)
			.then((response) => {
				console.log("TOKEN", response);
				resolve(response.data.token);
			})
			.catch((error) => reject(error));
	});
};
export const getOpenviduToken = async (params: any) => {
	const { sessionId } = params;
	try {
		const sId: any = await createSession(sessionId);
		const token: any = await createToken(sId);
		return { token };
	} catch (error) {
		console.log(error);
		return { message: "Unable to connect to the server" };
	}
};
