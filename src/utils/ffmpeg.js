const fluent = require("fluent-ffmpeg");

const generateThumbnailImage = async (filePathOnDisk, thumbnailPathOnDisk) => {
    return new Promise((resolve, reject) => {
        fluent(filePathOnDisk)
            .on("error", (err) => {
                console.error(`Error Generating Thumbnail: ${err}`);
                reject(err);
            })
            .on("end", () => {
                console.debug(`Thumbnail Generated for file: ${filePathOnDisk}, saved to ${thumbnailPathOnDisk}`);
                resolve(thumbnailPathOnDisk);
            })
            .keepPixelAspect()
            .size('300x300')
            .outputOptions(["-vframes 1"])
            .autoPad()
            .native()
            .videoCodec('png')
            .save(thumbnailPathOnDisk);
    });
};

module.exports = generateThumbnailImage;