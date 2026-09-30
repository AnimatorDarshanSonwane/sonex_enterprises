import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from "fs";
import path from "path";

const firebaseConfig = {
  apiKey: "AIzaSyC7DlkRy2Z8i8KNDC5eJix9S7n1thNZGBQ",
  authDomain: "sonex-enterprices.firebaseapp.com",
  projectId: "sonex-enterprices",
  storageBucket: "sonex-enterprices.firebasestorage.app",
  messagingSenderId: "394646360871",
  appId: "1:394646360871:web:5a76c1255efb8ed5904f02",
  measurementId: "G-HZCQ5X7JHR"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const VIDEO_MAPPINGS = [
  { file: "01_Character Turnaround_L.mp4", dressId: "dress-1", size: "L", primary: true },
  { file: "02_Character Turnaround_L.mp4", dressId: "dress-2", size: "L", primary: true },
  { file: "03_Character Turnaround_XL.mp4", dressId: "dress-3", size: "XL", primary: true },
  { file: "04_Character Turnaround_XL.mp4", dressId: "dress-4", size: "XL", primary: true },
  { file: "05_Character Turnaround_XL.mp4", dressId: "dress-5", size: "XL", primary: true },
  { file: "06_Character Turnaround_XL.mp4", dressId: "dress-6", size: "XL", primary: true },
  { file: "07_Character Turnaround_XL.mp4", dressId: "dress-7", size: "XL", primary: true },
  { file: "08_Character Turnaround_XXL.mp4", dressId: "dress-8", size: "XXL", primary: true },
  { file: "09_Character Turnaround_XXXL.mp4", dressId: "dress-9", size: "XXXL", primary: true },
  { file: "10_Character Turnaround_XL.mp4", dressId: "dress-10", size: "XL", primary: true }
];

async function uploadAll() {
  const mockupDir = path.resolve("../../../preview_mockup");
  const manifest = {};

  console.log("Starting Firebase Storage Batch Upload for 10 Turnaround Videos...");

  for (const item of VIDEO_MAPPINGS) {
    const filePath = path.join(mockupDir, item.file);
    if (!fs.existsSync(filePath)) {
      console.warn("File missing:", filePath);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const storagePath = `turnaround_videos/${item.file}`;
    const storageRef = ref(storage, storagePath);

    console.log(`Uploading ${item.file} (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB) for ${item.dressId} [Size ${item.size}]...`);

    const snapshot = await uploadBytes(storageRef, fileBuffer, {
      contentType: "video/mp4",
      customMetadata: {
        dressId: item.dressId,
        size: item.size,
        uploadedAt: new Date().toISOString()
      }
    });

    const downloadURL = await getDownloadURL(storageRef);
    console.log(`✓ ${item.file} -> ${downloadURL}`);

    manifest[item.file] = {
      filename: item.file,
      dressId: item.dressId,
      size: item.size,
      firebaseStorageUrl: downloadURL,
      localUrl: `/videos/${encodeURIComponent(item.file)}`,
      fileSize: fileBuffer.length
    };
  }

  // Write manifest to client and admin constants
  const clientOutPath = path.resolve("src/constants/videoManifest.json");
  const adminOutPath = path.resolve("../../admin/frontend/src/constants/videoManifest.json");

  fs.writeFileSync(clientOutPath, JSON.stringify(manifest, null, 2));
  try {
    fs.writeFileSync(adminOutPath, JSON.stringify(manifest, null, 2));
  } catch (e) {
    console.warn("Could not write adminOutPath directly, skipping:", e.message);
  }

  console.log("Video Manifest written successfully to:");
  console.log("  -", clientOutPath);
  console.log("  -", adminOutPath);
}

uploadAll().catch(console.error);
