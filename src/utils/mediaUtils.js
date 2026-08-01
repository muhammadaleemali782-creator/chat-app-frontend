// Chahe photo kitni bhi badi ho, isse bhejne se pehle chhota/compress kar dete hain -
// taaki 2GB RAM phone pe fast chale aur database (free tier) bhi jaldi na bhare.
// User ko size ki chinta nahi karni padti, app khud sambhal leta hai.
export function compressImage(file, maxDim = 1600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Image load nahi hui"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("File read nahi hui"));
    reader.readAsDataURL(file);
  });
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Audio read nahi hua"));
    reader.readAsDataURL(blob);
  });
}
