// tslint:disable-next-line: no-implicit-dependencies
import { Response } from "express";
import HttpStatus from "./http-status";

export const successTypes = {
	SHOW_MESSAGE: "SHOW_MESSAGE",
	SHOW_DATA: "SHOW_DATA",
};

const SendResponse = (response: Response) => {
	const send = (
		status: number,
		message: string,
		successType?: string,
		data?: Object
	) => {
		response.status(status).json({ successType, message, data });
	};

	const success = (message: string, data?: Object) => {
		send(HttpStatus.OK, message, successTypes.SHOW_DATA, data);
	};

	const failed = (message: string) => {
		send(HttpStatus.OK, message, successTypes.SHOW_MESSAGE);
	};

	const error = (message: string) => {
		send(HttpStatus.INTERNAL_SERVER_ERROR, message);
	};

	return { success, failed, error };
};

export default SendResponse;
