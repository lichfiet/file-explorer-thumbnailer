const log = require("../middlewares/log.js");
const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { Readable } = require('stream');
const fs = require('fs');

/**
 * Local Vars
 */

const s3Client = new S3Client({
	log: log,
})
// Config for S3 auth is stored in .env file, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

class s3GetRequest {
	constructor(bucket, key ) {
		if (bucket === undefined || key === undefined) {
			throw new Error("Bucket and Key must be defined");
		} else if (typeof bucket !== "string" || typeof key !== "string") {
			throw new Error("Bucket and Key must be strings");
		} else if (bucket.length === 0 || key.length === 0) {
			throw new Error("Bucket and Key must not be empty strings");
		} else if (bucket.includes("/")) {
			throw new Error("Bucket cannot contain forward slashes");
		}
		
		this.bucket = bucket;
		this.key = decodeURIComponent(key);
	}
}

/**
 * Public Vars
 */
const getFile = async (bucketName, key) => {
	log.debug(`Requesting file with key ${key} from bucket ${bucketName}`);
	
	const requestObject = new s3GetRequest(bucketName, key);

	const getFile = async () => {

		const response = await s3Client.send(new GetObjectCommand({ Bucket: requestObject.bucket, Key: requestObject.key }));

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
		fs.writeFileSync(process.env.THUMBNAIL_FILES_LOCATION + key, await getFile());
	} catch (err) {
		log.error(`Error Occurred Requesting File From Bucket: ${err}`);
		return err;
	} finally {
		log.debug(`S3 Get for Filename: ${key} Completed`);
	}
};

// path.join(__dirname, 'relative path to file from usr/app/src/')
const uploadFile = async (bucketName, key, filePathOnDisk) => {
	log.debug(`Uploading file by key: ${key} to S3 Bucket`);

	const uploadFile = async () => {
		
		const response = await s3Client.send(
			new PutObjectCommand({ 
				Bucket: bucketName, 
				Key: decodeURI(key), 
				Body: fs.createReadStream(filePathOnDisk)
			})
		);
		
		const responseCode = await response.$metadata.httpStatusCode;

		return (await responseCode === 200) ? "File successfully uploaded to S3 Bucket" : () => { throw new Error("Error uploading file to S3 Bucket") };
	};

	try {
		return uploadFile();
	} catch (err) {
		log.error(`Error Occurred Uploading File To Bucket: ${err}`);
		return err;
	} finally {
		log.debug(`S3 Upload for Filename: ${key} Completed`);
	}
};


module.exports = s3 = {
		getFile,
		uploadFile
	};
