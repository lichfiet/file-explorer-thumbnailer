const log = require("../middlewares/log.js");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require('stream');

/**
 * Local Vars
 */

const s3Client = new S3Client({
	log: log,
})
// Config for S3 auth is stored in .env file, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

class s3Request {
	constructor(bucket, key ) {
		if (bucket === undefined || key === undefined) {
			throw new Error("Bucket and Key must be defined");
		} else if (typeof bucket !== "string" || typeof key !== "string") {
			throw new Error("Bucket and Key must be strings");
		} else if (bucket.length === 0 || key.length === 0) {
			throw new Error("Bucket and Key must not be empty strings");
		} else if (bucket.includes(" ") || key.includes(" ")) {
			throw new Error("Bucket and Key cannot contain spaces");
		} else if (bucket.includes("/")) {
			throw new Error("Bucket cannot contain forward slashes");
		}
		
		this.bucket = bucket;
		this.key = key;
	}
}

/**
 * Public Vars
 */

const handleErrors = (err) => {
	log.error(`Error Occurred Requesting File From Bucket: ${err}`);

	const rawStatus = err.$metadata.httpStatusCode;
	const rawMessage = 'Unable To Fulfill Request: ' + err.message;
	const status = rawStatus === undefined ? 500 : rawStatus;
	const message = rawMessage === undefined ? "Error Occurred Handling File Request to/from Bucket" : rawMessage;

	return { status: status, message: message };
};

const getFile = async (bucketName, key) => {
	log.debug(`Requesting file with key ${key} from bucket ${bucketName}`);

	const decodedFileName = decodeURIComponent(key);

	const getFile = async (bucketName, key) => {

		const response = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: decodedFileName }));

		const reponseToStream = Readable.from(response.Body);
		const concatStream = async (stream) => {
			const chunks = [];
			for await (const chunk of stream) {
				chunks.push(chunk);
			}
			return Buffer.concat(chunks);
		};
		return concatStream(reponseToStream);
	};


	try {
		return await getFile(bucketName, key);
	} catch (err) {
		return handleErrors(err);
	} finally {
		log.debug(`S3 Get for Filename: ${key} Completed`);
	}
};

const uploadFile = async (fileData, fileName) => {
	log.debug(`Uploading file by filename: ${fileName} to S3 Bucket`);

	const decodedFileName = decodeURI(fileName);

	const uploadFile = async (fileData, decodedFileName) => {
		const requestParams = { Bucket: "file-explorer-s3-bucket", Key: decodedFileName, Body: fileData };
		const response = await s3Client.send(new PutObjectCommand(requestParams));
		const responseCode = await response.$metadata.httpStatusCode;

		return (await responseCode === 200) ? "File successfully uploaded to S3 Bucket" : () => { throw new Error("Error deleting file from S3 Bucket") };
	}

	try {
		return uploadFile(fileData, decodedFileName);
	} catch (err) {
		return handleErrors(err);
	} finally {
		log.debug(`S3 Upload for Filename: ${fileName} Completed`);
	}
};


module.exports = s3 = {
		getFile,
		uploadFile
	};
