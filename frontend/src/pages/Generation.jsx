// src/pages/Generation.jsx
import React, { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';

import * as convert from 'xml-js'; // For XML parsing and formatting
import { faker } from '@faker-js/faker'; // For generating realistic-looking mock data

// Register the languages
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('xml', xml);

// --- Mock Data Generation Logic ---

// Basic JSON Data Generator based on JSON Schema types
const generateJsonData = (schema, options = {}) => {
  const { numItems = 1 } = options; // Default to generating 1 item

  const generateValue = (subSchema) => {
    // Handle null type
    if (subSchema.type === 'null') {
      return null;
    }

    // Handle boolean type
    if (subSchema.type === 'boolean') {
      return faker.datatype.boolean();
    }

    // Handle number and integer types
    if (subSchema.type === 'number' || subSchema.type === 'integer') {
      const min = subSchema.minimum !== undefined ? subSchema.minimum : (subSchema.type === 'integer' ? -1000 : -1000.0);
      const max = subSchema.maximum !== undefined ? subSchema.maximum : (subSchema.type === 'integer' ? 1000 : 1000.0);
      const precision = subSchema.type === 'integer' ? 0 : (subSchema.multipleOf !== undefined ? Math.log10(1 / subSchema.multipleOf) : 2);

      // Include boundary cases sometimes
      if (Math.random() < 0.1) return min;
      if (Math.random() < 0.1) return max;

      return faker.datatype.number({ min, max, precision });
    }

    // Handle string type
    if (subSchema.type === 'string') {
      // Handle format
      if (subSchema.format === 'email') return faker.internet.email();
      if (subSchema.format === 'uri') return faker.internet.url();
      if (subSchema.format === 'date') return faker.date.past().toISOString().slice(0, 10);
      if (subSchema.format === 'date-time') return faker.date.past().toISOString();
      if (subSchema.format === 'uuid') return faker.datatype.uuid();
      if (subSchema.format === 'ipv4') return faker.internet.ipv4();
      if (subSchema.format === 'ipv6') return faker.internet.ipv6();
      // Add more formats as needed

      const minLength = subSchema.minLength !== undefined ? subSchema.minLength : 0;
      const maxLength = subSchema.maxLength !== undefined ? subSchema.maxLength : 20; // Default max length

      // Include empty string sometimes if minLength is 0
      if (minLength === 0 && Math.random() < 0.05) return '';

      // Basic pattern handling (very simplified)
      if (subSchema.pattern) {
          // Generating strings that match complex regex patterns is hard.
          // For simplicity, just generate a random string and hope it matches, or use a dedicated library.
          // A better approach would use a library like 'randexp'.
          // For now, generate a random word or sentence.
           return faker.lorem.word(); // Fallback for pattern
      }


      return faker.lorem.words(faker.datatype.number({ min: 1, max: 3 })); // Generate 1 to 3 words
    }

    // Handle array type
    if (subSchema.type === 'array') {
      const minItems = subSchema.minItems !== undefined ? subSchema.minItems : 0;
      const maxItems = subSchema.maxItems !== undefined ? subSchema.maxItems : 5; // Default max items
      const itemCount = faker.datatype.number({ min: minItems, max: maxItems });
      const items = [];
      for (let i = 0; i < itemCount; i++) {
        // If 'items' is a single schema
        if (subSchema.items) {
          items.push(generateValue(subSchema.items));
        }
        // If 'items' is an array of schemas (tuple validation), this basic generator won't handle it fully
        // A more advanced generator would be needed.
      }
      return items;
    }

    // Handle object type
    if (subSchema.type === 'object') {
      const obj = {};
      if (subSchema.properties) {
        Object.entries(subSchema.properties).forEach(([key, propSchema]) => {
          const isRequired = subSchema.required && subSchema.required.includes(key);
          // Generate optional properties based on probability
          if (isRequired || Math.random() < 0.8) { // 80% chance for optional properties
            obj[key] = generateValue(propSchema);
          }
        });
      }
      // Handle additionalProperties, patternProperties in a more advanced generator
      return obj;
    }

    // Handle enum
    if (subSchema.enum) {
      return faker.helpers.arrayElement(subSchema.enum);
    }

    // Default fallback for unknown types or root schema
    // If the schema is just a type like { "type": "string" }, handle it directly
     if(subSchema.type) {
         return generateValue({ type: subSchema.type, ...subSchema });
     }


    // If schema is a complex object without a root type, try to generate an object
    if (typeof subSchema === 'object' && subSchema !== null && !Array.isArray(subSchema)) {
         return generateValue({ type: 'object', properties: subSchema });
    }


    // Fallback for unhandled cases
    return null;
  };

  // Generate multiple items if requested
  const generatedData = [];
  for (let i = 0; i < numItems; i++) {
      // If the schema is for a single item (e.g., an object or array)
      if (schema.type === 'object' || schema.type === 'array' || schema.type === 'string' || schema.type === 'number' || schema.type === 'integer' || schema.type === 'boolean' || schema.type === 'null' || schema.enum) {
           generatedData.push(generateValue(schema));
      } else if (typeof schema === 'object' && schema !== null) {
          // If the schema is a root object without a type, assume it describes an object
           generatedData.push(generateValue({ type: 'object', properties: schema }));
      } else {
           // Handle cases where the root schema is just a primitive type name string
           // This is not standard JSON Schema, but handle defensively.
            generatedData.push(generateValue({ type: schema }));
      }

  }

   // If only one item was requested, return the item directly, not in an array
   if (numItems === 1 && generatedData.length === 1) {
       return generatedData[0];
   }


  return generatedData;
};


// Basic XML Data Generator based on an example XML structure
const generateXmlData = (exampleXml, options = {}) => {
    const { numItems = 1 } = options; // Default to generating 1 item
    let generatedXml = '';

    try {
        // Parse the example XML to understand its structure
        const options = { compact: true, ignoreComment: true, spaces: 2 };
        const parsedExample = convert.xml2js(exampleXml, options);

        // Recursive function to generate XML nodes based on the parsed example structure
        const generateXmlNode = (node) => {
            let xml = '';

            if (typeof node === 'object' && node !== null) {
                // Handle attributes
                if (node._attributes) {
                    Object.entries(node._attributes).forEach(([attrKey, attrValue]) => {
                        // Generate mock attribute value (simple string for now)
                         xml += ` ${attrKey}="${faker.lorem.word()}"`; // Generate a random word for attribute value
                    });
                }

                // Handle text content
                if (node._text !== undefined) {
                    // Generate mock text content
                     xml += faker.lorem.sentence(); // Generate a random sentence for text content
                }

                // Handle child elements
                Object.entries(node).forEach(([key, value]) => {
                    // Skip internal keys
                    if (['_attributes', '_text', '_declaration', '_instruction', '_comment', '_cdata', '_doctype'].includes(key)) {
                        return;
                    }

                    // Handle arrays of child elements
                    if (Array.isArray(value)) {
                        value.forEach(item => {
                             xml += `<${key}`;
                             xml += generateXmlNode(item); // Recursively generate item content (attributes, text, children)
                             xml += `</${key}>`;
                        });
                    } else {
                        // Handle single child element
                         xml += `<${key}`;
                         xml += generateXmlNode(value); // Recursively generate value content
                         xml += `</${key}>`;
                    }
                });
            } else {
                 // Handle primitive values that might appear as node values (shouldn't happen often with compact:true)
                 xml += String(node);
            }

            return xml;
        };

        // Generate multiple items if requested
        for (let i = 0; i < numItems; i++) {
            // Assuming the root of the parsed example is the structure to repeat
            // This might need adjustment based on the actual XML structure
            if (parsedExample && typeof parsedExample === 'object' && !Array.isArray(parsedExample)) {
                 // Find the root element key (assuming it's the only key that's not internal)
                 const rootElementKey = Object.keys(parsedExample).find(key => !['_declaration', '_instruction', '_comment', '_cdata', '_doctype'].includes(key));

                 if (rootElementKey) {
                     generatedXml += `<${rootElementKey}`;
                     generatedXml += generateXmlNode(parsedExample[rootElementKey]); // Start generation from the root element's content
                     generatedXml += `</${rootElementKey}>`;
                 } else {
                     throw new Error("Could not identify root element in example XML.");
                 }

            } else {
                 throw new Error("Invalid example XML structure for generation.");
            }
        }


    } catch (error) {
        console.error("XML Generation Error:", error);
        throw new Error("Failed to generate XML data: " + error.message);
    }


    return generatedXml;
};


const Generation = () => {
  // State for input type, schema input, generation options, and output
  const [inputType, setInputType] = useState('json'); // 'json' or 'xml'
  const [schemaInput, setSchemaInput] = useState('');
  const [numItemsToGenerate, setNumItemsToGenerate] = useState(1); // Number of items to generate
  const [generatedData, setGeneratedData] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Function to handle the generation process
  const handleGenerate = () => {
    // Clear previous results and errors
    setGeneratedData('');
    setErrorMessage('');

    // Basic input validation
    if (!schemaInput.trim()) {
      setErrorMessage(`Please provide a ${inputType.toUpperCase()} schema or example structure.`);
      return;
    }

    try {
      let generated;
      if (inputType === 'json') {
        // --- JSON Data Generation ---
        let schema;
        try {
          schema = JSON.parse(schemaInput);
        } catch (e) {
          setErrorMessage('Invalid JSON Schema: ' + e.message);
          return;
        }
        generated = generateJsonData(schema, { numItems: numItemsToGenerate });
        setGeneratedData(JSON.stringify(generated, null, 2)); // Pretty print JSON output

      } else if (inputType === 'xml') {
        // --- XML Data Generation ---
        // For XML, schemaInput is treated as an example XML structure
         generated = generateXmlData(schemaInput, { numItems: numItemsToGenerate });
         setGeneratedData(generated); // XML generator already formats


      }
    } catch (error) {
      // Catch any errors during generation
      setErrorMessage('An error occurred during data generation: ' + error.message);
      console.error('Generation Error:', error);
    }
  };

   // Function to handle downloading the generated data
  const handleDownload = () => {
    if (!generatedData) {
      alert('No data to download.');
      return;
    }

    const fileExtension = inputType === 'json' ? 'json' : 'xml';
    const blob = new Blob([generatedData], { type: `text/${fileExtension}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated_data.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Data Generation Tool</h2>

      {/* Input Type Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-1">Select Output Data Type:</label>
        <select
          id="dataType"
          value={inputType}
          onChange={(e) => {
            setInputType(e.target.value);
            // Clear everything on type change
            setSchemaInput('');
            setNumItemsToGenerate(1);
            setGeneratedData('');
            setErrorMessage('');
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="json">JSON</option>
          <option value="xml">XML</option>
        </select>
      </div>

      {/* Schema Input and Generation Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Schema Input */}
        <div>
          <label htmlFor="schemaInput" className="block text-sm font-medium text-gray-700 mb-1">{inputType === 'json' ? 'JSON Schema' : 'Example XML Structure'}:</label>
          <textarea
            id="schemaInput"
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            rows="12"
            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border rounded-md p-2 font-mono ${errorMessage ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={`Enter your ${inputType === 'json' ? 'JSON Schema' : 'example XML structure'} here...`}
            spellCheck="false"
          ></textarea>
           {errorMessage && (
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          )}
        </div>

        {/* Generation Options */}
        <div>
           <h3 className="text-lg font-semibold mb-2 text-gray-800">Generation Options:</h3>
           {/* Number of Items */}
           <div className="mb-4">
               <label htmlFor="numItems" className="block text-sm font-medium text-gray-700 mb-1">Number of Items to Generate:</label>
               <input
                  id="numItems"
                  type="number"
                  value={numItemsToGenerate}
                  onChange={(e) => setNumItemsToGenerate(parseInt(e.target.value, 10) || 1)} // Ensure integer, default to 1
                  min="1" // Minimum 1 item
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
               />
           </div>
            {/* Add more generation options here in the future */}
            <div className="p-4 border rounded bg-gray-100 text-gray-600 text-sm">
                <p className="font-semibold mb-2">Smart Generation Notes:</p>
                <ul className="list-disc ml-4">
                    <li>Attempts to generate realistic data using Faker.js (e.g., emails, URLs, sentences).</li>
                    <li>For numbers, includes boundary cases (min/max) occasionally.</li>
                    <li>For strings with `minLength=0`, may generate empty strings sometimes.</li>
                    <li>Basic handling for JSON Schema `format` (email, uri, date, uuid, ipv4, ipv6).</li>
                    <li>XML generation is based on the provided example structure; smart content generation is applied to text nodes and attributes.</li>
                </ul>
                 <p className="mt-2 text-xs text-gray-500">More advanced schema features and generation options would require a dedicated library or backend processing.</p>
            </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleGenerate}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Generate Data
        </button>
      </div>

      {/* Generated Data Output Area */}
      {generatedData && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Generated Data:</h3>
          <div className="bg-gray-800 rounded-md overflow-hidden">
            {/* SyntaxHighlighter for code formatting and highlighting */}
            <SyntaxHighlighter
              language={inputType} // Use the selected input type for highlighting
              style={darcula} // Apply the dark code style
              customStyle={{ padding: '15px', overflowX: 'auto', marginBottom: '0' }} // Custom styles
            >
              {generatedData}
            </SyntaxHighlighter>
          </div>
           {/* Download Button */}
            <div className="flex justify-center mt-4">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Download {inputType.toUpperCase()}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Generation;
