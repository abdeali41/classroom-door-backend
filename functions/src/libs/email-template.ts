import { CLASSROOMDOOR_WEB_URL } from "./constants";

export const sessionRequestedToTutor = ({
	teacherId,
	studentName,
	teacherName,
}) => {
	return {
		toUids: [teacherId],
		message: {
			subject: "Session Requested",
			html: `<p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Hi ${teacherName},&nbsp;</span></p>
            <p><br></p>
            <p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">${studentName} has requested a session with you!&nbsp;</span></p>
            <p><br></p>
            <p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><a style="font-size:12pt;font-family:Arial;color:#000000;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">${CLASSROOMDOOR_WEB_URL}</a></p>
            <p><br></p>
            <p><br></p>
            <p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">All the best,&nbsp;</span></p>
            <p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:12pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">The Classroom Door Team&nbsp;</span></p>`,
		},
	};
};
