type Props = { text: string; by?: 'char' | 'word'; className?: string };

/** Renders text as individually animatable spans while keeping it readable to screen readers. */
export default function Split({ text, by = 'char', className }: Props) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden="true" className="inline-block whitespace-nowrap">
          {by === 'word' ? (
            <span className="word">{word}</span>
          ) : (
            [...word].map((c, ci) => (
              <span key={ci} className="char">
                {c}
              </span>
            ))
          )}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
