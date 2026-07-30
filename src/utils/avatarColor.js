// Har naam ke liye ek consistent color pair (background + text) deta hai
// taaki avatars sab ek jaise dikhne ki bajaye alag-alag dikhein

const PALETTE = [
  { bg: "rgba(124, 111, 240, 0.16)", fg: "#a79bff" }, // violet
  { bg: "rgba(255, 184, 107, 0.16)", fg: "#ffb86b" }, // amber
  { bg: "rgba(94, 200, 170, 0.16)", fg: "#5ec8aa" }, // teal
  { bg: "rgba(240, 98, 148, 0.16)", fg: "#f06294" }, // pink
  { bg: "rgba(98, 170, 240, 0.16)", fg: "#62aaf0" }, // blue
  { bg: "rgba(226, 200, 90, 0.16)", fg: "#e2c85a" }, // gold
  { bg: "rgba(150, 130, 240, 0.16)", fg: "#a08cf5" }, // indigo
  { bg: "rgba(240, 140, 98, 0.16)", fg: "#f08c62" }, // coral
];

export function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % PALETTE.length;
  return PALETTE[idx];
}
