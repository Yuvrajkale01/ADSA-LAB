/* ============================================
   AlgorithmCodePanel — Read-only code display
   synchronized with animation steps.
   
   NOT an editor. Strictly read-only <pre>/<code>.
   Matches reference screenshot: clean dark card,
   language switcher, TTS, replay, copy, and
   rounded pill active-line highlight.
   ============================================ */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Volume2, Copy, Check, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import './AlgorithmCodePanel.css';

// ---- Types ----
export type CodeLanguage = 'java' | 'python' | 'cpp' | 'javascript';

export interface AlgorithmCodeData {
  /** Short, exam-style core algorithm code per language */
  code: Partial<Record<CodeLanguage, string>>;
  /** Map operation names or state IDs → 0-indexed line numbers to highlight */
  stepMap?: Record<string, number[]>;
  /** Direct line map for pseudocodeLine indices */
  lineMap?: Record<number, number>;
}

interface Props {
  /** The algorithm code data bundle */
  codeData: AlgorithmCodeData;
  /** Current operation name from the animation state */
  currentOperation?: string | null;
  /** Direct pseudocode line override (from AlgorithmState.pseudocodeLine) */
  highlightedLine?: number | null;
  /** Default language */
  defaultLanguage?: CodeLanguage;
  /** Optional title or algorithm label */
  title?: string;
  /** Whether to show gutter line numbers (defaults to false to match reference screenshot) */
  showLineNumbers?: boolean;
  /** Optional replay / reset handler */
  onReset?: () => void;
}

// ---- Minimal robust syntax colorizer (no external runtime dependencies) ----
const JAVA_KEYWORDS = /\b(void|int|boolean|return|if|else|while|for|new|null|true|false|this|class|public|private|protected|static|final|String|break|continue|throw|throws|try|catch)\b/g;
const PYTHON_KEYWORDS = /\b(def|return|if|elif|else|while|for|in|not|and|or|None|True|False|class|self|import|from|pass|break|continue|raise|try|except|lambda|with|as|yield)\b/g;
const CPP_KEYWORDS = /\b(void|int|bool|return|if|else|while|for|new|nullptr|true|false|this|class|public|private|protected|template|typename|const|auto|struct|using|namespace|std|vector|string|break|continue|throw|try|catch)\b/g;
const JS_KEYWORDS = /\b(function|const|let|var|return|if|else|while|for|of|in|new|null|undefined|true|false|this|class|throw|try|catch|async|await|break|continue)\b/g;

function tokenize(code: string, lang: CodeLanguage): React.ReactNode[] {
  const keywordRegex = lang === 'java' ? JAVA_KEYWORDS
    : lang === 'python' ? PYTHON_KEYWORDS
    : lang === 'cpp' ? CPP_KEYWORDS
    : JS_KEYWORDS;

  const parts: React.ReactNode[] = [];
  let key = 0;

  // Process comments, strings, numbers
  const tokenRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\/\/.*$|\/\*[\s\S]*?\*\/|\b\d+\b)/gm;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      const before = code.slice(lastIndex, match.index);
      parts.push(...colorizeKeywords(before, keywordRegex, key));
      key += 100;
    }

    const token = match[0];
    if (token.startsWith('//') || token.startsWith('/*')) {
      parts.push(<span key={key++} className="acp-comment">{token}</span>);
    } else if (token.startsWith('"') || token.startsWith("'")) {
      parts.push(<span key={key++} className="acp-string">{token}</span>);
    } else if (/^\d+$/.test(token)) {
      parts.push(<span key={key++} className="acp-number">{token}</span>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < code.length) {
    parts.push(...colorizeKeywords(code.slice(lastIndex), keywordRegex, key));
  }

  return parts.length > 0 ? parts : [code];
}

function colorizeKeywords(text: string, regex: RegExp, startKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = startKey;
  let lastIdx = 0;
  regex.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      const before = text.slice(lastIdx, m.index);
      parts.push(<span key={key++}>{colorMethods(before, key)}</span>);
      key += 10;
    }
    parts.push(<span key={key++} className="acp-keyword">{m[0]}</span>);
    lastIdx = m.index + m[0].length;
  }

  if (lastIdx < text.length) {
    const rest = text.slice(lastIdx);
    parts.push(<span key={key++}>{colorMethods(rest, key)}</span>);
  }

  return parts;
}

function colorMethods(text: string, startKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = startKey;
  const methodRegex = /(\b[a-zA-Z_]\w*)(\s*\()/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = methodRegex.exec(text)) !== null) {
    if (m.index > lastIdx) {
      parts.push(<span key={key++}>{text.slice(lastIdx, m.index)}</span>);
    }
    parts.push(<span key={key++} className="acp-method">{m[1]}</span>);
    parts.push(<span key={key++}>{m[2]}</span>);
    lastIdx = m.index + m[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIdx)}</span>);
  }

  return parts.length > 0 ? parts : [<span key={key}>{text}</span>];
}

// ---- Language labels ----
const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  java: 'Java',
  python: 'Python',
  cpp: 'C++',
  javascript: 'JavaScript',
};

// ---- Component ----
export const AlgorithmCodePanel: React.FC<Props> = ({
  codeData,
  currentOperation,
  highlightedLine,
  defaultLanguage = 'java',
  showLineNumbers = false,
  onReset,
}) => {
  const availableLanguages = (Object.keys(codeData.code) as CodeLanguage[]).filter(
    k => Boolean(codeData.code[k])
  );
  const [language, setLanguage] = useState<CodeLanguage>(
    availableLanguages.includes(defaultLanguage) ? defaultLanguage : (availableLanguages[0] || 'java')
  );
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  const activeLanguage = availableLanguages.includes(language) ? language : (availableLanguages[0] || 'java');
  const rawCode = codeData.code[activeLanguage] || '';
  const lines = rawCode.split('\n');

  // Determine which lines to highlight
  const activeLines = useMemo(() => {
    const set = new Set<number>();
    if (highlightedLine !== null && highlightedLine !== undefined) {
      if (codeData.lineMap && codeData.lineMap[highlightedLine] !== undefined) {
        set.add(codeData.lineMap[highlightedLine]);
      } else {
        set.add(highlightedLine);
      }
    } else if (currentOperation && codeData.stepMap && codeData.stepMap[currentOperation]) {
      codeData.stepMap[currentOperation].forEach(l => set.add(l));
    }
    return set;
  }, [highlightedLine, currentOperation, codeData]);

  // Auto-scroll to keep active line visible and centered
  useEffect(() => {
    if (activeLineRef.current && codeRef.current) {
      const container = codeRef.current;
      const line = activeLineRef.current;
      const containerRect = container.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();

      if (lineRect.top < containerRect.top + 20 || lineRect.bottom > containerRect.bottom - 20) {
        line.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [highlightedLine, currentOperation]);

  // Copy code handler
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = rawCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [rawCode]);

  // TTS handler: reads the active code line or algorithm snippet aloud
  const handleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const activeArray: number[] = Array.from(activeLines);
    const firstActiveIdx = activeArray.length > 0 ? activeArray[0] : -1;
    const textToRead = firstActiveIdx >= 0 && lines[firstActiveIdx]
      ? lines[firstActiveIdx].trim()
      : `Algorithm logic in ${LANGUAGE_LABELS[activeLanguage]}`;

    if (textToRead) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [activeLines, lines, activeLanguage, speaking]);

  return (
    <div className={`acp ${expanded ? 'acp-expanded' : ''}`} role="region" aria-label="Synchronized Algorithm Code">
      {/* Top Header Bar */}
      <div className="acp-header">
        <div className="acp-header-left">
          <select
            className="acp-lang-select"
            value={activeLanguage}
            onChange={e => setLanguage(e.target.value as CodeLanguage)}
            aria-label="Select Code Language"
          >
            {availableLanguages.map(lang => (
              <option key={lang} value={lang}>{LANGUAGE_LABELS[lang]}</option>
            ))}
          </select>

          {'speechSynthesis' in window && (
            <button
              className={`acp-icon-btn ${speaking ? 'acp-icon-btn-active' : ''}`}
              onClick={handleSpeak}
              title={speaking ? 'Stop audio' : 'Listen to active step'}
              aria-label="Listen to active step"
            >
              <Volume2 size={15} />
            </button>
          )}
        </div>

        <div className="acp-header-right">
          <button
            className="acp-icon-btn"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Compress view' : 'Expand view (larger display)'}
            aria-label={expanded ? 'Compress view' : 'Expand view'}
          >
            {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {onReset && (
            <button
              className="acp-icon-btn"
              onClick={onReset}
              title="Reset code / animation"
              aria-label="Reset code / animation"
            >
              <RotateCcw size={15} />
            </button>
          )}

          <button
            className={`acp-icon-btn ${copied ? 'acp-icon-btn-success' : ''}`}
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard' : 'Copy code'}
            aria-label="Copy code"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
      </div>

      {/* Code Body — Strictly Read-Only */}
      <div className="acp-body" ref={codeRef}>
        <pre className="acp-pre" tabIndex={0} aria-readonly="true">
          <code className="acp-code">
            {lines.map((line, i) => {
              const isActive = activeLines.has(i);
              return (
                <div
                  key={i}
                  ref={isActive ? activeLineRef : undefined}
                  className={`acp-line ${isActive ? 'acp-line-active' : ''}`}
                >
                  {showLineNumbers && (
                    <span className="acp-line-number" aria-hidden="true">{i + 1}</span>
                  )}
                  <span className="acp-line-content">
                    {line.trim() === '' ? '\u00A0' : tokenize(line, language)}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};
