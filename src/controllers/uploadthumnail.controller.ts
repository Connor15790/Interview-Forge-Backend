import { Response } from "express";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

import { AuthRequest } from "../middleware/verifyToken";

const s3 = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

export const postThumbnail = async (req: AuthRequest, res: Response) => {
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
        const key = `thumbnails/${req.user._id}/${uuidv4()}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET as string,
            Key: key,
            ContentType: fileType,
        });

        // Presigned URL expires in 5 minutes
        const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

        // The final public URL of the uploaded image
        const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        res.status(200).json({
            presignedUrl,
            publicUrl,
            key,
        });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}