import * as functions from "firebase-functions";
import * as methods from "./methods";
import SendResponse from "../libs/send-response";

/** BOOKING APIS **/

// CREATE BOOKING REQUEST
export const createBookingRequest = functions.https.onRequest(
	async (req, res) => {
		methods
			.createBookingRequest(req.body)
			.then(({ bookingRequest }) => {
				SendResponse(res).success("Booking created!", bookingRequest);
			})
			.catch((err) => {
				console.log("err", err);
				SendResponse(res).failed("Booking not created");
			});
	}
);

// FETCH BOOKING REQUEST
export const getBookingRequests = functions.https.onRequest(
	async (req: any, res: any) => {
		const { userId } = req.body;
		methods
			.getAllBookingsForUser({ userId })
			.then(({ bookings }) => {
				SendResponse(res).success("Bookings Found!", bookings);
			})
			.catch((err) => {
				console.log("err", err);
				SendResponse(res).failed("Bookings NOT Found");
			});
	}
);

// FETCH BOOKING REQUEST BY ID
export const getBookingRequestById = functions.https.onRequest(
	async (req, res) => {
		const { id } = req.body;
		methods
			.getBookingById(id)
			.then((booking) => {
				SendResponse(res).success("Booking Found!", booking);
			})
			.catch((err) => {
				console.log("err", err);
				SendResponse(res).failed("Booking NOT Found");
			});
	}
);

// UPDATE BOOKING REQUEST
export const updateBookingRequest = functions.https.onRequest(
	async (req, res) => {
		methods
			.updateBookingRequest(req.body)
			.then(({ updatedBookingRequest }) => {
				SendResponse(res).success(
					"Updated Booking Request Success",
					updatedBookingRequest
				);
			})
			.catch((err) => {
				console.log("err", err);
				SendResponse(res).failed("Updated Booking Request Failed");
			});
	}
);
