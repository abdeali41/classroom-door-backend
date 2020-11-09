import { CLASSROOMDOOR_WEB_URL } from "./constants";

export const sessionRequestedToTutor = ({
	teacherId,
	studentName,
	teacherName,
}) => {
	return {
		toUids: [teacherId],
		template: {
			name: "session-request-to-tutor",
			data: {
				teacherName,
				studentName,
				appUrl: CLASSROOMDOOR_WEB_URL,
			},
		},
	};
};

export const passwordChangeRequest = ({
	userId,
	userName,
	passwordResetLink,
}) => {
	return {
		toUids: [userId],
		message: {
			subject: "Password Change Request",
			html: `<p dir="ltr" style="line-height:1.8666666666666667;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},</span></p>background
			<p><br></p>
			<p dir="ltr" style="line-height:1.8666666666666667;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">We have received your password reset request.</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.8666666666666667;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Please click the following link to reset your password:</span><a style="font-size:12pt;font-family:Arial;color:#ffff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${passwordResetLink}">&nbsp;${passwordResetLink}</a></p>
			<p dir="ltr" style="line-height:1.8666666666666667;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">If you did not request a password reset, please disregard this email or contact&nbsp;</span><a href="mailto:support@theclassroomdoor.com" style="text-decoration:none;"><span style="font-size:12pt;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">support@theclassroomdoor.com</span></a><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.8666666666666667;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,</span></p>
			<p dir="ltr" style="line-height:1.8666666666666667;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const passwordChangeConfirmation = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Password successfully changed",
			html: `<p dir="ltr" style="line-height:1.8666666666666667;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">You have successfully changed your password. If you did not change your password, please contact&nbsp;</span><a href="mailto:support@theclassroomdoor.com" style="text-decoration:none;"><span style="font-size:12pt;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">support@theclassroomdoor.com</span></a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const termsOfUseUpdated = ({
	userId,
	userName,
	termsLink,
	effectiveDate,
}) => {
	return {
		toUids: [userId],
		message: {
			subject: "Update to the Terms of Use",
			html: `<p dir="ltr" style="line-height:1.8666666666666667;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">To continue providing the optimal academic support, we have updated our Terms of Use to reflect new policies and processes effective [${effectiveDate}]</span>. Review these changes here &nbsp;</span><a style="font-size:12pt;font-family:Arial;color:#ffff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${termsLink}">${termsLink}.</a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">If you have any questions or comments, please reach out to us directly at&nbsp;</span><a href="mailto:support@theclassroomdoor.com" style="text-decoration:none;"><span style="font-size:12pt;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">support@theclassroomdoor.com</span></a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.8666666666666667;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#231f20;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const accountDeletion = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Sorry to See You Go",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Your account has been successfully cancelled. If you did not request cancellation and feel that this is a mistake, please contact&nbsp;</span><a href="mailto:support@theclassroomdoor.com" style="text-decoration:none;"><span style="font-size:12pt;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">support@theclassroomdoor.com</span></a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const studentAccountCreation = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Welcome to The Classroom Door",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Thank you for creating your account on The Classroom Door!&nbsp;</span><span style="font-size:13pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">TCD&rsquo;s team is here to help you set academic goals and powerfully achieve them.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:13pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Take the next step in your academic journey today!&nbsp;</span><a style="font-size:13pt;font-family:Arial;color:#000000;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${CLASSROOMDOOR_WEB_URL}">${CLASSROOMDOOR_WEB_URL}</a></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const teacherAccountCreation = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Welcome to The Classroom Door",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Thank you for creating your account on The Classroom Door!&nbsp;</span><span style="font-size:13pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">You are joining a team of educators dedicated to helping students set academic goals and powerfully achieve them.</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const backgroundCheckPlug = ({
	userId,
	userName,
	backgroundCheckLink,
}) => {
	return {
		toUids: [userId],
		message: {
			subject: "Strengthen your profile with a background check!",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">For just $15.99, you can order a background check for yourself and verify your credentials. Boost your exposure to potential clients and earn more.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Verified tutors and advisors are more likely to book sessions! Order yours here:&nbsp;</span><a style="font-size:12pt;font-family:Arial;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${backgroundCheckLink}">${backgroundCheckLink}&nbsp;</a></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">You can review our background check policy at&nbsp;</span><a style="font-size:12pt;font-family:Arial;color:#254fa5;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="theclassroomdoor.com/backgroundcheckpolicy">theclassroomdoor.com/backgroundcheckpolicy</a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team&nbsp;</span></p>`,
		},
	};
};

export const paymentMethodUpdated = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Payment Method Updated",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">A new payment method has been added to your account. If you did not request this, kindly contact</span><a href="mailto:support@theclassroomdoor.com" style="text-decoration:none;"><span style="font-size:12pt;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">support@theclassroomdoor.com</span></a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All our best,</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};
export const bankingInfoUpdated = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Banking Information Updated",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Your banking information has been added. If you did not request this, please contact&nbsp;</span><a href="mailto:support@theclassroomdoor.com" style="text-decoration:none;"><span style="font-size:12pt;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">support@theclassroomdoor.com</span></a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All our best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const paymentProcessed = ({ userId, userName, receiptUrl }) => {
	return {
		toUids: [userId],
		template: {
			name: "payment-processed",
			data: {
				userName,
				receiptUrl,
			},
		},
	};
};

export const paymentDeposited = ({ userId, userName, receiptUrl }) => {
	return {
		toUids: [userId],
		template: {
			name: "payment-deposited",
			data: {
				userName,
				receiptUrl,
			},
		},
	};
};

export const paymentFailed = ({ userId, userName, amount }) => {
	return {
		toUids: [userId],
		template: {
			name: "payment-deposited",
			data: {
				userName,
				amount,
				appUrl: CLASSROOMDOOR_WEB_URL,
			},
		},
	};
};

export const backgroundCheckOrderedStudent = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Background Check Ordered",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Your background check order has been processed. The tutor/advisor has a week to authorize the request.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">We will notify you as soon as the background check is processed.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team&nbsp;</span></p>`,
		},
	};
};

export const backgroundCheckOrderedTutor = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Background Check Requested",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">A student has requested a background check through Asurint. You will receive an authorization request from Asurint shortly.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">You must provide an authorization for a background check when requested by Asurint within one week (7 days) of the original request. Following authorization, Asurint will conduct a National Criminal Database search which will return results limited to the following:</span></p>
			<ul style="margin-top:0;margin-bottom:0;">
				<li dir="ltr" style="list-style-type:disc;font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;">
					<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Social Security number trace (verifying the SSN provided is a valid number and not on the death index only)</span></p>
				</li>
				<li dir="ltr" style="list-style-type:disc;font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;">
					<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Felony and misdemeanor convictions within the past seven (7) years, including sex crime convictions (misdemeanor or felony)</span></p>
				</li>
				<li dir="ltr" style="list-style-type:disc;font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;">
					<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Sex Offender Registry &amp; Global Watchlist Search (regardless of when the conviction occurred)</span></p>
				</li>
				<li dir="ltr" style="list-style-type:disc;font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;">
					<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Educational Background Verification</span></p>
				</li>
			</ul>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">When a background check is requested or being processed by Asurint, your account will indicate &ldquo;Background Check In-Progress.&rdquo;&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">TCD will deactivate any account if the &ldquo;Background Check In-Progress&rdquo; status continues for over 25 days. &nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">You can review TCD&rsquo;s background check policy here:&nbsp;</span><a style="font-size:12pt;font-family:Arial;color:#254fa5;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="theclassroomdoor.com/backgroundcheckpolicy">theclassroomdoor.com/backgroundcheckpolicy</a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">. &nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team&nbsp;</span></p>`,
		},
	};
};

export const backgroundCheckPassedStudent = ({
	userId,
	userName,
	teacherName,
}) => {
	return {
		toUids: [userId],
		message: {
			subject: "Your tutor is verified on The Classroom Door!",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Your background check request for ${teacherName} was successful. They are now verified on The Classroom Door.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Request a session with them today!</span><a style="font-size:12pt;font-family:Arial;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${CLASSROOMDOOR_WEB_URL}">${CLASSROOMDOOR_WEB_URL}</a></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const backgroundCheckPassedTutor = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "You’re verified on The Classroom Door!",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Congratulations! You passed your background check and are now a verified educator on The Classroom Door!&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const backgroundCheckFailedStudent = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Background Check does not meet TCD’s Requirements",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The background check you ordered did not meet the requirements of The Classroom Door. Your security is our foremost priority and access to high quality education is our second.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">We have many verified tutors who can&rsquo;t wait to help you on your education journey. Find one today!&nbsp;</span><a style="font-size:12pt;font-family:Arial;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${CLASSROOMDOOR_WEB_URL}">${CLASSROOMDOOR_WEB_URL}</a></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const backgroundCheckFailedTutor = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Background Check Failed",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The results of your background check</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">&nbsp;</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">do not meet the requirements of The Classroom Door and your account has been deactivated. TCD reserves the right to</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">&nbsp;</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">deactivate the account of any Tutor who does not pass a background check.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">See TCD&rsquo;s background check for more information:&nbsp;</span><a style="font-size:12pt;font-family:Arial;color:#254fa5;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="theclassroomdoor.com/backgroundcheckpolicy">theclassroomdoor.com/backgroundcheckpolicy</a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">. &nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All disputes regarding the results of the background check must be directed to Asurint, Inc. at&nbsp;</span><a href="mailto:compliance@asurint.com" style="text-decoration:none;"><span style="font-size:12pt;font-family:Arial;color:#1155cc;background-color:#ffffff;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">compliance@asurint.com</span></a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">. Disputes regarding the deactivation or removal of a Tutor from the TCD platform must be directed to TCD at&nbsp;</span><a href="mailto:support@theclassroomdoor.com" style="text-decoration:none;"><span style="font-size:12pt;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">support@theclassroomdoor.com</span></a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team</span></p>`,
		},
	};
};

export const sessionBookedStudent = ({
	userId,
	studentName,
	teacherName,
	subjects,
	sessions,
}) => {
	return {
		toUids: [userId],
		template: {
			name: "session-booked-student",
			data: {
				studentName,
				teacherName,
				subjects,
				sessions,
				appUrl: CLASSROOMDOOR_WEB_URL,
			},
		},
	};
};

export const sessionBookedTutor = ({
	userId,
	studentName,
	teacherName,
	sessions,
}) => {
	return {
		toUids: [userId],
		template: {
			name: "session-booked-tutor",
			data: {
				studentName,
				teacherName,
				sessions,
				appUrl: CLASSROOMDOOR_WEB_URL,
			},
		},
	};
};

export const tutorSessionFollowup = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: `${userName}, we’d love to hear about your experience on The Classroom Door!`,
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">You have completed your session! Our tutors and advisors appreciate your feedback, kindly rate how the session went and what made your tutor/advisor great! </span><a style="font-size:12pt;font-family:Arial;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${CLASSROOMDOOR_WEB_URL}">${CLASSROOMDOOR_WEB_URL}</a></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Click here to book more sessions:&nbsp;</span><a style="font-size:12pt;font-family:Arial;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${CLASSROOMDOOR_WEB_URL}">${CLASSROOMDOOR_WEB_URL}</a></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team&nbsp;</span></p>`,
		},
	};
};
export const reviewSubmitted = ({ userId, userName }) => {
	return {
		toUids: [userId],
		message: {
			subject: "Someone submitted a new review!",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${userName},</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Someone has submitted a new review on your tutor profile. See what they said&nbsp;</span><a style="font-size:12pt;font-family:Arial;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"href="${CLASSROOMDOOR_WEB_URL}">${CLASSROOMDOOR_WEB_URL}</a>.</p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team&nbsp;</span></p>`,
		},
	};
};
export const sessionRemainderStudent = ({
	userId,
	studentName,
	teacherName,
	sessionTime,
}) => {
	return {
		toUids: [userId],
		message: {
			subject: `Reminder: One day until your session with ${teacherName} !`,
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${studentName},&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">This is a reminder that you have a session with&nbsp;</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">${teacherName}</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">&nbsp;for </span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">${sessionTime}</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Have you shared your learning goals with </span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">${teacherName}</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">? Send them a message to ensure you make the most of your time together!&nbsp;</span><a style="font-size:12pt;font-family:Arial;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${CLASSROOMDOOR_WEB_URL}">${CLASSROOMDOOR_WEB_URL}</a></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">If you need to cancel, please be sure to do so in accordance with your tutor or advisor&rsquo;s &nbsp;cancellation policy which is found on their profile.</span><a style="font-size:12pt;font-family:Arial;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${CLASSROOMDOOR_WEB_URL}">${CLASSROOMDOOR_WEB_URL}</a></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team&nbsp;</span></p>`,
		},
	};
};
export const sessionRemainderTutor = ({
	userId,
	studentName,
	teacherName,
	sessionTime,
}) => {
	return {
		toUids: [userId],
		message: {
			subject: `Reminder: One day until your session with ${studentName}!`,
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${teacherName},</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">This is a reminder that you have a session with&nbsp;</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">${studentName}</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">&nbsp;for </span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">${sessionTime}</span><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">.</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Reach out to ${studentName} with any questions or to outline your goals for the session.&nbsp;</span><a style="font-size:12pt;font-family:Arial;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;" href="${CLASSROOMDOOR_WEB_URL}">${CLASSROOMDOOR_WEB_URL}</a></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">If you need to cancel, please be sure to do so in accordance with your cancellation policy. Review your policy here: </span><a style="font-size:12pt;font-family:Arial;color:#00ff00;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"href="${CLASSROOMDOOR_WEB_URL}">${CLASSROOMDOOR_WEB_URL}</a><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">&nbsp;.&nbsp;</span></p>
			<p><br></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
			<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team&nbsp;</span></p>`,
		},
	};
};

export const sessionCancelledByTutorStudent = ({
	userId,
	studentName,
	teacherName,
}) => {
	return {
		toUids: [userId],
		template: {
			name: "session-cancelled-by-tutor-student",
			data: {
				studentName,
				teacherName,
				appUrl: CLASSROOMDOOR_WEB_URL,
			},
		},
	};
};
export const sessionCancelledByTutorTutor = ({
	userId,
	studentName,
	teacherName,
}) => {
	return {
		toUids: [userId],
		template: {
			name: "session-cancelled-by-tutor-tutor",
			data: {
				studentName,
				teacherName,
				appUrl: CLASSROOMDOOR_WEB_URL,
			},
		},
	};
};

export const sessionCancelledByStudentStudent = ({
	userId,
	studentName,
	teacherName,
}) => {
	return {
		toUids: [userId],
		template: {
			name: "session-cancelled-by-student-student",
			data: {
				studentName,
				teacherName,
				appUrl: CLASSROOMDOOR_WEB_URL,
			},
		},
	};
};

export const sessionCancelledByStudentTutor = ({
	userId,
	studentName,
	teacherName,
}) => {
	return {
		toUids: [userId],
		template: {
			name: "session-cancelled-by-student-tutor",
			data: {
				studentName,
				teacherName,
				appUrl: CLASSROOMDOOR_WEB_URL,
			},
		},
	};
};
export const bookingSuggestionStudent = ({
	userId,
	studentName,
	teacherName,
}) => {
	return {
		toUids: [userId],
		template: {
			name: "booking-suggestion-student",
			data: {
				studentName,
				teacherName,
				appUrl: CLASSROOMDOOR_WEB_URL,
			},
		},
	};
};

export const bookingSuggestionTutor = ({
	userId,
	studentName,
	teacherName,
}) => {
	return {
		toUids: [userId],
		template: {
			name: "booking-suggestion-tutor",
			data: {
				studentName,
				teacherName,
				appUrl: CLASSROOMDOOR_WEB_URL,
			},
		},
	};
};
