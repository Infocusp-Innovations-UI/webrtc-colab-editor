import React, { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { yCollab } from 'y-codemirror.next';

interface CollaborativeEditorProps {
  roomName?: string;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  roomName = 'default-room'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create Yjs document
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('codemirror');

    // Connect to WebSocket server
    const provider = new WebsocketProvider(
      'ws://localhost:1234', // WebSocket server URL
      roomName,
      ydoc
    );

    // Create CodeMirror editor state with Yjs binding
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,
        javascript(),
        yCollab(ytext, provider.awareness)
      ]
    });

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    // Cleanup
    return () => {
      view.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [roomName]);

  return (
    <div
      ref={editorRef}
      style={{
        height: '500px',
        border: '1px solid #ddd',
        fontSize: '14px'
      }}
    />
  );
};

export default CollaborativeEditor;
