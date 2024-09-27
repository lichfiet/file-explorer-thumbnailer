const fluent = require("fluent-ffmpeg");

const ffmpegCreateThumbnail = async (filePathOnDisk, thumbnailPathOnDisk) => {

    // Get image dimensions
    let imageDimensions = [0, 0]
    fluent.ffprobe(filePathOnDisk, (err, metadata) => {
        if (err) { console.error(`Error Generating Thumbnail: ${err}`); return; }
        imageDimensions = [metadata.streams[0].width, metadata.streams[0].height];
    });

    // Generate thumbnail
    return new Promise((resolve, reject) => {
        fluent(filePathOnDisk)
        .keepPixelAspect()
        .size(imageDimensions[0] > imageDimensions[1] ? "300x?" : "?x300")
        .outputOptions(["-vframes 1"])
        .native()
        .videoCodec('png')
        .save(thumbnailPathOnDisk)
        .on("error", (err) => {
            console.error(`Error Generating Thumbnail: ${err}`);
            reject(err);
        })
        .on("end", () => {
            console.debug(`Thumbnail Generated for file: ${filePathOnDisk}, saved to ${thumbnailPathOnDisk}`);
            resolve(thumbnailPathOnDisk);
        })
    });
};

module.exports = ffmpegCreateThumbnail;