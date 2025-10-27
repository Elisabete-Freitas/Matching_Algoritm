import OneSignal from "react-onesignal";
import { URL } from "../../config";

export default async function runOneSignal() {
  console.log("running onesignal");

  // Initialize OneSignal
  await OneSignal.init({
    appId: "996ebccb-3084-4d97-9cd3-a7fc2ed02537",
    allowLocalhostAsSecureOrigin: true,
    welcomeNotification: {
      disable: false,
    },
  });

  // Check if the user is already subscribed
  const subscription = await OneSignal.User.PushSubscription.optedIn;

  if (subscription && subscription.id) {
    console.log(`User already subscribed with ID: ${subscription.id}`);
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.id) {
      // Add or update tag if the user is subscribed
      await OneSignal.User.addTag(user.role, user.id);
      console.log(`Tag added: ${user.role}=${user.id}`);
    }
  } else {
    console.log("User is not subscribed. Prompting for subscription.");
    // Prompt user to subscribe if not already subscribed
    await OneSignal.Slidedown.promptPush();
  }
}
