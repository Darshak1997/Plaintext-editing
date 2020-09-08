import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Editor, EditorState, RichUtils, ContentState, convertToRaw, getDefaultKeyBinding } from 'draft-js'
import 'draft-js/dist/Draft.css';
import css from "../../pages/style.module.css";
import "./RichEditor.css"

var valueNew = ""

function PlaintextEditor({ file, write }) {
  var [value, setValue] = useState('');

  useEffect(() => {
    (async () => {
      setValue(await file.text());
    })();
  }, [file]);


  var conditionRender;
    if(value && valueNew !== value){
      conditionRender = <PlaintextEditorNew value = {value} file = {file} write = {write} />
    }

  valueNew = value
  return (
    <div>
      {conditionRender}
    </div>
    
  );
}

class PlaintextEditorNew extends React.Component{
  constructor(props) {
    super(props);

    var plainText = (this.props.value);
    var content = ContentState.createFromText(plainText);
    this.state = { editorState: EditorState.createWithContent(content)};

    this.onChange = this.onChange.bind(this);

    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
  }

  onChange(editorState) {
    var blobToSend = ""
    var rawBlocks = (convertToRaw(this.state.editorState.getCurrentContent()).blocks)
    for (let i = 0; i < rawBlocks.length; i++){
      blobToSend += rawBlocks[i].text
    }
    this.props.write(this.props.file, blobToSend)
    this.setState({editorState});
  } 

    _handleKeyCommand(command, editorState) {
      const newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        this.onChange(newState);
        return true;
      }
      return false;
    }


    _mapKeyToEditorCommand(e) {
      if (e.keyCode === 9 /* TAB */) {
        const newEditorState = RichUtils.onTab(
          e,
          this.state.editorState,
          4, /* maxDepth */
        );
        if (newEditorState !== this.state.editorState) {
          this.onChange(newEditorState);
        }
        return;
      }
      return getDefaultKeyBinding(e);
    }

    _toggleBlockType(blockType) {
      this.onChange(
        RichUtils.toggleBlockType(
          this.state.editorState,
          blockType
        )
      );
    }

    _toggleInlineStyle(inlineStyle) {
      this.onChange(
        RichUtils.toggleInlineStyle(
          this.state.editorState,
          inlineStyle
        )
      );
    }

  render() {
    const {editorState} = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder';
      }
    }
    return (
        <div className={css.preview}>
          <div className={css.title}>{this.props.file.name}</div>
            <div className={css.content}>
        <div className="RichEditor-root">
              <BlockStyleControls
                editorState={editorState}
                onToggle={this.toggleBlockType}
              />
              <InlineStyleControls
                editorState={this.state.editorState}
                onToggle={this.toggleInlineStyle}
              />
              <hr></hr>
              <div className={className}>
                <Editor 
                blockStyleFn={getBlockStyle}
                customStyleMap={styleMap}
                editorState={this.state.editorState} 
                handleKeyCommand={this.handleKeyCommand}
                onChange={this.onChange} 
                ref="editor"
                spellCheck={true}
                />
              </div>
             </div>
        </div>
        </div>
      
      
    );
  }

}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  {label: 'H1', style: 'header-one'},
  {label: 'H2', style: 'header-two'},
  {label: 'H3', style: 'header-three'},
  {label: 'H4', style: 'header-four'},
  {label: 'H5', style: 'header-five'},
  {label: 'H6', style: 'header-six'},
  {label: 'Blockquote', style: 'blockquote'},
  {label: 'UL', style: 'unordered-list-item'},
  {label: 'OL', style: 'ordered-list-item'},
  {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
  const {editorState} = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

var INLINE_STYLES = [
  {label: 'Bold', style: 'BOLD'},
  {label: 'Italic', style: 'ITALIC'},
  {label: 'Underline', style: 'UNDERLINE'},
  {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();
  
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

PlaintextEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

PlaintextEditorNew.propTypes = {
  value: PropTypes.string,
  file: PropTypes.object,
  write: PropTypes.func
}

export default PlaintextEditor;
