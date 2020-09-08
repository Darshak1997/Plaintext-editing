import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Editor, EditorState, ContentState, convertToRaw } from 'draft-js'
import css from "../pages/style.module.css";

var valueNew = "";

function MarkdownEditor({ file, write }) {
  console.log(file, write);
  var [value, setValue] = useState('');

  useEffect(() => {
    (async () => {
      setValue(await file.text());
    })();
  }, [file]);

  var conditionRender;
    if(value && valueNew !== value){
      conditionRender = <MarkdownEditorNew value = {value} file = {file} write = {write} />
    }

  valueNew = value

  return (
    <div>
      {conditionRender}
    </div>
  );
}

class MarkdownEditorNew extends React.Component{
  constructor(props){
    super(props);
    var plainText = (this.props.value);
    var content = ContentState.createFromText(plainText);
    this.state = { editorState: EditorState.createWithContent(content)};

    this.onChange = this.onChange.bind(this);
  }

  onChange(editorState) {
    var valueNew2 = ""
    var rawBlocks = (convertToRaw(this.state.editorState.getCurrentContent()).blocks)
    for (let i = 0; i < rawBlocks.length; i++){
      valueNew2 += rawBlocks[i].text
    }

    this.props.write(this.props.file, valueNew2)
    this.setState({editorState});
  }
  

  render(){
    return(
      <div className={css.preview}>
        <div className={css.title}>{this.props.file.name}</div>
          <div className={css.content}>
            <Editor
            editorState={this.state.editorState} 
            onChange={this.onChange} 
            spellCheck={true}
            />
          </div>
          <div className={css.preview}>
            <h2 className={css.title}>PREVIEW</h2>
            <div className={css.content}>
              <MarkdownPreview source = {this.props.value} />
            </div>
          </div>
      </div>
    )
  }
}

MarkdownEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

MarkdownEditorNew.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func,
  value: PropTypes.string
}

export default MarkdownEditor;
