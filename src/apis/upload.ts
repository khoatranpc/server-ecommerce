import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import { config } from "dotenv";
config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadController = {
  uploadSingle: async (req: Request | any, res: Response) => {
    try {
      const fileBase64 = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await cloudinary.uploader.upload(fileBase64, {
        folder: "ecommerce-dev",
      });

      res.status(200).json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        error: error,
      });
    }
  },

  uploadMultiple: async (req: Request | any, res: Response) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const files = Array.isArray(req.files) ? req.files : [req.files];
      const uploadPromises = files.map((file: any) =>
        cloudinary.uploader.upload(file.path, {
          folder: "ecommerce-dev",
        })
      );

      const results = await Promise.all(uploadPromises);
      const uploadedFiles = results.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
      }));

      res.status(200).json({
        success: true,
        files: uploadedFiles,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error uploading files",
        error: error,
      });
    }
  },

  destroy: async (req: Request, res: Response) => {
    try {
      const { public_id } = req.body;
      if (!public_id) {
        return res.status(400).json({
          success: false,
          message: "No public_id provided",
        });
      }

      const result = await cloudinary.uploader.destroy(public_id);
      res.status(200).json({
        success: true,
        message: "File deleted successfully",
        result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error deleting file",
        error: error,
      });
    }
  },
};

export default uploadController;
