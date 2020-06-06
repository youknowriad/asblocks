export const config = {
  firebase: {
    apiKey: "${{ secrets.FIREBASE_API_KEY }}",
    databaseURL: "${{ secrets.FIREBASE_DATABASE_URL }}",
    projectId: "${{ secrets.FIREBASE_PROJECT_URL }}",
    messagingSenderId: "${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}",
    appId: "${{ secrets.FIREBASE_APP_ID }}",
    measurementId: "${{ secrets.FIREBASE_MEASUREMENT_ID }}",
  },
};
