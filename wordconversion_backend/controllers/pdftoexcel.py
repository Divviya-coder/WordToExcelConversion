# import os
# import PyPDF2
# import pdfplumber
# import json
# import sys

# def extract_text_with_pypdf2(pdf_path):
#     """
#     Extract text from PDF using PyPDF2
#     """
#     with open(pdf_path, 'rb') as file:
#         reader = PyPDF2.PdfReader(file)
#         text = ""
#         for page in range(len(reader.pages)):
#             page_obj = reader.pages[page]
#             text += page_obj.extract_text()
#     return text

# def extract_text_with_pdfplumber(pdf_path):
#     """
#     Extract text from PDF using pdfplumber
#     """
#     with pdfplumber.open(pdf_path) as pdf:
#         text = ""
#         for page in pdf.pages:
#             text += page.extract_text()
#     return text

# def extract_text_from_pdf(pdf_path, method="pdfplumber"):
#     """
#     Extract text from PDF using the selected method.
#     Choices: 'pypdf2', 'pdfplumber'
#     """
#     if method == "pypdf2":
#         return extract_text_with_pypdf2(pdf_path)
#     elif method == "pdfplumber":
#         return extract_text_with_pdfplumber(pdf_path)
#     else:
#         raise ValueError("Invalid method. Choose either 'pypdf2' or 'pdfplumber'.")

# if __name__ == "__main__":
#     uploads_folder = "uploads"  # Folder where the file is stored
#     method = "pdfplumber"  # Change to "pypdf2" to use PyPDF2 method
    
#     try:
#         # Get the list of files in the uploads folder
#         files = os.listdir(uploads_folder)
#         if not files:
#             raise FileNotFoundError("No files found in the uploads folder.")
        
#         # Assuming there's only one file in the folder
#         pdf_file = files[0]
#         pdf_path = os.path.join(uploads_folder, pdf_file)
        
#         # Process the PDF
#         extracted_text = extract_text_from_pdf(pdf_path, method)
        
#         # Output JSON response to stdout
#         result = {"success": True, "file": pdf_file, "extracted_text": extracted_text}
#         print(json.dumps(result))  # Send result to stdout
        
#     except Exception as e:
#         # Output error response to stderr
#         error_response = {"success": False, "error": str(e)}
#         print(json.dumps(error_response), file=sys.stderr)
#         sys.exit(1)

import os
import PyPDF2
import pdfplumber
import json
import sys

def extract_text_with_pypdf2(pdf_path):
    """
    Extract text from PDF using PyPDF2
    """
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in range(len(reader.pages)):
            page_obj = reader.pages[page]
            text += page_obj.extract_text()
            if page != len(reader.pages) - 1:  # If it's not the last page
                text += "\n"  # Add newline to mark page break
    return text

def extract_text_with_pdfplumber(pdf_path):
    """
    Extract text from PDF using pdfplumber
    """
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page_index, page in enumerate(pdf.pages):
            text += page.extract_text()
            if page_index != len(pdf.pages) - 1:  # If it's not the last page
                text += "\n"  # Add newline to mark page break
    return text

def extract_text_from_pdf(pdf_path, method="pdfplumber"):
    """
    Extract text from PDF using the selected method.
    Choices: 'pypdf2', 'pdfplumber'
    """
    if method == "pypdf2":
        return extract_text_with_pypdf2(pdf_path)
    elif method == "pdfplumber":
        return extract_text_with_pdfplumber(pdf_path)
    else:
        raise ValueError("Invalid method. Choose either 'pypdf2' or 'pdfplumber'.")

if __name__ == "__main__":
    uploads_folder = "uploads"  # Folder where the file is stored
    method = "pdfplumber"  # Change to "pypdf2" to use PyPDF2 method
    
    try:
        # Get the list of files in the uploads folder
        files = os.listdir(uploads_folder)
        if not files:
            raise FileNotFoundError("No files found in the uploads folder.")
        
        # Assuming there's only one file in the folder
        pdf_file = files[0]
        pdf_path = os.path.join(uploads_folder, pdf_file)
        
        # Process the PDF
        extracted_text = extract_text_from_pdf(pdf_path, method)
        
        # Output JSON response to stdout
        result = {"success": True, "file": pdf_file, "extracted_text": extracted_text}
        print(json.dumps(result))  # Send result to stdout
        
    except Exception as e:
        # Output error response to stderr
        error_response = {"success": False, "error": str(e)}
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)
