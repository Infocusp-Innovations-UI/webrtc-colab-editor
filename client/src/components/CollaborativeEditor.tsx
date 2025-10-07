import React, { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { yCollab } from 'y-codemirror.next';
import './CollaborativeEditor.css';

/**
 * Collaborative editor component using CodeMirror 6 and Yjs
 * Users in the same room can edit together in real-time
 */
interface CollaborativeEditorProps {
  roomName?: string; // Room name for collaboration session
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  roomName = 'default-room'
}) => {
  // DOM element where CodeMirror will mount
  const editorRef = useRef<HTMLDivElement>(null);
  // CodeMirror editor instance
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create Yjs document (shared data structure)
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('codemirror');

    // Connect to WebSocket server for real-time sync
    const provider = new WebsocketProvider(
      'ws://localhost:1234',
      roomName,
      ydoc
    );

    // Configure CodeMirror with extensions
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        basicSetup,              // Line numbers, undo/redo, search, etc.
        javascript(),            // JavaScript syntax highlighting
        yCollab(ytext, provider.awareness) // Yjs binding for collaboration
      ]
    });

    // Create and mount the editor
    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    // Cleanup on unmount or room change
    return () => {
      view.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [roomName]);

  return (
    <div
      ref={editorRef}
      className="collaborative-editor-container"
    />
  );
};

export default CollaborativeEditor;
