// src/pages/Comparison.jsx
import React, { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';

import * as convert from 'xml-js'; // For XML parsing and formatting

SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('xml', xml);


const compareLines = (text1, text2) => {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const maxLength = Math.max(lines1.length, lines2.length);
  const result = [];

  for (let i = 0; i < maxLength; i++) {
    const line1 = lines1[i] || ''; 
    const line2 = lines2[i] || ''; 
    const diff = line1 !== line2; 

    result.push({
      line1: line1,
      line2: line2,
      diff: diff,
      lineNumber: i + 1, 
    });
  }
  return result;
};

const Comparison = () => {
 
  const [inputType, setInputType] = useState('json');
  const [inputData1, setInputData1] = useState('');
  const [inputData2, setInputData2] = useState('');

 
  const [comparisonResult, setComparisonResult] = useState(null);
  const [errorMessage1, setErrorMessage1] = useState('');
  const [errorMessage2, setErrorMessage2] = useState('');

 
  const parseAndFormat = (data, type) => {
    if (!data.trim()) {
      return { formatted: '', error: 'Input data is empty.' };
    }
    try {
      if (type === 'json') {
        const parsedJson = JSON.parse(data);
        return { formatted: JSON.stringify(parsedJson, null, 2), error: '' };
      } else if (type === 'xml') {
        const options = { compact: true, ignoreComment: true, spaces: 2 };
        const result = convert.xml2js(data, options);
        return { formatted: convert.js2xml(result, options), error: '' };
      }
      return { formatted: '', error: 'Unsupported data type.' };
    } catch (error) {
      return { formatted: '', error: `Parsing Error: ${error.message}` };
    }
  };

  
  const handleCompare = () => {
    
    setComparisonResult(null);
    setErrorMessage1('');
    setErrorMessage2('');

   
    const result1 = parseAndFormat(inputData1, inputType);
    const result2 = parseAndFormat(inputData2, inputType);

  
    if (result1.error) setErrorMessage1(result1.error);
    if (result2.error) setErrorMessage2(result2.error);

    
    if (!result1.error && !result2.error) {
      const comparison = compareLines(result1.formatted, result2.formatted);
      setComparisonResult(comparison);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Data Comparison Tool</h2>

      <div className="mb-4">
        <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-1">Select Data Type:</label>
        <select
          id="dataType"
          value={inputType}
          onChange={(e) => {
            setInputType(e.target.value);
            setInputData1('');
            setInputData2('');
            setComparisonResult(null);
            setErrorMessage1('');
            setErrorMessage2('');
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="json">JSON</option>
          <option value="xml">XML</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
       
        <div>
          <label htmlFor="dataInput1" className="block text-sm font-medium text-gray-700 mb-1">Input 1 ({inputType.toUpperCase()}):</label>
          <textarea
            id="dataInput1"
            value={inputData1}
            onChange={(e) => setInputData1(e.target.value)}
            rows="15"
            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border rounded-md p-2 font-mono ${errorMessage1 ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={`Enter your first ${inputType.toUpperCase()} data here...`}
            spellCheck="false"
          ></textarea>
          {errorMessage1 && (
            <p className="mt-2 text-sm text-red-600">{errorMessage1}</p>
          )}
        </div>

        <div>
          <label htmlFor="dataInput2" className="block text-sm font-medium text-gray-700 mb-1">Input 2 ({inputType.toUpperCase()}):</label>
          <textarea
            id="dataInput2"
            value={inputData2}
            onChange={(e) => setInputData2(e.target.value)}
            rows="15"
            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border rounded-md p-2 font-mono ${errorMessage2 ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={`Enter your second ${inputType.toUpperCase()} data here...`}
            spellCheck="false"
          ></textarea>
          {errorMessage2 && (
            <p className="mt-2 text-sm text-red-600">{errorMessage2}</p>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleCompare}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Compare Data
        </button>
      </div>

      {comparisonResult && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Comparison Result:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
            <div className="bg-gray-800 text-white rounded-md overflow-hidden">
              <div className="px-4 py-2 bg-gray-700 font-bold">Input 1</div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4">
                {comparisonResult.map((line, index) => (
                  <div
                    key={index}
                    className={`flex items-center ${line.diff ? 'bg-red-800 bg-opacity-50' : ''}`} 
                  >
                    <span className="text-gray-500 mr-4 text-right w-8 flex-shrink-0">{line.lineNumber}</span>
                    <span>{line.line1}</span>
                  </div>
                ))}
              </pre>
            </div>

            
            <div className="bg-gray-800 text-white rounded-md overflow-hidden">
             <div className="px-4 py-2 bg-gray-700 font-bold">Input 2</div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4">
                 {comparisonResult.map((line, index) => (
                  <div
                    key={index}
                    className={`flex items-center ${line.diff ? 'bg-red-800 bg-opacity-50' : ''}`} 
                  >
                     <span className="text-gray-500 mr-4 text-right w-8 flex-shrink-0">{line.lineNumber}</span>
                    <span>{line.line2}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
           <p className="mt-4 text-sm text-gray-600">
              <span className="inline-block w-4 h-4 bg-red-800 bg-opacity-50 mr-2 align-middle"></span> Lines highlighted in red indicate differences.
          </p>
        </div>
      )}
    </div>
  );
};

export default Comparison;
