const LETTER_FX = ['rise', 'float', 'pop'];

/** Nama mempelai dengan efek teks sesuai template. */
export default function Names({ text, fx }) {
  if (!LETTER_FX.includes(fx)) {
    return (
      <h2 className="inv-names" data-fx={fx} aria-label={text}>
        <span aria-hidden="true">{text}</span>
      </h2>
    );
  }
  return (
    <h2 className="inv-names" data-fx={fx} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden="true" className="ltr" style={{ '--i': i }}>
          {ch === ' ' ? '\u00a0' : ch}
        </span>
      ))}
    </h2>
  );
}
