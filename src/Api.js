import axios from "axios";
import { Platform } from "react-native";
import { io } from "socket.io-client";
import NetInfo from "@react-native-community/netinfo";

// export const apiServerUrl = "http://192.168.1.83:2193/api/v1"; // office

// export const apiServerUrl = "https://6f58fd9614ff.ngrok-free.app/api/v1"; // production
export const apiServerUrl = "https://seabuddyapi.seekware.in/api/v1";
// export const apiServerUrl = "https://api.seabuddy.co/api/v1";


// export const SocketApiUri = "https://api.seabuddy.co/";
// export const SocketApiUriV1 = "http://192.168.0.235:2193";

export const SocketApiUri = "https://seabuddyapi.seekware.in";
// export const SocketApiUri = "https://6f58fd9614ff.ngrok-free.app";//office?

export async function GetDataFromApiServerAsync(_ApiMethod) {
  try {
    const response = await fetch(apiServerUrl + _ApiMethod);
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error(error);
  }
}

export const apiCall = async (
  url,
  method = "GET",
  body = null,
  additionalHeaders = { "Content-Type": "application/json" }
) => {
  try {
    // Configure the Axios request
    const config = {
      url,
      method,
      headers: additionalHeaders,
      data: body, // Axios handles JSON serialization automatically
    };

    // Make the API call
    const response = await axios(config);

    // Return the parsed response data
    return response.data;
  } catch (error) {
    console.error("Error making API call:a", error.response.data);

    // Handle errors
    if (error.response) {
      // Server responded with a status code outside 2xx
      throw new Error(
        `HTTP error! status: ${error.response.status}, message: ${error.response.data.message || "Unknown error"
        }`
      );
    } else if (error.request) {
      // Request was made but no response was received
      throw new Error("Network error! No response received.");
    } else {
      // Something else caused the error
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
};

export const getApiLevel = () => {

  if (Platform.OS === "android") {
    // console.log("Android API Level:", Platform.Version);
    return Platform.Version;
  }
};

// export const apiCallWithToken = async (
//   url,
//   method = "GET",
//   body = null,
//   token = null,
//   additionalHeaders = { "Content-Type": "application/json" }
// ) => {
//   try {
//     // Add the token to headers if provided
//     const headers = {
//       ...additionalHeaders,
//     };
//     if (token) {
//       headers["authToken"] = token;
//     }

//     // Configure the Axios request
//     const config = {
//       url,
//       method,
//       headers,
//       ...(Platform.OS === "ios" ? { body } : { data: body }),
//     };
//     // Make the API call
//     const response = await axios(config);

//     // Return the parsed response data
//     return response.data;
//   } catch (error) {
//     console.error("Error making API call:b", error.response.data, url);
//     // Handle errors
//     if (error.response) {
//       // Server responded with a status other than 2xx
//       throw new Error(
//         `HTTP error! status: ${error.response.status}, message: ${
//           error.response.data.message || "Unknown error"
//         }`
//       );
//     } else if (error.request) {
//       // Request was made, but no response was received
//       throw new Error("Network error! No response received.");
//     } else {
//       // Something else caused the error
//       throw new Error(`Unexpected error: ${error.message}`);
//     }
//   }
// };

export const apiCallWithToken = async (
  url,
  method = "GET",
  body = null,
  token = null,
  additionalHeaders = { "Content-Type": "application/json" }
) => {
  try {
    // Add the token to headers if provided
    const headers = {
      ...additionalHeaders,
    };
    if (token) {
      headers["authToken"] = token;
    }

    // Configure the Axios request
    const config = {
      url,
      method,
      headers,
      ...(method !== "GET" ? { data: body } : {}), // Only add data for POST, PUT, DELETE
    };


    // Make the API call
    const response = await axios(config);

    // Return the parsed response data
    return response.data;
  } catch (error) {
    console.error("Error making API call: 4", error);

    // Handle errors
    if (error.response) {
      console.log(JSON.stringify(error.response.data));

      throw new Error(
        error.response.data.responseMessage || 'Something Went Wrong. Please Try Again.'

      );
    } else if (error.request) {
      throw new Error("Network error! No response received.");
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
};

export const apiCallWithTokenPost = async (url, token, bodyData) => {
  try {
    const response = await axios.post(url, bodyData, {
      headers: {
        "Content-Type": "application/json",
        authToken: token,
      },
    });

    // Assuming the response data is JSON and needs no further parsing
    return response.data;
  } catch (error) {
    console.error("Error making API call:c", error.response.data);

    // Throw the error to handle it in the calling function
    if (error.response) {
      throw new Error(
        `HTTP error! status: ${error.response.status}, message: ${error.response.data.message || "Unknown error"
        }`
      );
    } else if (error.request) {
      throw new Error("Network error! No response received.");
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
};

export const checkConnected = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};


const api = axios.create();

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 403) {
      if (navigationRef.isReady()) {
        navigationRef.navigate("AuthNav");
      }
    }

    return Promise.reject(error);
  }
);

export const apis = api;


export const formatShipName = (name) => {
  if (!name) return "";

  // Split the name by spaces
  const words = name.split(" ");

  // Process each word
  const formattedWords = words.map((word, index) => {
    // Check if the word is a Roman numeral
    const romanNumeralRegex = /^(I{1,3}|IV|VI{0,3}|IX|X{1,3}|XL|L|XC|C{1,3}|CD|D|CM|M{1,3})$/i;
    if (romanNumeralRegex.test(word)) {
      return word.toUpperCase(); // Fully uppercase for Roman numerals
    }
    // Capitalize first letter for non-Roman-numeral words
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  // Join the words back together
  return formattedWords.join(" ");
};

