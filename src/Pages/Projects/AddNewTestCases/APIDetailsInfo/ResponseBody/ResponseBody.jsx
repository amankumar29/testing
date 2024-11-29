import React, { useEffect, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-chrome";
import styles from "./ResponseBody.module.scss";

const ResponseBody = ({ response }) => {

  const [json, setJsonState] = useState("");

  useEffect(() => {
    const editor = document.querySelector(".ace_editor");

    if (editor) {
      editor.querySelector(".ace_gutter").style.backgroundColor = "#E6F2FF";
    }
  }, []);

  // Clean the JSON string by removing unnecessary characters

  const cleanJson = (jsonString) => {
    return jsonString
      .replace(/\\n/g, "")
      .replace(/\\\"/g, '"')
      .trim();
  };

  useEffect(() => {
    if (response) {
      const cleanResponse = cleanJson(JSON.stringify(response, null, 2));
      setJsonState(cleanResponse);
    }
  }, [response]);

  return (
    <div className="flex flex-col">
      <div
        className={`relative overflow-y-auto ${styles.sroll} mt-[10px]`}
        style={{ width: "1000px", height: "400px", overflowY: "auto" }}
      >
        <AceEditor
          mode="json"
          theme="chrome"
          name="json-editor"
          value={json}
          editorProps={{ $blockScrolling: true }}
          fontSize="14px"
          readOnly={true}
          style={{
            width: "100%",
            height: "100%",
            paddingLeft: "2rem",
            border: "1px solid #d1d5db",
            borderTopLeftRadius: "0.375rem",
            borderTopRightRadius: "0.375rem",
            backgroundColor: "#E6F2FF",
            color: "#000000",
            fontFamily: "monospace",
            cursor: "text",
            overflowY: "auto",
          }}
          setOptions={{
            highlightActiveLine: true,
            highlightSelectedWord: false,
            showGutter: true,
            selectionStyle: "text",
            wrap: true,
            useWorker: false,
            printMargin: -1,
            printMarginColumn: false,
          }}
        />
      </div>
    </div>
  );
};

export default ResponseBody;