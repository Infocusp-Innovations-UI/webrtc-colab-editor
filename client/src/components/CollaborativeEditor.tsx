import React, { useEffect, useRef, useState } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import {
  syntaxHighlighting,
  HighlightStyle,
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap
} from '@codemirror/language';
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap
} from '@codemirror/autocomplete';
import { tags } from '@lezer/highlight';
import * as Y from 'yjs';
import { UndoManager } from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { yCollab } from 'y-codemirror.next';
import './CollaborativeEditor.css';

/**
 * Collaborative editor component using CodeMirror 6 and Yjs
 * Users in the same room can edit together in real-time
 */
interface CollaborativeEditorProps {
  roomName?: string; // Room name for collaboration session
  userName?: string; // Current user's display name
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  roomName = 'default-room',
  userName = 'Anonymous'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create Yjs document and shared text
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('codemirror');

    // Set up WebSocket provider with user awareness
    const provider = new WebsocketProvider(
      'ws://localhost:1234',
      roomName,
      ydoc
    );

    // Set current user info in awareness
    provider.awareness.setLocalStateField('user', {
      name: userName,
      color: getRandomColor()
    });

    // Track other online users
    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states
        .map((state: any) => state.user?.name)
        .filter((name): name is string => !!name && name !== userName);
      setOnlineUsers(users);
    };

    provider.awareness.on('change', updateUsers);
    updateUsers();

    // Create undo manager that only tracks local changes
    const undoManager = new UndoManager(ytext, {
      trackedOrigins: new Set([null])
    });

    // Custom syntax highlighting theme
    const syntaxTheme = HighlightStyle.define([
      { tag: tags.keyword, color: '#0000ff', fontWeight: 'bold' },
      { tag: tags.comment, color: '#008000', fontStyle: 'italic' },
      { tag: tags.string, color: '#a31515' },
      { tag: tags.number, color: '#098658' },
      { tag: tags.operator, color: '#000000' },
      { tag: tags.variableName, color: '#001080' },
      { tag: tags.propertyName, color: '#001080' },
      { tag: tags.function(tags.variableName), color: '#795E26' },
    ]);

    // Configure editor with comprehensive extensions
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        foldGutter(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        javascript(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        syntaxHighlighting(syntaxTheme),
        EditorView.lineWrapping,
        EditorState.tabSize.of(2),

        // Yjs collaboration with undo manager
        yCollab(ytext, provider.awareness, { undoManager }),

        // Custom theme
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-content': {
            fontSize: '14px',
            paddingTop: '16px',
          },
          '.cm-scroller': {
            fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
            fontSize: '14px',
            lineHeight: '1.5',
          },
        }),

        // Keymaps for various features
        keymap.of([
          ...defaultKeymap,
          ...foldKeymap,
          ...completionKeymap,
          ...closeBracketsKeymap,
          indentWithTab,
          // Custom undo/redo that uses Yjs UndoManager
          {
            key: 'Mod-z',
            run: () => {
              if (undoManager.canUndo()) {
                undoManager.undo();
                return true;
              }
              return false;
            },
          },
          {
            key: 'Mod-y',
            run: () => {
              if (undoManager.canRedo()) {
                undoManager.redo();
                return true;
              }
              return false;
            },
          },
          {
            key: 'Mod-Shift-z',
            run: () => {
              if (undoManager.canRedo()) {
                undoManager.redo();
                return true;
              }
              return false;
            },
          },
        ]),
      ]
    });

    // Create and mount editor
    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    // Cleanup
    return () => {
      undoManager.destroy();
      view.destroy();
      provider.awareness.off('change', updateUsers);
      provider.destroy();
      ydoc.destroy();
    };
  }, [roomName, userName]);

  return (
    <div>
      {/* Online users indicator */}
      {onlineUsers.length > 0 && (
        <div className="online-users">
          <span className="online-indicator">●</span>
          {onlineUsers.length} user{onlineUsers.length > 1 ? 's' : ''} online
          {onlineUsers.length <= 3 && `: ${onlineUsers.join(', ')}`}
        </div>
      )}

      {/* Editor container */}
      <div
        ref={editorRef}
        className="collaborative-editor-container"
      />
    </div>
  );
};

// Helper function to generate random colors for user cursors
function getRandomColor(): string {
  const colors = [
    '#30bced', '#6eeb83', '#ffbc42', '#ecd444', '#ee6352',
    '#9ac2c9', '#8acb88', '#1be7ff'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default CollaborativeEditor;
