import React, { useState, useEffect, useRef } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import { Copy } from 'lucide-react'; 
import * as convert from 'xml-js';
import { load, dump } from 'js-yaml';

SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('xml', xml);
SyntaxHighlighter.registerLanguage('yaml', yaml);

const Parser = () => {
  const [inputType, setInputType] = useState('json');
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const outputRef = useRef(null); 

  const handleParseFormat = () => {
    setErrorMessage('');
    setOutputData('');

    if (!inputData.trim()) {
      setErrorMessage('Input data is empty.');
      return;
    }

    try {
      let parsedData;
      let formattedOutput;
      switch (inputType) {
        case 'json':
          parsedData = JSON.parse(inputData);
          formattedOutput = JSON.stringify(parsedData, null, 2);
          break;
        case 'xml':
          const xmlOptions = { compact: true, ignoreComment: true, spaces: 2 };
          parsedData = convert.xml2js(inputData, xmlOptions);
          formattedOutput = convert.js2xml(parsedData, xmlOptions);
          break;
        case 'yaml':
          parsedData = load(inputData);
          formattedOutput = dump(parsedData, { indent: 2 });
          break;
        default:
          throw new Error(`Unsupported data type: ${inputType}`);
      }
      setOutputData(formattedOutput);
    } catch (error) {
      setErrorMessage(`Parsing Error: ${error.message}`);
      console.error('Parsing Error:', error);
    }
  };

  const handleDownload = () => {
    if (!outputData) {
      alert('No data to download.');
      return;
    }

    const fileExtension = inputType === 'json' ? 'json' : inputType === 'xml' ? 'xml' : 'yaml';
    const blob = new Blob([outputData], { type: `text/${fileExtension}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parsed_data.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputData(e.target.result);
        if (file.type === 'application/json') {
          setInputType('json');
        } else if (file.type === 'text/xml' || file.type === 'application/xml') {
          setInputType('xml');
        } else if (file.type === 'text/yaml' || file.type === 'application/x-yaml') {
          setInputType('yaml');
        } else {
          setInputType('text');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = () => {
    if (outputData && outputRef.current) {
      navigator.clipboard
        .writeText(outputData)
        .then(() => {
          // Show a success message (you can use a toast library if you have one)
          alert('Output copied to clipboard!');
        })
        .catch((err) => {
          // Handle the error, e.g., show an error message
          console.error('Failed to copy: ', err);
          alert('Failed to copy output. Please copy manually.');
        });
    } else if (!outputData) {
      alert('No data to copy.');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Data Parser Tool</h2>

      {/* Input Type Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-1">Select Data Type:</label>
        <select
          id="dataType"
          value={inputType}
          onChange={(e) => {
            setInputType(e.target.value);
            setErrorMessage('');
            setOutputData('');
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="json">JSON</option>
          <option value="xml">XML</option>
          <option value="yaml">YAML</option>
        </select>
      </div>

      {/* File Input */}
      <div className="mb-4">
        <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 mb-1">Upload File:</label>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          accept=".json,.xml,.yaml,.yml"
        />
      </div>

      {/* Input Area */}
      <div className="mb-4">
        <label htmlFor="dataInput" className="block text-sm font-medium text-gray-700 mb-1">Input {inputType.toUpperCase()} Data:</label>
        <textarea
          id="dataInput"
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          rows="15"
          className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border rounded-md p-2 font-mono ${errorMessage ? 'border-red-500' : 'border-gray-300'}`}
          placeholder={`Enter your ${inputType.toUpperCase()} data here...`}
          spellCheck="false"
        ></textarea>
        {errorMessage && (
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleParseFormat}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Format / Parse
        </button>
        <button
          onClick={handleDownload}
          disabled={!outputData}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Download Output
        </button>
      </div>

      {/* Output Area */}
      {outputData && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Formatted Output:</h3>
            <button
              onClick={handleCopy}
              className="inline-flex items-center p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              title="Copy to Clipboard"
              disabled={!outputData}
            >
              <Copy className="h-4 w-4" /> {/* Use the Copy icon here */}
            </button>
          </div>
          <div className="bg-gray-800 rounded-md overflow-hidden" ref={outputRef}>
            <SyntaxHighlighter
              language={inputType}
              style={darcula}
              customStyle={{ padding: '15px', overflowX: 'auto', marginBottom: '0' }}
            >
              {outputData}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parser;
