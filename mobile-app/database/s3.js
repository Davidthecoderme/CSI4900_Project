import 'react-native-get-random-values'; 
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as FileSystem from 'expo-file-system';
import { AWS_REGION, S3_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_KEY } from "@env";


const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

export const uploadFileToS3 = async (fileUri, userId) => {
  try {
    // 1️⃣ Read file as base64
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    //
    const fileExtension = fileUri.split(".").pop(); 
    const fileName = `uploads/${userId}_${Date.now()}.${fileExtension}`;

    
    const binaryString = atob(fileContent); 
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      Body: byteArray, 
      ContentType: "image/jpeg", 
    };

    await s3Client.send(new PutObjectCommand(params));

    //console.log("succeed:", fileName);
    return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    //console.error("fail:", error);
    throw error; 
  }
};