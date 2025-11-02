import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { addUpload, setCurrentData, setLoading } from '../../store/slices/dataSlice';
import { RootState } from '../../store/store';


interface FileUploadProps {
  onUploadSuccess?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.data);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const processExcelFile = useCallback((file: File) => {
    dispatch(setLoading(true));
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          throw new Error('The Excel file appears to be empty');
        }

        const columns = Object.keys(jsonData[0] as object);
        
        const excelData = {
          id: Date.now().toString(),
          filename: file.name,
          data: jsonData,
          columns,
          uploadDate: new Date().toISOString(),
          userId: user?.id || 'anonymous',
        };

        dispatch(addUpload(excelData));
        dispatch(setCurrentData(excelData));
        setUploadStatus('success');



        // Auto-navigate to chart builder after successful upload
        if (onUploadSuccess) {
          setTimeout(() => {
            onUploadSuccess();
          }, 1500);
        }
        
        setTimeout(() => setUploadStatus('idle'), 3000);
      } catch (err) {
        console.error('Error processing Excel file:', err);
        setError(err instanceof Error ? err.message : 'Failed to process Excel file');
        setUploadStatus('error');
      } finally {
        dispatch(setLoading(false));
      }
    };

    reader.readAsArrayBuffer(file);
  }, [dispatch, user?.id]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processExcelFile(file);
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Excel File</h2>
          <p className="text-gray-600">
            Upload your Excel file (.xlsx or .xls) to start analyzing your data
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full transition-colors ${
                isDragActive ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Upload className={`w-8 h-8 ${
                  isDragActive ? 'text-blue-500' : 'text-gray-400'
                }`} />
              </div>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your Excel file here'}
              </p>
              <p className="text-gray-500">or click to browse</p>
            </div>
            
            <div className="text-sm text-gray-400">
              Supported formats: .xlsx, .xls • Max file size: 10MB
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-blue-800 font-medium">Processing your file...</span>
            </div>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                File uploaded successfully! Ready for analysis.
              </span>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <p className="font-medium text-gray-900">Upload</p>
            <p className="text-gray-600">Select your Excel file</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold">2</span>
            </div>
            <p className="font-medium text-gray-900">Configure</p>
            <p className="text-gray-600">Choose chart settings</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <p className="font-medium text-gray-900">Visualize</p>
            <p className="text-gray-600">Generate charts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;