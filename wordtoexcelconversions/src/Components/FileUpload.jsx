import React, { useState } from "react";
import {
  Upload,
  message,
  Card,
  Progress,
  Button,
  Empty,
  Spin,
  Modal,
  Select,
  Space,
  Row,
  Col,
  Switch,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// import { useNavigate } from "react-router-dom";
const { Option } = Select;
const { Dragger } = Upload;
import ExcelJS from "exceljs";

const FileUpload = () => {
  const [imageFiles, setImageFiles] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(true);
  const [downloaddata, setdownloaddata] = useState([]);
  const [isSuccess, setIsSuccess] = useState(null);
  const [selectedOption, setSelectedOption] = useState("GS");
  const [defaultMcq, setDefaultMcq] = useState(true);

  // const navigate = useNavigate();
  const handleChange = (value) => {
    setSelectedOption(value); // Update state with selected option
  };
  const handleImageUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files are allowed.");
      return false;
    }

    // if (imageFiles.length >= 100) {
    //   message.error("You can upload up to 100 images only.");
    //   return false;
    // }

    setImageFiles((prevFiles) => [...prevFiles, file]);
    return false; // Prevent automatic upload
  };

  const handleExcelUpload = (file) => {
    const isExcel = file.type === "application/pdf";
    if (!isExcel) {
      message.error("Only PDF files are allowed.");
      return false;
    }

    setExcelFile(file);
    message.success(`${file.name} uploaded successfully`);
    return false; // Prevent automatic upload
  };

  const handleDeleteImage = (file) => {
    setImageFiles((prevFiles) =>
      prevFiles.filter((item) => item.uid !== file.uid)
    );
    message.info(`${file.name} removed.`);
  };

  const handleDeleteExcel = () => {
    setExcelFile(null);
    message.info("PDF file removed.");
  };

  const handleSubmit = async () => {
    if (!excelFile) {
      message.warning("Please upload a PDF file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setProcessing(true);
        setIsModalOpen(true);
        setIsSuccess(null);

        const formData = new FormData();
        formData.append("file", excelFile);

        const response = await axios.post(
          "http://localhost:3001/upload/pdf",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.status === 200) {
          message.success("Files uploaded successfully.");
          setIsSuccess(true);
          const data = response.data?.processedquestions;
          setdownloaddata(data);

          // Create an Excel workbook and worksheet
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet("Results");

          // Define columns
          worksheet.columns = [
            { header: "Question Type", key: "Question Type", width: 15 },
            { header: "Difficulty Level", key: "Difficulty Level", width: 20 },
            { header: "Subject", key: "Subject", width: 20 },
            { header: "Topic", key: "Topic", width: 20 },
            { header: "Question", key: "Question", width: 50 },
            { header: "Option A", key: "Option A", width: 30 },
            { header: "Option B", key: "Option B", width: 30 },
            { header: "Option C", key: "Option C", width: 30 },
            { header: "Option D", key: "Option D", width: 30 },
            { header: "Explanation", key: "Explanation", width: 50 },
            { header: "Correct Answer", key: "Correct Answer", width: 10 },
            {
              header: "Points Correct Answer",
              key: "Points Correct Answer",
              width: 10,
            },
            {
              header: "Points Incorrect Answer",
              key: "Points Incorrect Answer",
              width: 10,
            },
          ];
          worksheet.getRow(1).font = { bold: true };
          // Add rows with line breaks and apply wrap text
          data.forEach((item) => {
            const row = worksheet.addRow({
              "Question Type": "",
              "Difficulty Level": "",
              Subject: "",
              Topic: "",
              Question: item.question, // Ensure question contains "\n" where needed
              "Option A": item.options?.[0] || "",
              "Option B": item.options?.[1] || "",
              "Option C": item.options?.[2] || "",
              "Option D": item.options?.[3] || "",
              Explanation: item.Explanation || "", // Ensure Explanation contains "\n" where needed
              "Correct Answer": item.Answer || "",
              "Points Correct Answer": "",
              "Points Incorrect Answer": "",
            });

            // Apply wrap text to each cell in the row
            row.eachCell((cell) => {
              cell.alignment = { vertical: "top", wrapText: true };
            });
          });

          // Generate and download the file
          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          saveAs(blob, "ExtractedData.xlsx");
        }
      } catch (error) {
        message.error("Failed to process file.");
        setIsSuccess(false);
      } finally {
        setProcessing(false);
      }
    };

    reader.readAsArrayBuffer(excelFile);
  };

  const handleDownload = async () => {
    if (!isSuccess) {
      message.error("Cannot download, no results to download.");
      return;
    }
    console.log(downloaddata, "download data");
    // Assuming the `rows` variable is available after the upload
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Results");

    // Define columns
    worksheet.columns = [
      { header: "Question Type", key: "Question Type", width: 15 },
      { header: "Difficulty Level", key: "Difficulty Level", width: 20 },
      { header: "Subject", key: "Subject", width: 20 },
      { header: "Topic", key: "Topic", width: 20 },
      { header: "Question", key: "Question", width: 50 },
      { header: "Option A", key: "Option A", width: 30 },
      { header: "Option B", key: "Option B", width: 30 },
      { header: "Option C", key: "Option C", width: 30 },
      { header: "Option D", key: "Option D", width: 30 },
      { header: "Explanation", key: "Explanation", width: 50 },
      { header: "Correct Answer", key: "Correct Answer", width: 10 },
      {
        header: "Points Correct Answer",
        key: "Points Correct Answer",
        width: 10,
      },
      {
        header: "Points Incorrect Answer",
        key: "Points Incorrect Answer",
        width: 10,
      },
    ];
    worksheet.getRow(1).font = { bold: true };

    // Add rows with line breaks and apply wrap text
    downloaddata.forEach((item) => {
      const row = worksheet.addRow({
        "Question Type": "",
        "Difficulty Level": "",
        Subject: "",
        Topic: "",
        Question: item.question, // Ensure question contains "\n" where needed
        "Option A": item.options?.[0] || "",
        "Option B": item.options?.[1] || "",
        "Option C": item.options?.[2] || "",
        "Option D": item.options?.[3] || "",
        Explanation: item.Explanation || "", // Ensure Explanation contains "\n" where needed
        "Correct Answer": item.Answer || "",
        "Points Correct Answer": "",
        "Points Incorrect Answer": "",
      });

      // Apply wrap text to each cell in the row
      row.eachCell((cell) => {
        cell.alignment = { vertical: "top", wrapText: true };
      });
    });

    // Generate and download the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "ExtractedData.xlsx");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsSuccess(null);
    setProcessing(false); // Close the modal
  };

  return (
    <div>
      <div
        style={{
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Display the selected value */}
        <Row style={{ width: "77%" }}>
          <Col span={14} style={{ display: "flex", justifyContent: "end" }}>
            {" "}
            <h3>Upload PDF File</h3>
          </Col>
          <Col
            span={10}
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          ></Col>
        </Row>

        <Dragger
          beforeUpload={handleExcelUpload}
          fileList={[]} // Prevent Ant Design from managing the file list
          style={{
            padding: "20px",
            width: "57vw",
            border: "1px dashed #d9d9d9",
            backgroundColor: "#fafafa",
          }}
          accept=".pdf"
        >
          <p className="ant-upload-drag-icon">
            <FilePdfOutlined style={{ fontSize: 24, color: "red" }} />
          </p>
          <p className="ant-upload-text">
            Drag and drop an PDF file here or click to upload
          </p>
          <p className="ant-upload-hint">Only PDF files are supported.</p>
        </Dragger>
        {excelFile && (
          <Card
            style={{ marginTop: 20, width: 300 }}
            actions={[
              <DeleteOutlined key="delete" onClick={handleDeleteExcel} />,
            ]}
          >
            <Card.Meta
              title={excelFile.name}
              description="Excel file uploaded successfully."
            />
          </Card>
        )}

        <Button
          type="primary"
          style={{ marginTop: 40, width: "200px" }}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
      <Modal
        open={isModalOpen}
        footer={null} // Remove default footer
        closable={!processing} // Allow closing unless processing
        maskClosable={!processing} // Prevent outside click to close while processing
        onCancel={handleModalClose} // Handle close when "X" is clicked
        title="File Upload Status"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "20px",
          }}
        >
          {processing ? (
            <>
              <Spin
                size="large"
                // indicator={
                //   <LoadingOutlined
                //     style={{ fontSize: 48, color: "#1890ff" }}
                //     spin
                //   />
                // }
              />
              <p
                style={{
                  marginTop: "50px",
                  fontSize: "16px",
                  color: "#1890ff",
                }}
              >
                Processing upload, please wait...
              </p>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircleOutlined
                style={{ fontSize: 48, color: "#52c41a", marginBottom: "20px" }}
              />
              <p style={{ fontSize: "16px" }}>Upload completed successfully!</p>
              <Space>
                <Button
                  type="primary"
                  onClick={handleDownload}
                  style={{ marginTop: "20px", marginRight: "10px" }}
                  icon={<DownloadOutlined />}
                >
                  Download Results
                </Button>
                <Button
                  type="primary"
                  onClick={handleModalClose}
                  style={{ marginTop: "20px" }}
                >
                  Close
                </Button>
              </Space>
            </>
          ) : (
            <>
              <CloseCircleOutlined
                style={{ fontSize: 48, color: "#ff4d4f", marginBottom: "20px" }}
              />
              <p style={{ fontSize: "16px", color: "#ff4d4f" }}>
                Upload failed. Please try again.
              </p>
              <Button
                type="primary"
                onClick={handleModalClose}
                style={{ marginTop: "20px" }}
              >
                Close
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default FileUpload;
