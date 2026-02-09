import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface DiffViewProps {
  oldValue: string;
  newValue: string;
  leftTitle?: string;
  rightTitle?: string;
  onAccept: () => void;
  onReject: () => void;
  acceptLabel?: string;
  rejectLabel?: string;
}

const diffStyles = {
  variables: {
    light: {
      diffViewerBackground: '#faf8f5',
      diffViewerColor: '#2c2c2c',
      addedBackground: '#e8f5e9',
      addedColor: '#2e5a32',
      removedBackground: '#fce8e6',
      removedColor: '#8b3a34',
      wordAddedBackground: '#c8e6c9',
      wordRemovedBackground: '#f5c6c2',
      addedGutterBackground: '#e8f5e9',
      removedGutterBackground: '#fce8e6',
      gutterBackground: '#f3f0eb',
      gutterBackgroundDark: '#f3f0eb',
      highlightBackground: '#eae6df',
      highlightGutterBackground: '#eae6df',
      codeFoldGutterBackground: '#f3f0eb',
      codeFoldBackground: '#eae6df',
      emptyLineBackground: '#faf8f5',
      gutterColor: '#9a9a9a',
      addedGutterColor: '#5a8a5e',
      removedGutterColor: '#c0605a',
      codeFoldContentColor: '#5a5a5a',
    },
  },
};

export function DiffView({
  oldValue,
  newValue,
  leftTitle = 'Current',
  rightTitle = 'Proposed',
  onAccept,
  onReject,
  acceptLabel = 'Accept Changes',
  rejectLabel = 'Reject',
}: DiffViewProps) {
  return (
    <>
      <div className="diff-actions">
        <button className="btn btn-accept" onClick={onAccept}>
          {acceptLabel}
        </button>
        <button className="btn btn-reject" onClick={onReject}>
          {rejectLabel}
        </button>
      </div>
      <div className="diff-container">
        <ReactDiffViewer
          oldValue={oldValue}
          newValue={newValue}
          splitView={true}
          compareMethod={DiffMethod.WORDS}
          leftTitle={leftTitle}
          rightTitle={rightTitle}
          useDarkTheme={false}
          styles={diffStyles}
        />
      </div>
    </>
  );
}
