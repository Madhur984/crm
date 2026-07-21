# Complete Firebase Setup Guide (Free Tier / Spark Plan)

This guide walks you through setting up **Firebase Cloud Firestore** for the Recon Core CRM on the **100% Free Spark Plan**.

---

## 📊 Spark Plan Free Tier Quotas

| Resource | Free Tier Daily / Monthly Allowance |
| :--- | :--- |
| **Stored Data** | 1 GiB total |
| **Document Reads** | 50,000 / day |
| **Document Writes** | 20,000 / day |
| **Document Deletes** | 20,000 / day |
| **Network Outbound** | 10 GiB / month |

---

## Step 1: Create a Free Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** (or **Create a project**).
3. Name your project (e.g. `recon-core-crm`).
4. (Optional) Disable or Enable Google Analytics according to your preference (Google Analytics is free).
5. Click **Create Project** and wait for provisioning to complete.

---

## Step 2: Create Cloud Firestore Database

1. In the left navigation menu, go to **Build** → **Firestore Database**.
2. Click **Create Database**.
3. Choose a location closest to your users (e.g. `us-central1` or `asia-south1`).
4. Under security rules, choose **Start in production mode** (we will load custom rules in Step 6).
5. Click **Create**.

---

## Step 3: Get Backend Admin Credentials (`server`)

To allow the Node/Express backend to read and write to Firestore:

1. Click the **Gear icon (⚙️)** next to *Project Overview* in the left sidebar and select **Project settings**.
2. Go to the **Service accounts** tab.
3. Click **Generate new private key**.
4. Download the `.json` key file.
5. Rename the downloaded file to `serviceAccountKey.json` and place it in the `server/` directory:
   ```
   crm/
   └── server/
       └── serviceAccountKey.json
   ```
   *(Note: `serviceAccountKey.json` is already included in `server/.gitignore` to prevent committing secrets).*

Alternatively, you can set the environment variable in `server/.env`:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
# OR paste the raw JSON string:
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

---

## Step 4: Get Frontend Web Credentials (`client`)

To allow the Vite React frontend to connect to Firebase:

1. In **Project settings** (Gear icon ⚙️), scroll down to **Your apps**.
2. Click the **Web icon (`</>`)** to add a web app.
3. Register app with nickname `recon-core-web`. Uncheck Firebase Hosting for now.
4. Copy the `firebaseConfig` object values.
5. Create or edit `client/.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

---

## Step 5: Seed the Firestore Database

Run the automated seeder script from the `crm/` directory to create all initial demo data (organizations, users, projects, BOM lines, documents, activities, and support tickets):

```bash
npm --prefix server run db:seed:firebase
```

This populates the following collections:
- `organizations/`
- `users/`
- `projects/`
  - `projects/{projectId}/bom`
  - `projects/{projectId}/clarifications`
  - `projects/{projectId}/invoices`
  - `projects/{projectId}/documents`
  - `projects/{projectId}/activities`
- `tickets/`
- `messages/`

---

## Step 6: Deploy Security Rules & Indexes

### Firestore Security Rules (`firestore.rules`)
In Firebase Console → **Firestore Database** → **Rules**, paste the contents of [`server/firestore.rules`](file:///d:/Hokage%20X%20Pirate%20king/crm/server/firestore.rules) and click **Publish**.

### Composite Indexes (`firestore.indexes.json`)
If you perform complex queries on nested subcollections, Firebase Console will output a link to auto-create any missing index when required, or you can deploy using Firebase CLI:
```bash
firebase deploy --only firestore
```

---

## Step 7: Verification

Run the application locally to test the Firebase connection:

```bash
# In the crm/ directory:
npm run dev
```

Open **http://localhost:5173** and log in with:
- **Email:** `demo@reconcore.app`
- **Password:** `recon1234`
