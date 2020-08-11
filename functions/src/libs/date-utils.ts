import * as moment from "moment";

type dateType = string | number | moment.Moment;

export const DateFormats = {
	SEMILONG_DATE: "ddd MMMM DD YYYY",
	LONG_DATE: "dddd, MMMM D, YYYY",
	TIME_IN_MERIDIAN: "hh:mm A",
	SHORT_DATE: "DD/MM/YYYY",
	FULL_DATE_TIME: "YYYY-MM-DD HH:mm",
	TIME_IN_SECONDS: "hh:mm:ss",
	TIME_IN_24: "HH:mm",
	TIME_IN_SECONDS_24: "HH:mm:ss",
};

export const formatDate = (date: dateType | number, dateFormat: string) =>
	moment(date).format(dateFormat);

export const getTimestamp = () => moment.utc().valueOf();

export const isToday = (date: dateType) =>
	moment(date).isSame(new Date(), "day");

export const isBetweenInterval = (
	startTime: dateType,
	endTime: dateType,
	time = getTimestamp()
) => {
	const midTime = moment(
		formatDate(time, DateFormats.TIME_IN_SECONDS_24),
		DateFormats.TIME_IN_SECONDS_24
	);

	return (
		midTime.isBetween(
			moment(
				formatDate(startTime, DateFormats.TIME_IN_SECONDS_24),
				DateFormats.TIME_IN_SECONDS_24
			),
			moment(
				formatDate(endTime, DateFormats.TIME_IN_SECONDS_24),
				DateFormats.TIME_IN_SECONDS_24
			)
		) ||
		midTime.isSame(
			moment(
				formatDate(startTime, DateFormats.TIME_IN_SECONDS_24),
				DateFormats.TIME_IN_SECONDS_24
			)
		) ||
		midTime.isSame(
			moment(
				formatDate(endTime, DateFormats.TIME_IN_SECONDS_24),
				DateFormats.TIME_IN_SECONDS_24
			)
		)
	);
};
