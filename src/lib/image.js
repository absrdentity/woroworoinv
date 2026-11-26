/**
 * Kompres foto di browser sebelum diunggah: ukuran maksimum sisi terpanjang + kualitas JPEG
 * diturunkan bertahap sampai di bawah `maxBytes`. Hasil: data URL JPEG.
 */
async function load(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      /* lanjut ke <img> */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Berkas tidak bisa dibaca sebagai gambar.'));
    };
    img.src = url;
  });
}

export async function compressImage(file, { max = 1000, maxBytes = 190000 } = {}) {
  if (!file || !/^image\//.test(file.type || '')) throw new Error('Pilih berkas gambar (JPG, PNG, atau WebP).');
  if (file.size > 25 * 1024 * 1024) throw new Error('Berkas terlalu besar (maks. 25 MB).');
  const bmp = await load(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  let w = Math.max(1, Math.round(bmp.width * scale));
  let h = Math.max(1, Math.round(bmp.height * scale));
  let q = 0.82;
  const canvas = document.createElement('canvas');
  for (let i = 0; i < 10; i += 1) {
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    const url = canvas.toDataURL('image/jpeg', q);
    if ((url.length - 23) * 0.75 <= maxBytes) return url;
    if (q > 0.55) q -= 0.08;
    else {
      w = Math.round(w * 0.85);
      h = Math.round(h * 0.85);
    }
  }
  throw new Error('Gambar terlalu rumit untuk dikompres. Coba foto lain.');
}
