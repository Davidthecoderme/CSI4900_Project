# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```
these packages need to be installed first: 
* npm install axios expo-image-picker expo-router firebase   ,
* npm install @aws-sdk/client-s3 ,
* npm install react-native-get-random-values,
* expo install expo-linear-gradient ,
* npm install @expo/vector-icons ,
* npm install @react-native-picker/picker
* npm install react-native-keyboard-aware-scroll-view

backend steps: 
* make the terminal as bash, then make sure it is under you path location: 
* temporary shut down firewall in order to run the program on mobile: netsh advfirewall set allprofiles state off (run this at CMD under administration )
* in the terminal type : source venv/Scripts/activate 
* then type : pip install -r requirements.txt
$ then type: pip install tensorflow opencv-python numpy
* then type : uvicorn main:app --host 0.0.0.0 --port 8000 --reload 
