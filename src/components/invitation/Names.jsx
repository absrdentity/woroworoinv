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
  // huruf dikelompokkan per kata agar baris tidak terputus di tengah kata
  let i = 0;
  return (
    <h2 className="inv-names" data-fx={fx} aria-label={text}>
      {text.split(' ').map((word, w, arr) => (
        <span key={w} aria-hidden="true" style={{ whiteSpace: 'nowrap' }}>
          {Array.from(word).map((ch) => (
            <span key={i} className="ltr" style={{ '--i': i++ }}>
              {ch}
            </span>
          ))}
          {w < arr.length - 1 ? ' ' : ''}
        </span>
      ))}
    </h2>
  );
}
