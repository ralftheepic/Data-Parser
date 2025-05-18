
import React, { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';

import * as convert from 'xml-js';
import jsonpath from 'jsonpath';




SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('xml', xml);


const parseAndFormat = (data, type) => {
  if (!data.trim()) {
    return { parsed: null, formatted: '', error: 'Input data is empty.' };
  }
  try {
    if (type === 'json') {
      const parsedJson = JSON.parse(data);
      return { parsed: parsedJson, formatted: JSON.stringify(parsedJson, null, 2), error: '' };
    } else if (type === 'xml') {
      const options = { compact: true, ignoreComment: true, spaces: 2 };
      const parsedXml = convert.xml2js(data, options);
      return { parsed: parsedXml, formatted: convert.js2xml(parsedXml, options), error: '' };
    }
    return { parsed: null, formatted: '', error: 'Unsupported data type.' };
  } catch (error) {
    return { parsed: null, formatted: '', error: `Parsing Error: ${error.message}` };
  }
};


const renderData = (data, currentPath = '', inputType, selectedNodePath, highlightedNodes, handleNodeClick, indentLevel = 0) => {
  if (data === null || data === undefined) {
    const isHighlighted = highlightedNodes.includes(currentPath);
     return (
       <span
         className={`cursor-pointer text-gray-500 ${isHighlighted ? 'bg-yellow-600 bg-opacity-50' : ''}`}
         onClick={(e) => { e.stopPropagation(); handleNodeClick(data, currentPath, inputType); }}
         title={`Get path: ${currentPath}`}
       >
         null
       </span>
     );
  }

  if (inputType === 'xml') {
  
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
   
          return Object.entries(data).map(([key, value], index) => {
             
              if (['_declaration', '_instruction', '_comment', '_cdata', '_doctype'].includes(key)) {
                  return null; 
              }

              if (key === '_attributes') {
                  return Object.entries(value).map(([attrKey, attrValue]) => (
                      <span key={attrKey} className="text-purple-400 mr-1"> {attrKey}="{String(attrValue)}"</span>
                  ));
              }

              if (key === '_text') {
                   const nodePath = currentPath; 
                   const isHighlighted = highlightedNodes.includes(nodePath);
                   return (
                       <span
                           key={key}
                           className={`text-green-400 cursor-pointer ${isHighlighted ? 'bg-yellow-600 bg-opacity-50' : ''}`}
                           onClick={(e) => {
                               e.stopPropagation();
                               handleNodeClick(value, nodePath, inputType); 
                           }}
                           title={`Get path: ${nodePath}/text()`} 
                       >
                           {String(value)}
                       </span>
                   );
               }

            
              const elementPath = currentPath ? `${currentPath}/${key}` : key;
              const isHighlighted = highlightedNodes.includes(elementPath);

              // Handle arrays of elements with the same tag name
              if (Array.isArray(value)) {
                  return value.map((item, itemIndex) => {
                      const itemPath = `${elementPath}[${itemIndex + 1}]`;
                      const isItemHighlighted = highlightedNodes.includes(itemPath);
                       return (
                           <div key={`${itemPath}-${itemIndex}`} className={`ml-4 ${isItemHighlighted ? 'bg-yellow-600 bg-opacity-50' : ''}`}>
                               <span
                                   className="text-blue-400 cursor-pointer"
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       handleNodeClick(item, itemPath, inputType);
                                   }}
                                   title={`Get path: ${itemPath}`}
                               >
                                   &lt;{key}
                               </span>
                             
                               {renderData(item, itemPath, inputType, selectedNodePath, highlightedNodes, handleNodeClick, indentLevel + 1)}
                               <span className="text-blue-400">&gt;</span>
                               
                               {(item._text !== undefined || Object.keys(item).filter(k => !['_attributes', '_text'].includes(k)).length > 0) && (
                                    <span className="text-blue-400">&lt;/{key}&gt;</span>
                               )}
                           </div>
                       );
                  });
              }


             
              return (
                  <div key={key} className={`ml-4 ${isHighlighted ? 'bg-yellow-600 bg-opacity-50' : ''}`}>
                      <span
                          className="text-blue-400 cursor-pointer"
                           onClick={(e) => {
                               e.stopPropagation();
                               handleNodeClick(value, elementPath, inputType);
                           }}
                           title={`Get path: ${elementPath}`}
                      >
                          &lt;{key}
                      </span>
                     
                      {renderData(value, elementPath, inputType, selectedNodePath, highlightedNodes, handleNodeClick, indentLevel + 1)}
                      <span className="text-blue-400">&gt;</span>
                     
                       {(value._text !== undefined || Object.keys(value).filter(k => !['_attributes', '_text'].includes(k)).length > 0) && (
                            <span className="text-blue-400">&lt;/{key}&gt;</span>
                       )}
                  </div>
              );
          });
      } else {
         
           const nodePath = currentPath; 
           const isHighlighted = highlightedNodes.includes(nodePath);
           return (
               <span
                   className={`text-green-400 cursor-pointer ${isHighlighted ? 'bg-yellow-600 bg-opacity-50' : ''}`}
                   onClick={(e) => {
                       e.stopPropagation();
                       handleNodeClick(data, nodePath, inputType); 
                   }}
                    title={`Get path: ${nodePath}/text()`} 
               >
                   {String(data)}
               </span>
           );
      }
  }


  if (Array.isArray(data)) {
    const isHighlighted = highlightedNodes.includes(currentPath);
    return (
      <span className={`${isHighlighted ? 'bg-yellow-600 bg-opacity-50' : ''}`}>
        <span
          className="cursor-pointer text-gray-500"
          onClick={(e) => { e.stopPropagation(); handleNodeClick(data, currentPath, inputType); }}
           title={`Get path: ${currentPath}`}
        >
          [
        </span>
        {data.map((item, index) => {
          const itemPath = `${currentPath}[${index}]`;
          return (
            <React.Fragment key={index}>
              <br />
              {'  '.repeat(indentLevel + 1)} {/* Add indentation */}
              {renderData(item, itemPath, inputType, selectedNodePath, highlightedNodes, handleNodeClick, indentLevel + 1)}
              {index < data.length - 1 ? ',' : ''} {/* Add comma for all but the last item */}
            </React.Fragment>
          );
        })}
        <br />
        {'  '.repeat(indentLevel)} {/* Add indentation for closing bracket */}
        <span
          className="cursor-pointer text-gray-500"
          onClick={(e) => { e.stopPropagation(); handleNodeClick(data, currentPath, inputType); }}
           title={`Get path: ${currentPath}`}
        >
          ]
        </span>
      </span>
    );
  }

  if (typeof data === 'object') {
     const isHighlighted = highlightedNodes.includes(currentPath);
    return (
       <span className={`${isHighlighted ? 'bg-yellow-600 bg-opacity-50' : ''}`}>
        <span
          className="cursor-pointer text-gray-500"
          onClick={(e) => { e.stopPropagation(); handleNodeClick(data, currentPath, inputType); }}
           title={`Get path: ${currentPath}`}
        >
          {'{'} 
        </span>
        {Object.entries(data).map(([key, value], index, arr) => {
          const itemPath = `${currentPath}.${key}`;
          
          const cleanItemPath = itemPath.startsWith('.') ? itemPath.substring(1) : itemPath;

          return (
            <React.Fragment key={key}>
              <br />
              {'  '.repeat(indentLevel + 1)} 
              <span
                 className="cursor-pointer text-blue-400"
                 onClick={(e) => { e.stopPropagation(); handleNodeClick(value, cleanItemPath, inputType); }}
                 title={`Get path: ${cleanItemPath}`}
              >
                 "{key}"
              </span>
              : {renderData(value, cleanItemPath, inputType, selectedNodePath, highlightedNodes, handleNodeClick, indentLevel + 1)}
              {index < arr.length - 1 ? ',' : ''} 
            </React.Fragment>
          );
        })}
        <br />
        {'  '.repeat(indentLevel)} 
         <span
          className="cursor-pointer text-gray-500"
          onClick={(e) => { e.stopPropagation(); handleNodeClick(data, currentPath, inputType); }}
           title={`Get path: ${currentPath}`}
        >
          {'}'} 
        </span>
      </span>
    );
  }

  // Handle primitive values (string, number, boolean)
  const isHighlighted = highlightedNodes.includes(currentPath);
  return (
    <span
      className={`cursor-pointer ${isHighlighted ? 'bg-yellow-600 bg-opacity-50' : ''}`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling
        handleNodeClick(data, currentPath, inputType);
      }}
       title={`Get path: ${currentPath}`}
    >
      {typeof data === 'string' ? (
        <span className="text-green-400">"{String(data)}"</span>
      ) : (
        <span className="text-orange-400">{String(data)}</span>
      )}
    </span>
  );
};


const Inspector = () => {
  const [inputType, setInputType] = useState('json');
  const [inputData, setInputData] = useState('');
  
  const [parsedData, setParsedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  
  const [selectedNodePath, setSelectedNodePath] = useState('');

  const [expressionInput, setExpressionInput] = useState('');

  const [highlightedNodes, setHighlightedNodes] = useState([]);

  const [evaluationResultMessage, setEvaluationResultMessage] = useState(null);

  const [evaluationValues, setEvaluationValues] = useState(null);


  const handleParse = () => {
    setErrorMessage('');
    setParsedData(null);
    setSelectedNodePath('');
    setExpressionInput('');
    setHighlightedNodes([]);
    setEvaluationResultMessage(null);
    setEvaluationValues(null);


    const result = parseAndFormat(inputData, inputType);
    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setParsedData(result.parsed);
    }
  };

  const handleNodeClick = (node, path, type) => {
    setSelectedNodePath(path);
    console.log(`Clicked node path: ${path}`, node); 
  };

 
  const handleEvaluate = () => {
    setErrorMessage('');
    setHighlightedNodes([]);
    setEvaluationResultMessage(null);
    setEvaluationValues(null);


    if (!parsedData) {
      setErrorMessage('Parse the data first.');
      return;
    }

    if (!expressionInput.trim()) {
        setErrorMessage('Enter an expression to evaluate.');
        return;
    }

    try {
      if (inputType === 'json') {
        
        const resultValues = jsonpath.query(parsedData, expressionInput);
        setEvaluationValues(resultValues);
        setEvaluationResultMessage(`Found ${resultValues.length} matching values.`);
       


      } else if (inputType === 'xml') {
        if (document.evaluate) {
            const xmlDoc = new DOMParser().parseFromString(inputData, 'text/xml');
            const evaluator = new XPathEvaluator();
            const result = evaluator.evaluate(
                expressionInput,
                xmlDoc.documentElement, 
                null,
                XPathResult.ANY_TYPE,
                null
            );

            const matchingPaths = [];
            const extractedValues = []; 
            let node = result.iterateNext();
            while (node) {
                let path = '';
                let currentNode = node;
                
                while(currentNode && currentNode.nodeType !== Node.DOCUMENT_NODE) {
                    let segment = currentNode.nodeName;

                    
                     if (currentNode.nodeType === Node.ELEMENT_NODE) { 
                         let index = 1;
                         let sibling = currentNode.previousSibling;
                         while(sibling) {
                             if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === currentNode.nodeName) {
                                 index++;
                             }
                             sibling = sibling.previousSibling;
                         }
                        
                         if (currentNode.parentNode && currentNode.parentNode.querySelectorAll(':scope > ' + currentNode.nodeName).length > 1) {
                             segment += `[${index}]`;
                         }
                     } else if (currentNode.nodeType === Node.TEXT_NODE) {
                         segment = 'text()'; 
                          if (currentNode.parentNode) {
                              let textNodeIndex = 1;
                              let sibling = currentNode.previousSibling;
                              while(sibling) {
                                   if (sibling.nodeType === Node.TEXT_NODE) {
                                       textNodeIndex++;
                                   }
                                   sibling = sibling.previousSibling;
                              }
                               
                              if (currentNode.parentNode.childNodes.length > 1) { 
                                   let textSiblings = 0;
                                   currentNode.parentNode.childNodes.forEach(child => {
                                       if (child.nodeType === Node.TEXT_NODE) textSiblings++;
                                   });
                                   if (textSiblings > 1) {
                                        segment += `[${textNodeIndex}]`;
                                   }
                              }
                          }
                     } else if (currentNode.nodeType === Node.ATTRIBUTE_NODE) {
                         segment = `@${currentNode.nodeName}`; 
                     }


                    path = segment + (path ? '/' + path : '');
                    currentNode = currentNode.parentNode;
                }
                
                 if (path && !path.startsWith('/')) {
                    path = '/' + path;
                 }

                matchingPaths.push(path); 

              
                let nodeValue = '';
                if (node.nodeType === Node.ELEMENT_NODE) {
                    nodeValue = node.textContent; 
                } else if (node.nodeType === Node.TEXT_NODE) {
                    nodeValue = node.nodeValue; 
                } else if (node.nodeType === Node.ATTRIBUTE_NODE) {
                    nodeValue = node.nodeValue; 
                }
                extractedValues.push(nodeValue); 


                node = result.iterateNext();
            }
             setHighlightedNodes(matchingPaths);
             setEvaluationValues(extractedValues); 
             setEvaluationResultMessage(`Found ${matchingPaths.length} matching nodes.`);


        } else {
            setErrorMessage('XPath evaluation is not supported in this browser.');
        }
      }
    } catch (error) {
      setErrorMessage(`Evaluation Error: ${error.message}`);
      console.error('Evaluation Error:', error);
    }
  };


  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Data Inspector Tool</h2>

      {/* Input Type Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-1">Select Data Type:</label>
        <select
          id="dataType"
          value={inputType}
          onChange={(e) => {
            setInputType(e.target.value);
            // Clear everything on type change
            setInputData('');
            setParsedData(null);
            setErrorMessage('');
            setSelectedNodePath('');
            setExpressionInput('');
            setHighlightedNodes([]);
            setEvaluationResultMessage(null);
            setEvaluationValues(null);
          }}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="json">JSON</option>
          <option value="xml">XML</option>
        </select>
      </div>

      {/* Input Area */}
      <div className="mb-4">
        <label htmlFor="dataInput" className="block text-sm font-medium text-gray-700 mb-1">Input {inputType.toUpperCase()} Data:</label>
        <textarea
          id="dataInput"
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          rows="10"
          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border rounded-md p-2 font-mono ${errorMessage ? 'border-red-500' : 'border-gray-300'}`}
          placeholder={`Enter your ${inputType.toUpperCase()} data here...`}
          spellCheck="false"
        ></textarea>
         {errorMessage && (
          <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>

      {/* Parse Button */}
      <div className="mb-6">
        <button
          onClick={handleParse}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Parse Data
        </button>
      </div>

      {/* Parsed Data View and Path Display */}
      {parsedData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Parsed Data View */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Parsed Data Structure:</h3>
             <div className="bg-gray-800 text-white rounded-md overflow-auto p-4 max-h-96"> {/* Added max-height and overflow-auto */}
                <pre className="whitespace-pre-wrap break-words">
                    {renderData(parsedData, '', inputType, selectedNodePath, highlightedNodes, handleNodeClick)}
                </pre>
             </div>
          </div>

          {/* Path Display and Expression Evaluation */}
          <div>
             <h3 className="text-lg font-semibold mb-2 text-gray-800">Node Path & Expression Evaluation:</h3>
             {/* Selected Node Path */}
             <div className="mb-4">
                 <label htmlFor="nodePath" className="block text-sm font-medium text-gray-700 mb-1">{inputType === 'json' ? 'JSONPath' : 'XPath'} of Selected Node:</label>
                 <textarea
                    id="nodePath"
                    value={selectedNodePath}
                    readOnly // Make it read-only
                    rows="2"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2 font-mono bg-gray-100"
                    placeholder="Click on a node in the parsed data to see its path..."
                 ></textarea>
             </div>

             {/* Expression Input and Evaluate Button */}
             <div className="mb-4">
                 <label htmlFor="expressionInput" className="block text-sm font-medium text-gray-700 mb-1">Evaluate {inputType === 'json' ? 'JSONPath' : 'XPath'} Expression:</label>
                 <input
                    id="expressionInput"
                    type="text"
                    value={expressionInput}
                    onChange={(e) => setExpressionInput(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2 font-mono"
                    placeholder={`Enter ${inputType === 'json' ? 'JSONPath' : 'XPath'} expression...`}
                 />
             </div>
             <div className="mb-4">
                 <button
                    onClick={handleEvaluate}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                 >
                    Evaluate
                 </button>
             </div>

             {/* Evaluation Result Message */}
             {evaluationResultMessage !== null && (
                 <div className="mt-4">
                     <h4 className="text-md font-semibold mb-2 text-gray-800">Evaluation Status:</h4>
                     <p className="text-sm text-gray-700">{evaluationResultMessage}</p>
                 </div>
             )}

             {/* Evaluation Values Output Box */}
             {evaluationValues !== null && (
                 <div className="mt-4">
                     <h4 className="text-md font-semibold mb-2 text-gray-800">Evaluated Values:</h4>
                     <div className="bg-gray-100 rounded-md p-3 text-sm text-gray-700 overflow-auto max-h-40">
                         {evaluationValues.length > 0 ? (
                             // Display values, handling arrays and single values
                             Array.isArray(evaluationValues) ? (
                                 <pre className="whitespace-pre-wrap break-words">{JSON.stringify(evaluationValues, null, 2)}</pre>
                             ) : (
                                  <pre className="whitespace-pre-wrap break-words">{String(evaluationValues)}</pre>
                             )
                         ) : (
                             <p>No values found for the expression.</p>
                         )}
                     </div>
                 </div>
             )}


             {/* Highlighting Legend */}
             {highlightedNodes.length > 0 && (
                 <p className="mt-4 text-sm text-gray-600">
                     <span className="inline-block w-4 h-4 bg-yellow-600 bg-opacity-50 mr-2 align-middle"></span> Highlighted nodes match the expression.
                 </p>
             )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Inspector;
