import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setCurrentChart, saveChartToHistory,addToRecentlyViewed } from '../../store/slices/chartSlice';
import { setCurrentData } from '../../store/slices/dataSlice';
import { Bar, Line, Pie, Scatter, Doughnut } from 'react-chartjs-2';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BarChart3, Download, Settings, Save, Palette } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const { currentData } = useSelector((state: RootState) => state.data);
  const { user } = useSelector((state: RootState) => state.auth);
  const chartRef = useRef<HTMLDivElement>(null);
  const { uploads } = useSelector((state: RootState) => state.data);
  
  const [chartConfig, setChartConfig] = useState({
    type: 'bar' as 'bar' | 'line' | 'pie' | 'scatter' | 'doughnut' | '3d-bar',
    xAxis: '',
    yAxis: '',
    title: 'My Chart',
    backgroundColor: 'rgba(54, 162, 235, 0.8)',
    borderColor: 'rgba(54, 162, 235, 1)',
  });


const [selectedDataset, setSelectedDataset] = useState<string>('');

     // Get user's uploads
  const userUploads = uploads.filter(upload => upload.userId === user?.id);

  // Set selected dataset when currentData changes
  React.useEffect(() => {
    if (currentData) {
      setSelectedDataset(currentData.id);
    }
  }, [currentData]);

     const handleDatasetChange = (datasetId: string) => {
    const selectedUpload = userUploads.find(upload => upload.id === datasetId);
    if (selectedUpload) {
      dispatch(setCurrentData(selectedUpload));
      setSelectedDataset(datasetId);
      // Reset chart config when changing dataset
      setChartConfig({
        ...chartConfig,
        xAxis: '',
        yAxis: '',
      });
    }
  };

  if (!currentData) {
    return (
        <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
        
        <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Please upload an Excel file first to create charts.</p>

        {userUploads.length > 0 && (
              <div className="max-w-md mx-auto">
                <p className="text-sm text-gray-500 mb-4">Or select from your uploaded files:</p>
                <select
                  value={selectedDataset}
                  onChange={(e) => handleDatasetChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a dataset</option>
                  {userUploads.map((upload) => (
                    <option key={upload.id} value={upload.id}>
                      {upload.filename} ({upload.data.length} rows)
                    </option>
                  ))}
                </select>
              </div>
            )}
      </div>
      </div>
      </div>
    );
  }

  const generateChartData = () => {
    if (!chartConfig.xAxis || !chartConfig.yAxis) return null;

    const labels = currentData.data.map(row => row[chartConfig.xAxis]);
    const data = currentData.data.map(row => parseFloat(row[chartConfig.yAxis]) || 0);

    return {
      labels,
      datasets: [
        {
          label: chartConfig.yAxis,
          data,
          backgroundColor: chartConfig.type === 'pie' || chartConfig.type === 'doughnut' 
            ? [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)',
              ]
            : chartConfig.backgroundColor,
          borderColor: chartConfig.borderColor,
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: chartConfig.title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: chartConfig.type !== 'pie' && chartConfig.type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  };

  const renderChart = () => {
    const data = generateChartData();
    if (!data) return null;

    if (chartConfig.type === '3d-bar') {
      return (
        <div className="h-96 bg-gray-50 rounded-lg">
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            <Text
              position={[0, 4, 0]}
              fontSize={0.5}
              color="black"
              anchorX="center"
              anchorY="middle"
            >
              {chartConfig.title}
            </Text>
            {data.datasets[0].data.map((value, index) => (
              <mesh key={index} position={[index * 2 - data.labels.length, value / 2, 0]}>
                <boxGeometry args={[1, value, 1]} />
                <meshStandardMaterial color={`hsl(${(index * 60) % 360}, 70%, 50%)`} />
              </mesh>
            ))}
          </Canvas>
        </div>
      );
    }

    const components = {
      bar: Bar,
      line: Line,
      pie: Pie,
      scatter: Scatter,
      doughnut: Doughnut,
    };

    const ChartComponent = components[chartConfig.type];
    return <ChartComponent data={data} options={chartOptions} />;
  };

  const downloadChart = async (format: 'png' | 'pdf') => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current);
      
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${chartConfig.title}.png`;
        link.href = canvas.toDataURL();
        link.click();
      } else {
        const pdf = new jsPDF();
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`${chartConfig.title}.pdf`);
      }
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  const saveChart = () => {
    if (!user) return;

    dispatch(setCurrentChart(chartConfig));
    const chartHistoryItem = {
      config: chartConfig,
      datasetName: currentData.filename,
      userId: user.id,
    };

    dispatch(saveChartToHistory(chartHistoryItem));
    
    // Add to recently viewed when saved
    const chartId = Date.now().toString();
    dispatch(addToRecentlyViewed(chartId));


    // Show success notification
    alert('Chart saved to history!');
  };

  const colorPresets = [
    { bg: 'rgba(54, 162, 235, 0.8)', border: 'rgba(54, 162, 235, 1)', name: 'Blue' },
    { bg: 'rgba(255, 99, 132, 0.8)', border: 'rgba(255, 99, 132, 1)', name: 'Red' },
    { bg: 'rgba(75, 192, 192, 0.8)', border: 'rgba(75, 192, 192, 1)', name: 'Teal' },
    { bg: 'rgba(153, 102, 255, 0.8)', border: 'rgba(153, 102, 255, 1)', name: 'Purple' },
    { bg: 'rgba(255, 205, 86, 0.8)', border: 'rgba(255, 205, 86, 1)', name: 'Yellow' },
    { bg: 'rgba(255, 159, 64, 0.8)', border: 'rgba(255, 159, 64, 1)', name: 'Orange' },
  ];

  return (
    <div className="space-y-6">

      {/* Data Overview Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Data Overview</h2>
            <p className="text-gray-600">Current dataset: {currentData.filename}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{currentData.data.length}</p>
              <p className="text-sm text-gray-500">Rows</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{currentData.columns.length}</p>
              <p className="text-sm text-gray-500">Columns</p>
            </div>
          </div>
        </div>

        {/* Dataset Selector */}
        {userUploads.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Dataset
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => handleDatasetChange(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {userUploads.map((upload) => (
                <option key={upload.id} value={upload.id}>
                  {upload.filename} ({upload.data.length} rows)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Data Preview Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {currentData.columns.slice(0, 6).map((column) => (
                  <th
                    key={column}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
                {currentData.columns.length > 6 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ...
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.data.slice(0, 5).map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {currentData.columns.slice(0, 6).map((column) => (
                    <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {String(row[column] || '').slice(0, 50)}
                      {String(row[column] || '').length > 50 && '...'}
                    </td>
                  ))}
                  {currentData.columns.length > 6 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      +{currentData.columns.length - 6} more
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {currentData.data.length > 5 && (
            <div className="bg-gray-50 px-6 py-3 text-center">
              <p className="text-sm text-gray-500">
                Showing 5 of {currentData.data.length} rows
              </p>
            </div>
          )}
        </div>
      </div>


      {/* Chart Builder Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chart Builder</h2>
            <p className="text-gray-600">Create interactive charts from your data</p>
          </div>
          

          <div className="flex space-x-2">
            <button
              onClick={saveChart}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Chart</span>
            </button>
            <div className="flex space-x-1">
              <button
                onClick={() => downloadChart('png')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>PNG</span>
              </button>
              <button
                onClick={() => downloadChart('pdf')}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Title
              </label>
              <input
                type="text"
                value={chartConfig.title}
                onChange={(e) => setChartConfig({ ...chartConfig, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <select
                value={chartConfig.type}
                onChange={(e) => setChartConfig({ ...chartConfig, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
                <option value="scatter">Scatter Plot</option>
                <option value="3d-bar">3D Bar Chart</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X-Axis
              </label>
              <select
                value={chartConfig.xAxis}
                onChange={(e) => setChartConfig({ ...chartConfig, xAxis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select column</option>
                {currentData.columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Y-Axis
              </label>
              <select
                value={chartConfig.yAxis}
                onChange={(e) => setChartConfig({ ...chartConfig, yAxis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select column</option>
                {currentData.columns.map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Palette className="w-4 h-4 mr-1" />
                Colors
              </label>
              <div className="grid grid-cols-3 gap-2">
                {colorPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setChartConfig({
                      ...chartConfig,
                      backgroundColor: preset.bg,
                      borderColor: preset.border,
                    })}
                    className="h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: preset.bg }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div ref={chartRef} className="bg-white p-6 rounded-lg border border-gray-200">
              {generateChartData() ? (
                renderChart()
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select X and Y axes to generate your chart</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartBuilder;