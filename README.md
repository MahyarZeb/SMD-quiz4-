# OTP Phone Verification

An Expo and React Native mobile application that verifies phone numbers with Firebase
Authentication. Users enter an international phone number, receive a one-time password over SMS,
and confirm the code in the app.

## Run the app

1. Install dependencies:

   ```bash
   npm install
   ```

2. Enable **Phone** in Firebase Console under Authentication > Sign-in method.

3. Confirm that `google-services.json` belongs to the Android application id configured in
   `app.json`.

4. Build and start the native Android app (Firebase Phone Auth requires a development build):

   ```bash
   npx expo run:android
   ```

Enter a phone number in international format, such as `+923001234567`. Firebase sends the SMS
and the app verifies the six-digit code. For development, Firebase test phone numbers can be
configured in the Firebase Console to avoid sending real SMS messages.

## Submission evidence

Capture the following sequence on a physical Android device or development build:

1. Phone number screen with the number entered.
2. SMS inbox showing the received Firebase OTP.
3. OTP screen with the code entered.
4. Successful “Phone verified” screen.
