import React, { useState } from 'react';
import { useLibrarySearch } from '../hooks/useLibrarySearch';
import { Divider, Paper } from '@material-ui/core';
import { CodeBlock, dracula } from 'react-code-blocks';
import { Progress } from '@backstage/core-components';

export type SearchItem = {
  git_url: string;
  html_url: string;
  name: string;
  path: string;
  repository: { [key: string]: string };
  score: string;
};

export type LibraryCodeContentProps = {
  searchItem: SearchItem;
};

const LibraryCodeContent = ({ searchItem }: LibraryCodeContentProps) => {
  const { fetchCodeContent } = useLibrarySearch(); // Import the hook
  const [codeContent, setCodeContent] = useState<string | null>(null);
  const [isContentVisible, setIsContentVisible] = useState(false);

  const handleClick = async () => {
    if (isContentVisible) {
      setIsContentVisible(false);
    } else if (searchItem && searchItem.repository && !codeContent) {
      const result = await fetchCodeContent(
        searchItem.repository.contents_url,
        searchItem,
      );

      const resultDecoded = result ? atob(result.content) : null;
      setCodeContent(resultDecoded);
      setIsContentVisible(true);
    } else {
      setIsContentVisible(true);
    }
  };

  return (
    <div style={{ width: 600 }}>
      {searchItem ? (
        <Paper
          variant="outlined"
          style={{
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 5,
              paddingBottom: 7,
              paddingLeft: 5,
              paddingRight: 5,
              fontSize: 13,
              background: 'rgb(191 191 191 / 16%)',
            }}
          >
            <a
              href={searchItem.html_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: isContentVisible ? '#66b9ff' : 'inherit',
              }}
            >
              <b>File path:</b>{' '}
              <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                {searchItem.path}
              </span>
            </a>

            <button
              onClick={handleClick}
              style={{
                background: 'none',
                color: '#66b9ff',
                fontWeight: 600,
                fontFamily: 'inherit',
                border: 'none',
                textDecoration: 'underline',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              {isContentVisible ? 'hide code' : 'show code'}
            </button>
          </div>

          {isContentVisible && (
            <div
              style={{
                maxHeight: 400,
                overflow: 'auto',
              }}
            >
              <Divider />
              {codeContent ? (
                <pre
                  style={{
                    fontSize: 12,
                    margin: 0,
                    padding: 10,
                  }}
                >
                  {/* @ts-ignore */}
                  <CodeBlock
                    text={codeContent}
                    showLineNumbers
                    theme={dracula}
                    language={searchItem.name.slice(
                      searchItem.name.lastIndexOf('.') + 1,
                    )}
                  />
                </pre>
              ) : (
                <Progress />
              )}
            </div>
          )}
        </Paper>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default LibraryCodeContent;
