// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { exec } = require('child_process');
// // const data = require("../extracted_text.json")
// // const { convertCsvToJson } = require('./ProcessImagedata');
// // const { processQuestions } = require('./Generateoutput');

// const logWithTimestamp = (message) => {
//     console.log(`[${new Date().toISOString()}] ${message}`);
// };

// const clearImageFiles = (uploadPath) => {
//     return new Promise((resolve, reject) => {
//         fs.readdir(uploadPath, (err, files) => {
//             if (err) return reject(err);

//             const imageExtensions = ['.pdf', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
//             const imageFiles = files.filter(file =>
//                 imageExtensions.includes(path.extname(file).toLowerCase())
//             );

//             const deletePromises = imageFiles.map((file) =>
//                 fs.promises.unlink(path.join(uploadPath, file))
//             );

//             Promise.all(deletePromises)
//                 .then(() => {
//                     logWithTimestamp(`Cleared image files from ${uploadPath}`);
//                     resolve();
//                 })
//                 .catch(reject);
//         });
//     });
// };

// const deleteFolder = (folderPath) => {
//     return fs.promises.rm(folderPath, { recursive: true, force: true })
//         .then(() => logWithTimestamp(`Folder ${folderPath} deleted successfully.`))
//         .catch((err) => logWithTimestamp(`Error deleting folder ${folderPath}: ${err.message}`));
// };

// const createResultFolder = (name) => {
//     return fs.promises.mkdir(name, { recursive: true })
//         .then(() => logWithTimestamp(`Folder ${name} created successfully.`))
//         .catch((err) => logWithTimestamp(`Error creating folder ${name}: ${err.message}`));
// };

// // Function to run the main script
// const runMainScript = (qtype) => {
//     return new Promise((resolve, reject) => {
//         const mainScriptPath = path.resolve(__dirname, './pdftoexcel.py');
//         const pythonScript3 = `python ${mainScriptPath}`;

//         logWithTimestamp('Starting main script...');
//         exec(pythonScript3, { maxBuffer: 10 * 1024 * 1024 }, (error3, stdout3, stderr3) => {
//             if (error3) {
//                 logWithTimestamp(`Error executing main script: ${error3.message}`);
//                 console.log(error3, "e3");
//                 return reject(`Script 3 Error: ${error3.message}`);
//             }

//             if (stderr3) {
//                 if (stderr3.toLowerCase().includes("Premature end of JPEG file".toLowerCase())) {
//                     // Log as a warning but do not reject the promise
//                     logWithTimestamp(`Warning: ${stderr3}`);
//                 } else {
//                     // Reject for other stderr messages
//                     logWithTimestamp(`main script stderr: ${stderr3}`);
//                     return reject(`Script 3 stderr: ${stderr3}`);
//                 }
//             }

//             logWithTimestamp(`main script output: ${stdout3}`);
//             logWithTimestamp('main script completed successfully.');
//             resolve(stdout3);
//         });
//     });
// };

// const runPythonScripts = async (qtype) => {
//     try {
//         await runMainScript(qtype);

//     } catch (error) {
//         logWithTimestamp(`Error running scripts: ${error}`);
//     }
// };

// const extractQuestions = (data) => {
//     // Helper function to clean and format the input text
//     const cleanText = (text) => {
//         return text
//             .replace(/\\n/g, "\n") // Replace \n with actual newlines
//             .replace(/\\u2022/g, "•") // Replace \u2022 with •
//             .replace(/\\u2014/g, "—") // Replace \u2014 with —
//             .replace(/\\u/g, ""); // Remove any remaining \u
//     };

//     try {
//         // Clean the input text
//         const formattedText = cleanText(data);

//         // Split the text into blocks of questions using the marker (e.g., ʘ)
//         const questions = formattedText
//             .split(/\u0298/) // Split by the ʘ symbol
//             .map((block) => block.trim())
//             .filter((block) => block.length > 0); // Remove empty blocks

//         // Process each question block
//         const result = questions.map((questionBlock) => {
//             if (!questionBlock) return null; // Skip empty blocks

//             // Split into question and answer/explanation
//             const [questionPart, answerAndExplanation] = questionBlock.split(/Ans:/) || [];
//             if (!questionPart || !answerAndExplanation) return null; // Skip invalid blocks

//             // Split question text into lines
//             const lines = questionPart.split("\n");
//             const questionTitle = lines[0]?.trim(); // First line as the main question
//             const questionText = lines
//                 .slice(1) // Skip the title
//                 .filter((line) => !/^[a-d]\)/.test(line)) // Exclude options from this section
//                 .join(" "); // Combine remaining lines

//             // Extract options (lines starting with a), b), etc.)
//             const options = lines
//                 .filter((line) => /^[a-d]\)/.test(line)) // Match lines starting with a), b), etc.
//                 .map((line) => line.replace(/^[a-d]\)\s*/, "").trim());

//             // Extract answer and explanation
//             const [answer, explanationPart] = answerAndExplanation.split(/Explanation:/) || [];
//             const explanation = explanationPart ? explanationPart.trim() : "";

//             return {
//                 question: `${questionTitle} ${questionText}`.trim(),
//                 options: options || [],
//                 Answer: answer?.trim() || "",
//                 Explanation: explanation || "",
//             };
//         });

//         // Return the processed results
//         return result.filter((item) => item !== null); // Remove invalid or null items
//     } catch (error) {
//         console.error("Error processing text:", error);
//         return { error: "An error occurred while processing the text." };
//     }
// };
// // runPythonScripts()
// // runAlignScript()
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'application/pdf') {
//         cb(null, true);
//     } else {
//         cb(new Error('Only PDF files are allowed!'), false);
//     }
// };

// const upload = multer({ storage, fileFilter }).any();

// const uploadFiles = async (req, res) => {
//     const uploadPath = 'uploads/';
//     // const alignedImages = 'batch01_output/';
//     // const alignedImages200 = 'batch200_output/';
//     // const resultFolder = 'batch01_result';
//     // const existingFolder = 'outputs/';
//     // const generatedExcelFolder = 'batch01_result/Results';

//     try {
//         // logWithTimestamp('Starting cleanup process...');
//         await clearImageFiles(uploadPath);
//         // await clearImageFiles(alignedImages);
//         // await clearImageFiles(alignedImages200);
//         // await deleteFolder(resultFolder);
//         // // await creaateresultfolder(resultFolder);
//         // await deleteFolder(existingFolder);

//         logWithTimestamp('Cleanup process completed. Starting file upload...');
//         upload(req, res, async (err) => {
//             if (err) {
//                 logWithTimestamp(`File upload error: ${err.message}`);
//                 return res.status(500).json({ error: err.message });
//             }

//             try {
//                 // const answerKey = req.body?.excelData;
//                 // const getType = req.body?.type?.toLowerCase();
//                 logWithTimestamp('Files uploaded successfully. Running Python scripts...');

//                 const pythonOutput = await runPythonScripts();

//                 logWithTimestamp('Converting CSV to JSON...');
//                 // console.log(data, "json data")
//                 // const processedData = await extractQuestions(data);

//                 // logWithTimestamp('Processing questions...');
//                 // const finaloutput = await processQuestions(jsonData, answerKey, getType);

//                 // logWithTimestamp('Process completed successfully.');
//                 return res.status(200).json({
//                     message: 'Images uploaded and scripts executed successfully!',
//                     // pythonOutput,
//                     // files: req.files,
//                     // finaloutput,
//                 });
//             } catch (pythonError) {
//                 logWithTimestamp(`Error during script execution: ${pythonError}`);
//                 return res.status(500).json({ error: `Error executing Python scripts: ${pythonError}` });
//             }
//         });
//     } catch (cleanupError) {
//         logWithTimestamp(`Error during cleanup: ${cleanupError.message}`);
//         return res.status(500).json({ error: `Failed to complete cleanup: ${cleanupError.message}` });
//     }
// };

// module.exports = { uploadFiles };

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const extractQuestions = (data) => {
    // Helper function to clean and format the text
    const cleanText = (text) => {
        return text
            .replace(/\\n/g, "\n")  // Convert literal \n to actual newlines
            .replace(/\\u/g, "")     // Clean any remaining unicode escape sequences
            .replace(/\\uf0b7/g, '•'); // Replace \uf0b7 with actual bullet points
    };

    try {
        // Clean up the data text
        const formattedText = cleanText(data);

        // Split the text into blocks of questions based on the separator (ʘ character)
        const questions = formattedText
            .split(/\u0298/)  // Split using the Unicode ʘ character
            .map((block) => block.trim())
            .filter((block) => block.length > 0);  // Remove any empty blocks

        // Process each question block
        const result = questions.map((questionBlock) => {
            if (!questionBlock) return null;  // Skip empty blocks

            // Split into question part and answer/explanation part using the separator "Ans:"
            const [questionPart, answerAndExplanation] = questionBlock.split(/Ans:/) || [];
            if (!questionPart || !answerAndExplanation) return null;  // Skip invalid blocks

            // Split question into lines
            const lines = questionPart.split("\n");
            const questionTitle = lines[0]?.trim();  // First line as the main question
            const questionText = lines
                .slice(1)  // Exclude the first line (title)
                .filter((line) => !/^[a-d]\)/.test(line))  // Exclude option lines
                .join(" ");  // Join remaining lines

            // Extract options (lines starting with a), b), c), d))
            const options = lines
                .filter((line) => /^[a-d]\)/.test(line))  // Match lines starting with a), b), etc.
                .map((line) => line.replace(/^[a-d]\)\s*/, "").trim());

            // Extract answer and explanation
            const [answer, explanationPart] = answerAndExplanation.split(/Explanation:/) || [];
            const explanation = explanationPart ? explanationPart.trim() : "";

            // Clean up explanation (replace newlines and bullet points)
            const formattedExplanation = explanation
                .replace(/\n/g, ' ')  // Convert newlines to <br> for line breaks
                .replace(/•\s?/g, '• ')   // Ensure bullet points are followed by a space
                .replace(/\\uf0b7/g, '• ') // Ensure bullet points are properly replaced
                .replace(/\\n/g, ' '); // Replace newlines

            return {
                question: `${questionTitle} ${questionText}`.trim(),
                options: options || [],
                Answer: answer?.trim() || "",
                Explanation: formattedExplanation || "",
            };
        });

        // Filter out any null or invalid items
        return result.filter((item) => item !== null);
    } catch (error) {
        console.error("Error processing text:", error);
        return { error: "An error occurred while processing the text." };
    }
};



const logWithTimestamp = (message) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

const clearImageFiles = async (uploadPath) => {
    try {
        const files = await fs.promises.readdir(uploadPath);
        const imageExtensions = [".pdf", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
        const imageFiles = files.filter((file) =>
            imageExtensions.includes(path.extname(file).toLowerCase())
        );

        for (const file of imageFiles) {
            await fs.promises.unlink(path.join(uploadPath, file));
        }

        logWithTimestamp(`Cleared image files from ${uploadPath}`);
    } catch (err) {
        logWithTimestamp(`Error clearing image files: ${err.message}`);
        throw err;
    }
};

const runMainScript = (filePath, qtype) => {
    return new Promise((resolve, reject) => {
        const mainScriptPath = path.resolve(__dirname, "./pdftoexcel.py");
        const command = `python ${mainScriptPath} ${filePath} ${qtype}`;
        logWithTimestamp("Starting main script...");

        exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                logWithTimestamp(`Error executing main script: ${error.message}`);
                return reject(error.message);
            }

            if (stderr && !stderr.toLowerCase().includes("warning")) {
                logWithTimestamp(`Script stderr: ${stderr}`);
                return reject(stderr);
            }

            logWithTimestamp(`Script output: ${stdout}`);
            resolve(JSON.parse(stdout));  // Parse the JSON output from the script
        });
    });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed!"), false);
    }
};

const upload = multer({ storage, fileFilter }).any();

const uploadFiles = async (req, res) => {
    const uploadPath = "uploads/";
    try {
        logWithTimestamp("Starting cleanup process...");
        await clearImageFiles(uploadPath);

        logWithTimestamp("Cleanup completed. Starting file upload...");
        upload(req, res, async (err) => {
            if (err) {
                logWithTimestamp(`File upload error: ${err.message}`);
                return res.status(500).json({ error: err.message });
            }

            try {
                const file = req.files[0];
                if (!file) {
                    throw new Error("No file uploaded!");
                }

                const qtype = req.body.type || "default";
                logWithTimestamp("Running Python script...");
                const pythonOutput = await runMainScript(file.path, qtype);

                logWithTimestamp("Process completed successfully.");
                const output = extractQuestions(pythonOutput?.extracted_text);
                return res.status(200).json({
                    message: "Files uploaded and scripts executed successfully!",
                    // output: pythonOutput,
                    processedquestions: output
                });
            } catch (scriptError) {
                logWithTimestamp(`Error during script execution: ${scriptError}`);
                return res
                    .status(500)
                    .json({ error: `Script execution failed: ${scriptError}` });
            }
        });
    } catch (cleanupError) {
        logWithTimestamp(`Error during cleanup: ${cleanupError.message}`);
        return res
            .status(500)
            .json({ error: `Failed to complete cleanup: ${cleanupError.message}` });
    }
};

module.exports = { uploadFiles };
