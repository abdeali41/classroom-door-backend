export const notificationTypes = {
	text: "text",
	image: "image",
};

export interface Notification {
	senderId: string;
	receiverIds: Array<string | null>;
	title: string;
	message: string;
	type: string;
	readAt: number | null;
	sentAt: object;
	createdAt: object;
}

export const capitalizeName = (firstName: String, lastName: String) => {
	return `${
		firstName[0].toUpperCase() + firstName.slice(1).toLowerCase()
	} ${lastName.substring(0, 1)}.`;
};
