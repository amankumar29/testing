import React, { useEffect } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-chrome"; 
import styles from './JSonEditorPane.module.scss'

const JsonEditor = ({ json, setJson, error, setError }) => {
  
  const handleChange = (newValue) => {
    try {
      JSON.parse(newValue);
      setError(null);
    } catch (e) {
      setError("Invalid JSON format");
    
    }
    setJson(newValue);
  };

  useEffect(() => {
    const editor = document.querySelector(".ace_editor");
    if (editor) {
      editor.querySelector(".ace_gutter").style.backgroundColor = "#E6F2FF";
    }
  }, []);

  // Clean the JSON string by removing unnecessary characters
  const cleanJson = (jsonString) => {
    return jsonString
      .replace(/\\n/g, '')
      .replace(/\\\"/g, '"') 
      .trim(); 
  };

  useEffect(() => {
    if (json) {
      setJson(cleanJson(json));
    }
  }, [json]);

  return (
    <div className="flex flex-col">
    <div className={`relative overflow-y-auto ${styles.sroll}`} style={{ width: '1000px', height: '430px', overflowY:'auto' }}>
      <AceEditor
        mode="json"
        theme="chrome"
        name="json-editor"
        value={json}
        onChange={handleChange}
        editorProps={{ $blockScrolling: true }}
        fontSize="14px"
        style={{
          width: '100%',
          height: "100%",
          paddingLeft: "2rem",
          border: "1px solid #d1d5db",
          borderTopLeftRadius: "0.375rem",
          borderTopRightRadius: "0.375rem",
          backgroundColor: "#E6F2FF",
          color: "#000000",
          fontFamily: "monospace",
          cursor: "text",
          overflowY: "auto"
        }}
        setOptions={{
          highlightActiveLine: true,
          highlightSelectedWord: false,
          showGutter: true,
          selectionStyle: "text",
          wrap: true,
          useWorker: false,
          printMargin: -1,
          printMarginColumn: false
          
        }}
      />
      
    </div>
    {error && <p className="mt-1 text-[14px] text-ird3">{error}</p>}
    
    </div>
  );
};

export default JsonEditor;


