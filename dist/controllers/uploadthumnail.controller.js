"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postThumbnail = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const postThumbnail = async (req, res) => {
    try {
        if (req.user?.plan !== "pro") {
            res.status(403).json({
                message: "Upgrade to Pro to upload custom course thumbnails",
            });
            return;
        }
        const { fileType } = req.body;
        if (!fileType) {
            res.status(400).json({ message: "fileType is required" });
            return;
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(fileType)) {
            res.status(400).json({
                message: "Only JPEG, PNG, and WebP images are allowed",
            });
            return;
        }
        const extension = fileType.split("/")[1];
        const key = `thumbnails/${req.user._id}/${(0, uuid_1.v4)()}.${extension}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            ContentType: fileType,
        });
        // Presigned URL expires in 5 minutes
        const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: 300 });
        // The final public URL of the uploaded image
        const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        res.status(200).json({
            presignedUrl,
            publicUrl,
            key,
        });
    }
    catch (error) {
        console.error("Error generating presigned URL:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.postThumbnail = postThumbnail;
