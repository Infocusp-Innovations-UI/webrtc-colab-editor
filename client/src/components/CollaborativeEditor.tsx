import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
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
import { searchKeymap, search } from '@codemirror/search';
import { tags } from '@lezer/highlight';
import * as Y from 'yjs';
import { UndoManager } from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { SIGNALLING_SERVERS } from '../constants/constants';
import { User, isObjectUser } from '../utils/user';

/**
 * Collaborative editor component using CodeMirror 6 and Yjs
 * Users in the same room can edit together in real-time
 */
interface CollaborativeEditorProps {
  roomName?: string; // Room name for collaboration session
  localUser: User; // Current user information
  setRemoteUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  roomName = 'default-room',
  localUser,
  setRemoteUsers,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const prevRemoteUsersRef = useRef<User[]>([]);
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create Yjs document and shared text
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('codemirror');
    const provider = new WebrtcProvider(roomName, ydoc, {
      signaling: SIGNALLING_SERVERS,
    });

    // Set up IndexedDB persistence
    const persistence = new IndexeddbPersistence(roomName, ydoc);
    let editorView: EditorView | null = null;
    let undoManager: UndoManager | null = null;

    persistence.on('synced', () => {
      if (editorRef.current && !editorView) {
        // Create undo manager that only tracks local changes
        undoManager = new UndoManager(ytext, {
          trackedOrigins: new Set([null])
        });

        // Custom syntax highlighting theme
        const syntaxTheme = HighlightStyle.define([
          { tag: tags.keyword, color: '#0000ff', fontWeight: 'bold' },
          { tag: tags.comment, color: '#008000', fontStyle: 'italic' },
          { tag: tags.string, color: '#a31515' },
          { tag: tags.number, color: '#098658' },
          { tag: tags.operator, color: '#000000' },
          { tag: tags.variableName, color: '#000' },
          { tag: tags.propertyName, color: '#000' },
          { tag: tags.function(tags.variableName), color: '#795E26' },
        ]);

        // Set current user info in awareness
        provider.awareness.setLocalStateField('user', localUser);

        // Track other online users (remote users)
        const updateUsers = () => {
          const states = Array.from(provider.awareness.getStates().values());
          const remoteUsers = states
            .map((state: any): any => state.user)
            .filter(isObjectUser)
            .filter(({ id }: User) => id !== localUser.id);
          const remoteUserIds = remoteUsers.map(({ id }: User) => id);

          const prevRemoteUsers = prevRemoteUsersRef.current;
          const prevRemoteUserIds = prevRemoteUsers.map(({ id }: User) => id);

          if (!isInitialLoadRef.current) {
            // Notify about new users that joined.
            remoteUsers.forEach(({ id, name }: User) => {
              if (!prevRemoteUserIds.includes(id)) {
                toast.info(`${name} joined`);
              }
            });

            // Notify about users that left.
            prevRemoteUsers.forEach(({ id, name }: User) => {
              if (!remoteUserIds.includes(id)) {
                toast.info(`${name} left`);
              }
            });
          }

          prevRemoteUsersRef.current = remoteUsers;
          isInitialLoadRef.current = false;
          setRemoteUsers(remoteUsers);
        };

        provider.awareness.on('change', updateUsers);
        updateUsers();

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
            search(),
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
              ...searchKeymap,
              ...foldKeymap,
              ...completionKeymap,
              ...closeBracketsKeymap,
              indentWithTab,
              // Custom undo/redo that uses Yjs UndoManager
              {
                key: 'Mod-z',
                run: () => {
                  if (undoManager?.canUndo()) {
                    undoManager.undo();
                    return true;
                  }
                  return false;
                },
              },
              {
                key: 'Mod-y',
                run: () => {
                  if (undoManager?.canRedo()) {
                    undoManager.redo();
                    return true;
                  }
                  return false;
                },
              },
              {
                key: 'Mod-Shift-z',
                run: () => {
                  if (undoManager?.canRedo()) {
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
        editorView = new EditorView({
          state,
          parent: editorRef.current
        });
      }
    });

    // Cleanup
    return () => {
      if (undoManager) undoManager.destroy();
      if (editorView) editorView.destroy();
      persistence.destroy();
      ydoc.destroy();
    };
  }, [roomName, localUser, localUser.id, localUser.name, localUser.color, setRemoteUsers]);

  return (
    <div className="flex flex-col flex-grow bg-gray-100 rounded-lg shadow-lg">
      <div
        ref={editorRef}
        className="flex-grow rounded-b-lg overflow-hidden"
      />
    </div>
  );
};

export default CollaborativeEditor;
