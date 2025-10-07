import React, { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { yCollab } from 'y-codemirror.next';

/**
 * Props for the CollaborativeEditor component
 */
interface CollaborativeEditorProps {
  roomName?: string; // The collaboration room name - users in the same room will see each other's edits
}

/**
 * CollaborativeEditor Component
 *
 * A React component that provides a collaborative code editor using CodeMirror 6 and Yjs.
 * Multiple users can edit the same document in real-time, similar to Google Docs.
 *
 * How it works:
 * 1. Creates a Yjs document (CRDT - Conflict-free Replicated Data Type) for synchronized state
 * 2. Connects to a WebSocket server to sync changes with other users
 * 3. Binds the Yjs document to CodeMirror editor for real-time collaboration
 */
const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  roomName = 'default-room' // Default room if not specified
}) => {
  // Reference to the DOM element where CodeMirror will be mounted
  const editorRef = useRef<HTMLDivElement>(null);

  // Reference to the CodeMirror EditorView instance
  // We store this to access the editor instance if needed and for cleanup
  const viewRef = useRef<EditorView | null>(null);

  /**
   * Effect hook that sets up the collaborative editor
   * Runs when component mounts or when roomName changes
   */
  useEffect(() => {
    // Safety check: ensure the DOM element exists before proceeding
    if (!editorRef.current) return;

    // Step 1: Create a new Yjs document
    // This is the shared data structure that will be synchronized across all users
    const ydoc = new Y.Doc();

    // Create a shared text type called 'codemirror'
    // This is where the editor content will be stored
    // Yjs provides different shared types (Text, Array, Map, etc.)
    const ytext = ydoc.getText('codemirror');

    // Step 2: Set up WebSocket provider for real-time synchronization
    // This connects to your WebSocket server and handles:
    // - Sending local changes to other users
    // - Receiving and applying changes from other users
    // - Managing user presence/awareness (cursors, selections)
    const provider = new WebsocketProvider(
      'ws://localhost:1234', // WebSocket server URL - change this to your server address
      roomName,              // Room/channel name - users in same room collaborate together
      ydoc                   // The Yjs document to synchronize
    );

    // Step 3: Create CodeMirror editor state
    // This configures the editor with all necessary extensions
    const state = EditorState.create({
      // Initialize editor with current content from Yjs (usually empty on first load)
      doc: ytext.toString(),

      // Extensions add features to the editor
      extensions: [
        basicSetup,              // Basic editor features (line numbers, undo/redo, search, etc.)
        javascript(),            // JavaScript syntax highlighting and language support

        // yCollab is the magic that connects CodeMirror to Yjs
        // It handles:
        // - Converting CodeMirror changes to Yjs operations
        // - Applying remote Yjs changes to CodeMirror
        // - Showing other users' cursors and selections via awareness
        yCollab(ytext, provider.awareness)
      ]
    });

    // Step 4: Create the CodeMirror editor view and mount it to the DOM
    const view = new EditorView({
      state,                    // The editor state we just created
      parent: editorRef.current // Mount the editor inside our ref element
    });

    // Store the view instance for potential future use
    viewRef.current = view;

    // Step 5: Cleanup function
    // This runs when the component unmounts or when roomName changes
    // Important: Always clean up to prevent memory leaks and connection issues
    return () => {
      view.destroy();        // Destroy the CodeMirror editor instance
      provider.destroy();    // Close WebSocket connection and clean up listeners
      ydoc.destroy();        // Clean up the Yjs document
    };
  }, [roomName]); // Re-run effect if roomName changes (switch to different collaboration room)

  return (
    <div
      ref={editorRef}
      style={{
        height: '500px',        // Fixed height for the editor
        border: '1px solid #ddd', // Simple border for visual separation
        fontSize: '14px'        // Comfortable reading size
      }}
    />
  );
};

export default CollaborativeEditor;
