import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Editor from 'react-simple-code-editor';
import css from "../pages/style.module.css";
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

var code = ""

function CodeEditor({ file, write }) {
  console.log(file, write);
  var [value, setValue] = useState('');

  useEffect(() => {
    (async () => {
      setValue(await file.text());
    })();
  }, [file]);

  var conditionRender;
    if(value && code !== value){
      conditionRender = <CodeEditorNew />
    }

  code = value

  return (
    <div className={css.preview}>
      <div className={css.title}>{file.name}</div>
      <div className={css.content}>
        {conditionRender}
      </div>
    </div>
  );
}


class CodeEditorNew extends React.Component{
    state = {code}
    
    render(){
        return (
            <Editor
                value={this.state.code}
                onValueChange={code => this.setState({ code })}
                highlight={code => highlight(code, languages.js)}
                padding={10}
                style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                }}
            />
        )
    
    }
}


CodeEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

export default CodeEditor;
