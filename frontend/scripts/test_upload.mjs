import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from "fs";

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

async function testUpload() {
  console.log("Connecting to Firebase Storage bucket...");
  try {
    const videoBuffer = fs.readFileSync("../../../preview_mockup/01_Character Turnaround_L.mp4");
    const storageRef = ref(storage, "turnaround_videos/01_Character Turnaround_L.mp4");
    console.log("Uploading 01_Character Turnaround_L.mp4 (" + videoBuffer.length + " bytes)...");
    const snapshot = await uploadBytes(storageRef, videoBuffer, {
      contentType: "video/mp4",
      customMetadata: { dressId: "dress-1", size: "L" }
    });
    console.log("Uploaded successfully!", snapshot.metadata.fullPath);
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL:", downloadURL);
  } catch (err) {
    console.error("Upload error:", err.code, err.message);
  }
}

testUpload();
