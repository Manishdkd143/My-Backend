import multer from "multer";
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './public/temp'); // Specify the destination folder
      },
      filename: function (req, file, cb) {
        cb(null,  file.originalname); // Define the filename
      }
    });
 export const upload = multer({ storage: storage });
