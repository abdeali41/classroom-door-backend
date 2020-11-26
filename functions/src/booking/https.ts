import * as functions from "firebase-functions";
import * as methods from "./methods";
import SendResponse from "../libs/send-response";
import { verifySecret } from "../libs/generics";

/** BOOKING APIS **/

// CREATE BOOKING REQUEST
export const createBookingRequest = functions.https.onRequest(
	async (req, res) => {
		verifySecret(req, res);
		methods
			.createBookingRequest(req.body)
			.then(({ bookingRequest }) => {
				SendResponse(res).success("Booking created!", bookingRequest);
			})
			.catch((err) => SendResponse(res).failed(err));
	}
);

// FETCH BOOKING REQUEST
export const getBookingRequests = functions.https.onRequest(
	async (req: any, res: any) => {
		verifySecret(req, res);
		const { userId } = req.body;
		methods
			.getAllBookingsForUser({ userId })
			.then(({ bookings }) => {
				SendResponse(res).success("Bookings Found!", bookings);
			})
			.catch((err) => SendResponse(res).failed(err));
	}
);

// FETCH BOOKING REQUEST BY ID
export const getBookingRequestById = functions.https.onRequest(
	async (req, res) => {
		verifySecret(req, res);
		const { id } = req.body;
		methods
			.getBookingById(id)
			.then((booking) => {
				SendResponse(res).success("Booking Found!", booking);
			})
			.catch((err) => SendResponse(res).failed(err));
	}
);

// UPDATE BOOKING REQUEST
export const updateBookingRequest = functions.https.onRequest(
	async (req, res) => {
		verifySecret(req, res);
		methods
			.updateBookingRequest(req.body)
			.then(({ updatedBookingRequest }) => {
				SendResponse(res).success(
					"Updated Booking Request Success",
					updatedBookingRequest
				);
			})
			.catch((err) => SendResponse(res).failed(err));
	}
);

// TEACHER NON-AVAILABLE SLOTS
export const checkTeacherAvailability = functions.https.onRequest(
	async (req, res) => {
		verifySecret(req, res);
		methods
			.getTeacherAvailability(req.body)
			.then((data) => {
				SendResponse(res).success("Retrieved success", data);
			})
			.catch((err) => SendResponse(res).failed(err));
	}
);
