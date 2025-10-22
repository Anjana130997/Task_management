// Configure multer for file uploads
import multer from "multer";
import path from "path";

// Store uploaded files in backend/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join("backend", "uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"));
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
