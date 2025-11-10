#!/usr/bin/env python3
"""
Python microservice for accurate PDF table extraction using pdfplumber
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import os
import tempfile
import json

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'pdf-parser'})

@app.route('/parse-pdf', methods=['POST'])
def parse_pdf():
    """
    Parse PDF and extract structured data including tables
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        filename = file.filename or 'document.pdf'
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            file.save(tmp_file.name)
            tmp_path = tmp_file.name
        
        try:
            # Open PDF with pdfplumber
            with pdfplumber.open(tmp_path) as pdf:
                # Extract tables
                tables = []
                full_text = ""
                
                for page in pdf.pages:
                    # Extract text
                    page_text = page.extract_text()
                    if page_text:
                        full_text += page_text + "\n\n"
                    
                    # Extract tables from page
                    page_tables = page.extract_tables()
                    for table in page_tables:
                        if table and len(table) > 0:
                            table_data = {
                                'headers': [],
                                'rows': []
                            }
                            
                            # First row as headers
                            if len(table) > 0:
                                table_data['headers'] = [str(cell) if cell else "" for cell in table[0]]
                            
                            # Remaining rows as data
                            if len(table) > 1:
                                for row in table[1:]:
                                    table_data['rows'].append([str(cell) if cell else "" for cell in row])
                            
                            tables.append(table_data)
            
            # Try to identify document type
            doc_type = 'Unknown'
            text_lower = full_text.lower()
            if 'invoice' in text_lower:
                doc_type = 'Invoice'
            elif 'approval' in text_lower or 'pre-approval' in text_lower:
                doc_type = 'Approval'
            elif 'claim form' in text_lower or 'patient name' in text_lower:
                doc_type = 'Claim Form'
            
            # Extract metadata
            with pdfplumber.open(tmp_path) as pdf:
                page_count = len(pdf.pages)
            
            metadata = {
                'filename': filename,
                'documentType': doc_type,
                'pageCount': page_count
            }
            
            return jsonify({
                'ok': True,
                'filename': filename,
                'documentType': doc_type,
                'tables': tables,
                'text': full_text,
                'metadata': metadata
            })
            
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    except Exception as e:
        print(f"Error parsing PDF: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'ok': False,
            'error': str(e),
            'details': traceback.format_exc()
        }), 500

@app.route('/parse-multiple', methods=['POST'])
def parse_multiple():
    """
    Parse multiple PDFs and return combined structured data
    """
    try:
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No files provided'}), 400
        
        all_results = []
        
        for file in files:
            filename = file.filename or 'document.pdf'
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                file.save(tmp_file.name)
                tmp_path = tmp_file.name
            
            try:
                # Open PDF with pdfplumber
                with pdfplumber.open(tmp_path) as pdf:
                    # Extract tables
                    tables = []
                    full_text = ""
                    
                    for page in pdf.pages:
                        # Extract text
                        page_text = page.extract_text()
                        if page_text:
                            full_text += page_text + "\n\n"
                        
                        # Extract tables from page
                        page_tables = page.extract_tables()
                        for table in page_tables:
                            if table and len(table) > 0:
                                table_data = {
                                    'headers': [],
                                    'rows': []
                                }
                                
                                # First row as headers
                                if len(table) > 0:
                                    table_data['headers'] = [str(cell) if cell else "" for cell in table[0]]
                                
                                # Remaining rows as data
                                if len(table) > 1:
                                    for row in table[1:]:
                                        table_data['rows'].append([str(cell) if cell else "" for cell in row])
                                
                                tables.append(table_data)
                
                # Identify document type
                doc_type = 'Unknown'
                text_lower = full_text.lower()
                if 'invoice' in text_lower:
                    doc_type = 'Invoice'
                elif 'approval' in text_lower or 'pre-approval' in text_lower:
                    doc_type = 'Approval'
                elif 'claim form' in text_lower or 'patient name' in text_lower:
                    doc_type = 'Claim Form'
                
                all_results.append({
                    'filename': filename,
                    'documentType': doc_type,
                    'tables': tables,
                    'text': full_text
                })
                
            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
        
        return jsonify({
            'ok': True,
            'documents': all_results
        })
    
    except Exception as e:
        print(f"Error parsing PDFs: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'ok': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"Starting PDF Parser Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
