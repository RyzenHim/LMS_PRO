const cloudinary = require("../config/cloudinary");

const uploadBufferToCloudinary = (buffer, folder, resource_type = "image") => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    resource_type,
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            )
            .end(buffer);
    });
};

module.exports = uploadBufferToCloudinary;
