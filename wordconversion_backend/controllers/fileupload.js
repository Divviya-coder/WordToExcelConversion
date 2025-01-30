const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const extractQuestions = (data) => {
    const cleanText = (text) => {
        return text
            .replace(/\\n/g, "\n")  // Convert literal \n to actual newlines
            .replace(/\\u/g, "")     // Clean Unicode escape sequences
            .replace(/\\uf0b7/g, '•') // Replace \uf0b7 with bullet points
            .replace(//g, '•');  // Fix incorrect bullet representation
    };

    try {
        const formattedText = cleanText(data);
        const questions = formattedText
            .split(/\u0298\s*/) // Split the input text into individual questions
            .map((block) => block.trim())
            .filter((block) => block.length > 0);
        let previousQuestion = null;

        const result = questions.map((questionBlock) => {
            if (!questionBlock) return null;

            // Split question and answer part by 'Ans:'
            const [questionPart, answerAndExplanation] = questionBlock.split(/(Ans:|Answer:)\s*/);
            // const [questionPart, answerAndExplanation] = questionBlock.split(/Ans:\s*/);
            if (!questionPart || !answerAndExplanation) return null;

            const lines = questionPart.split("\n").map(line => line.trim()).filter(line => line);

            let questionTitle = "";
            let options = [];
            let questionTextLines = [];
            let optionPattern = /^[a-dA-D]\)\s+/; // Pattern to detect options like 'a)', 'b)', etc.

            let isOption = false; // Flag to indicate when options start
            let currentOption = "";

            // Iterate over each line
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                // Check if the line matches the option pattern (e.g., a), b), etc.)
                if (optionPattern.test(line)) {
                    // Push previous option (if exists)
                    if (currentOption) {
                        options.push(currentOption);
                    }
                    // Start a new option
                    currentOption = line;
                    isOption = true;
                } else if (isOption) {
                    // If options have started, append to the current option
                    currentOption += " " + line;
                } else {
                    // If options haven't started yet, treat this as part of the question text
                    questionTextLines.push(line);
                }
            }

            // Push the last option if it exists
            if (currentOption) {
                options.push(currentOption);
            }

            // The first line is the question title
            questionTitle = questionTextLines[0] || "";
            const questionText = questionTextLines.slice(1).join("\n").trim(); // The rest is the question body

            // Extract the correct answer (typically the first letter in 'Ans: A')
            const answerMatch = answerAndExplanation.match(/[A-D]/);
            const answer = answerMatch ? answerMatch[0] : "";

            // Extract explanation (after 'Explanation: ')
            const explanationMatch = answerAndExplanation.split(/Explanation:?\s?/);
            const explanation = explanationMatch[1] ? `Explanation:\n${explanationMatch[1].trim()}` : "";

            // Assemble the question data
            const questionData = {
                question: `${questionTitle}\n${questionText}`.trim(),
                options: options.map(opt => opt.replace(/^[a-dA-D]\)\s*/, "").trim()) || [],
                Answer: answer,
                Explanation: explanation || "",
            };

            // Store the previous question for handling cases where options span multiple pages
            previousQuestion = questionData;
            return questionData;
        });

        // Filter out any null results
        return result.filter((item) => item !== null);
    } catch (error) {
        console.error("Error processing text:", error);
        return { error: "An error occurred while processing the text." };
    }
};


// const extractQuestions = (data) => {
//     const cleanText = (text) => {
//         return text
//             .replace(/\\n/g, "\n")  // Convert literal \n to actual newlines
//             .replace(/\\u/g, "")     // Clean Unicode escape sequences
//             .replace(/\\uf0b7/g, '•') // Replace \uf0b7 with bullet points
//             .replace(//g, '•');  // Fix incorrect bullet representation
//     };

//     try {
//         const formattedText = cleanText(data);
//         const questions = formattedText
//             .split(/\u0298\s*/) // Split the input text into individual questions
//             .map((block) => block.trim())
//             .filter((block) => block.length > 0);

//         let previousQuestion = null;
//         const result = questions.map((questionBlock) => {
//             if (!questionBlock) return null;

//             // Split question and answer part by 'Ans:'
//             const [questionPart, answerAndExplanation] = questionBlock.split(/Ans:\s*/);
//             if (!questionPart || !answerAndExplanation) return null;

//             const lines = questionPart.split("\n").map(line => line.trim()).filter(line => line);

//             let questionTitle = "";
//             let options = [];
//             let questionTextLines = [];
//             let optionPattern = /^[a-zA-Z]\)\s+/; // Pattern to detect options like 'a)', 'b)', etc.

//             let isOption = false; // Flag to indicate when options start
//             let currentOption = "";

//             // Iterate over each line to separate question and options
//             for (let i = 0; i < lines.length; i++) {
//                 const line = lines[i].trim();

//                 // Check if the line matches the option pattern (e.g., a), b), etc.)
//                 if (optionPattern.test(line)) {
//                     // If there's an existing option, push it to the options array
//                     if (currentOption) {
//                         options.push(currentOption);
//                     }
//                     // Start a new option
//                     currentOption = line;
//                     isOption = true;
//                 } else if (isOption) {
//                     // If options have started, append to the current option
//                     currentOption += " " + line;
//                 } else {
//                     // If options haven't started yet, treat this as part of the question text
//                     questionTextLines.push(line);
//                 }
//             }

//             // Push the last option if it exists
//             if (currentOption) {
//                 options.push(currentOption);
//             }

//             // The first line is the question title
//             questionTitle = questionTextLines[0] || "";
//             const questionText = questionTextLines.slice(1).join("\n").trim(); // The rest is the question body

//             // Handle cases where options appear after a new page
//             if (questionText === "" && previousQuestion) {
//                 previousQuestion.options = [...previousQuestion.options, ...options];
//                 return null;
//             }

//             // Extract the correct answer (typically the first letter in 'Ans: A')
//             const answerMatch = answerAndExplanation.match(/[A-Z]/);
//             const answer = answerMatch ? answerMatch[0] : "";

//             // Extract explanation (after 'Explanation: ')
//             const explanationMatch = answerAndExplanation.split(/Explanation:?\s?/);
//             const explanation = explanationMatch[1] ? `Explanation:\n${explanationMatch[1].trim()}` : "";

//             // Assemble the question data
//             const questionData = {
//                 question: `${questionTitle}\n${questionText}`.trim(),
//                 options: options.map(opt => opt.replace(/^[a-zA-Z]\)\s*/, "").trim()) || [],
//                 Answer: answer,
//                 Explanation: explanation || "",
//             };

//             // Store the previous question for handling cases where options span multiple pages
//             previousQuestion = questionData;
//             return questionData;
//         });

//         // Filter out any null results
//         return result.filter((item) => item !== null);
//     } catch (error) {
//         console.error("Error processing text:", error);
//         return { error: "An error occurred while processing the text." };
//     }
// };



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
