const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExt =
      file.originalname && file.originalname.toLowerCase().endsWith(".pdf");

    if (isPdfMime && isPdfExt) {
      cb(null, true);
    } else {
      const err = new Error("Invalid file type. Only PDF files are allowed.");
      err.code = "INVALID_FILE_TYPE";
      cb(err, false);
    }
  },
});

const uploadResume = {
  single: (fieldName = "resume") => (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message:
              "File size exceeds the 10MB limit. Please upload a smaller PDF.",
          });
        }
        if (err.code === "INVALID_FILE_TYPE" || err.message?.includes("PDF")) {
          return res.status(400).json({
            message: "Invalid file type. Only PDF files are allowed.",
          });
        }
        return res.status(400).json({
          message: err.message || "Failed to process uploaded file.",
        });
      }
      next();
    });
  },
};

module.exports = uploadResume;