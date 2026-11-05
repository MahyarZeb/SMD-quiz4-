# OTP Phone Verification

An Expo and React Native Web application that verifies phone numbers with Firebase
Authentication. Users enter an international phone number, receive a one-time password over SMS,
and confirm the code in the browser.

## Firebase setup

This project uses the **Firebase Web SDK**, not native Android Firebase libraries.

1. Open the Firebase Console and select your project.
2. In **Authentication > Sign-in method**, enable the **Phone** provider.
3. In **Project settings > Your apps**, create or select a **Web app** (`</>`).
4. Add `localhost` and the deployed web domain under **Authentication > Settings > Authorized domains**.
5. Copy `.env.example` to `.env.local` and fill in the six values from the Web app config:
   `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, and `appId`.
6. For development, configure Firebase test phone numbers in Authentication settings to avoid
   sending real SMS messages.

If the app shows `auth/configuration-not-found`, verify that the Phone provider is enabled for
the same Firebase project referenced by `projectId` and `authDomain`, then restart Expo with
`npx expo start --web --clear`. An `auth/unauthorized-domain` error means the current browser
host must be added to Firebase Authentication's Authorized domains.

The Firebase Web API key is intended to be shipped to the browser. Do not put service-account
credentials or other private keys in `.env.local`.

## Run the web app

```bash
npm install
npx expo start --web
```

Open the displayed local URL, enter a phone number in international format such as
`+923001234567`, request the SMS, enter the six-digit code, and press **Verify code**.

## Submission evidence

Capture the complete flow for submission:

1. Phone number screen with the number entered.
2. SMS inbox showing the received Firebase OTP.
3. OTP screen with the code entered.
4. Successful “Phone verified” screen.
