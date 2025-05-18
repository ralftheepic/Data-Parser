import React, { useState } from 'react';
import { Validator } from 'jsonschema';

const Validation = () => {
  const [inputType, setInputType] = useState('json');
  const [schemaInput, setSchemaInput] = useState('');
  const [dataInput, setDataInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleValidate = () => {
    setValidationResult(null);
    setErrorMessage('');

    if (!schemaInput.trim() || !dataInput.trim()) {
      setErrorMessage('Please provide both schema and data inputs.');
      return;
    }

    try {
      if (inputType === 'json') {
        let schema;
        let data;

        try {
          schema = JSON.parse(schemaInput);
        } catch (e) {
          setErrorMessage('Invalid JSON Schema: ' + e.message);
          return;
        }

        try {
          data = JSON.parse(dataInput);
        } catch (e) {
          setErrorMessage('Invalid JSON Data: ' + e.message);
          return;
        }

        const validator = new Validator();
        const result = validator.validate(data, schema);

        if (result.errors.length > 0) {
          setValidationResult(result.errors);
        } else {
          setValidationResult(true);
        }
      } else if (inputType === 'xml') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(dataInput, 'text/xml');

        const parserError = xmlDoc.getElementsByTagName('parsererror');
        if (parserError.length > 0) {
          const errorText = parserError[0].textContent || 'XML parsing error (not well-formed).';
          setErrorMessage('Invalid XML Data: ' + errorText);
          setValidationResult(false);
        } else {
          const schemaDoc = parser.parseFromString(schemaInput, 'text/xml');
          const schemaParserError = schemaDoc.getElementsByTagName('parsererror');

          if (schemaParserError.length > 0) {
            const schemaErrorText = schemaParserError[0].textContent || 'XML Schema parsing error (not well-formed).';
            setErrorMessage('Invalid XML Schema: ' + schemaErrorText);
            setValidationResult(false);
          } else {
            setValidationResult(true);
            setErrorMessage('XML is well-formed. Note: Full XML Schema (XSD) validation is not performed in this client-side tool.');
          }
        }
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred during validation: ' + error.message);
      console.error('Validation Error:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Schema Validation Tool</h2>

      <div className="mb-4">
        <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-1">Select Data Type:</label>
        <select
          id="dataType"
          value={inputType}
          onChange={(e) => {
            setInputType(e.target.value);
            setSchemaInput('');
            setDataInput('');
            setValidationResult(null);
            setErrorMessage('');
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="json">JSON</option>
          <option value="xml">XML</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="schemaInput" className="block text-sm font-medium text-gray-700 mb-1">{inputType.toUpperCase()} Schema:</label>
          <textarea
            id="schemaInput"
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            rows="12"
            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border rounded-md p-2 font-mono ${errorMessage.includes('Schema') ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={`Enter your ${inputType.toUpperCase()} schema here...`}
            spellCheck="false"
          ></textarea>
        </div>

        <div>
          <label htmlFor="dataInput" className="block text-sm font-medium text-gray-700 mb-1">{inputType.toUpperCase()} Data:</label>
          <textarea
            id="dataInput"
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            rows="12"
            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border rounded-md p-2 font-mono ${errorMessage.includes('Data') ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={`Enter your ${inputType.toUpperCase()} data here...`}
            spellCheck="false"
          ></textarea>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={handleValidate}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Validate
        </button>
      </div>

      {validationResult !== null && (
        <div className="mt-6 p-4 rounded-md">
          {validationResult === true ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Validation Successful!</strong>
              <span className="block sm:inline"> The {inputType.toUpperCase()} data is valid against the provided schema.</span>
            </div>
          ) : (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Validation Failed!</strong>
              <span className="block sm:inline"> The {inputType.toUpperCase()} data is NOT valid against the provided schema.</span>
              {Array.isArray(validationResult) && validationResult.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold">Errors:</p>
                  <ul className="list-disc ml-5 text-sm">
                    {validationResult.map((error, index) => (
                      <li key={index}>{error.stack}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {errorMessage && !validationResult && (
        <div className="mt-6 p-4 rounded-md bg-red-100 border border-red-400 text-red-700 relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      )}

      {inputType === 'xml' && (
        <div className="mt-6 p-4 rounded-md bg-yellow-100 border border-yellow-400 text-yellow-700 relative text-sm">
          <strong className="font-bold">Note on XML Validation:</strong>
          <span className="block sm:inline"> This tool performs basic XML well-formedness checking client-side. Full XML Schema (XSD) validation is complex and typically requires a backend service.</span>
        </div>
      )}

    </div>
  );
};

export default Validation;
