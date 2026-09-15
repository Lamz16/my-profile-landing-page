/**
 * Utility to compress and convert any uploaded image to WebP format in the browser.
 */
export async function compressAndConvertToWebp(
  file: File,
  maxWidth: number = 1600,
  maxHeight: number = 1600,
  quality: number = 0.8
): Promise<{ base64Webp: string; blobWebp: Blob; fileName: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Scale down proportionally if larger than maximum dimensions
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D Context not supported'));
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP Data URL
      const base64Webp = canvas.toDataURL('image/webp', quality);

      // Convert to WebP Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
            const fileName = `${originalName}_${Date.now()}.webp`;
            resolve({ base64Webp, blobWebp: blob, fileName });
          } else {
            reject(new Error('Gagal mengonversi gambar ke WebP'));
          }
        },
        'image/webp',
        quality
      );
    };

    reader.readAsDataURL(file);
  });
}
