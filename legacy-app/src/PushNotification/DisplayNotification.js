// import notifee, { AndroidImportance } from "@notifee/react-native";

// export const onDisplayNotification = async (title, body) => {
//   // Request permission for notifications (only ask once)
//   const permissionGranted = await notifee.requestPermission();

//   if (permissionGranted) {
//     // Create a channel (required for Android)
//     const channelId = await notifee.createChannel({
//       id: "default",
//       name: "Default Channel",
//       sound: "default",
//       importance: AndroidImportance.HIGH,
//     });

//     // Display a notification
//     await notifee.displayNotification({
//       title: title,
//       body: body,
//       android: {
//         channelId,
//         sound: "sound",
//         pressAction: {
//           id: "default", // Ensures the app opens when the notification is tapped
//         },
//       },
//       ios: {
//         // iOS specific notification options
//         sound: "sound.wav",
//         badge: 1, // Example to set badge number (optional)
//       },
//     });
//   } else {
//     console.log("Notification permission not granted");
//   }
// };

// export const intitialnotification = async () => {
//   // Request permission for notifications (only ask once)
//   const permissionGranted = await notifee.requestPermission();

//   if (permissionGranted) {
//     // Create a channel (required for Android)
//     const channelId = await notifee.createChannel({
//       id: "default",
//       name: "Default Channel",
//       sound: "default",
//       importance: AndroidImportance.HIGH,
//     });

//     // Display a welcome notification
//     await notifee.displayNotification({
//       title: "Welcome to the app",
//       body: "This is the first notification",
//       android: {
//         channelId,
//         pressAction: {
//           id: "default", // Ensures the app opens when the notification is tapped
//         },
//       },
//       ios: {
//         // iOS specific notification options
//         sound: "default",
//         badge: 1, // Example to set badge number (optional)
//       },
//     });
//   } else {
//     console.log("Notification permission not granted");
//   }
// };

// import notifee, { AndroidImportance } from "@notifee/react-native";

// export const onDisplayNotification = async (title, body, data = {}) => {
//   // Request permission for notifications (only ask once)
//   const permissionGranted = await notifee.requestPermission();

//   if (permissionGranted) {
//     // Create a channel (required for Android)
//     const channelId = await notifee.createChannel({
//       id: "default",
//       name: "Default Channel",
//       sound: "default",
//       importance: AndroidImportance.HIGH,
//     });

//     // Display a notification with data
//     await notifee.displayNotification({
//       title: title || "No Title",
//       body: body || "No Body",
//       data: data, // Attach the notification data for tap handling
//       android: {
//         channelId,
//         sound: "default",
//         pressAction: {
//           id: "default", // Ensures the app opens when the notification is tapped
//         },
//       },
//       ios: {
//         sound: "sound.wav",
//         badge: 1, // Example to set badge number (optional)
//       },
//     });
//   } else {
//     console.log("Notification permission not granted");
//   }
// };

// export const intitialnotification = async () => {
//   // Request permission for notifications (only ask once)
//   const permissionGranted = await notifee.requestPermission();

//   if (permissionGranted) {
//     // Create a channel (required for Android)
//     const channelId = await notifee.createChannel({
//       id: "default",
//       name: "Default Channel",
//       sound: "default",
//       importance: AndroidImportance.HIGH,
//     });

//     // Display a welcome notification
//     await notifee.displayNotification({
//       title: "Welcome to the app",
//       body: "This is the first notification",
//       data: { page: "HOME" }, // Example data for navigation
//       android: {
//         channelId,
//         sound: "default",
//         pressAction: {
//           id: "default", // Ensures the app opens when the notification is tapped
//         },
//       },
//       ios: {
//         sound: "default",
//         badge: 1, // Example to set badge number (optional)
//       },
//     });
//   } else {
//     console.log("Notification permission not granted");
//   }
// };

import notifee, { AndroidImportance } from "@notifee/react-native";

export const onDisplayNotification = async (title, body, data = {}) => {
  // Request permission for notifications (only ask once)
  const permissionGranted = await notifee.requestPermission();

  if (permissionGranted) {
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
      sound: "default",
      importance: AndroidImportance.HIGH,
    });

    // Display a notification with data
    await notifee.displayNotification({
      title: title || "No Title",
      body: body || "No Body",
      data: data, // Attach the notification data for tap handling
      android: {
        channelId,
        sound: "default",
        pressAction: {
          id: "default", // Ensures the app opens when the notification is tapped
        },
      },
      ios: {
        sound: "sound.wav",
        badge: 1, // Example to set badge number (optional)
      },
    });
  } else {
  }
};

export const intitialnotification = async () => {
  // Request permission for notifications (only ask once)
  const permissionGranted = await notifee.requestPermission();

  if (permissionGranted) {
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
      sound: "default",
      importance: AndroidImportance.HIGH,
    });

    // Display a welcome notification with sample data
    await notifee.displayNotification({
      title: "Welcome to the app",
      body: "This is the first notification",
      data: { page: "HOME" }, // Example data for navigation
      android: {
        channelId,
        sound: "default",
        pressAction: {
          id: "default", // Ensures the app opens when the notification is tapped
        },
      },
      ios: {
        sound: "default",
        badge: 1, // Example to set badge number (optional)
      },
    });
  } else {
  }
};
