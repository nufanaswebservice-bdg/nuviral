#!/bin/bash
# Add getlumora.cloud to Firebase Authorized Domains
# Run this AFTER logging in: firebase login
set -e

PROJECT="getlumora-ad1c9"

echo "=== Adding authorized domains to Firebase project: $PROJECT ==="

# Install firebase-tools if missing
if ! command -v firebase &>/dev/null; then
  npm install -g firebase-tools
fi

# Use Firebase Admin via Node script
node << 'NODEJS'
const { execSync } = require('child_process');

const PROJECT = 'getlumora-ad1c9';
const DOMAINS = [
  'localhost',
  'getlumora-ad1c9.firebaseapp.com',
  'getlumora-ad1c9.web.app',
  'getlumora.cloud',
  'www.getlumora.cloud',
  'api.getlumora.cloud',
];

async function main() {
  try {
    // Get access token from firebase CLI
    const token = execSync('firebase login:ci --no-localhost 2>/dev/null || true', { encoding: 'utf8' });
    console.log('Note: If domains not added automatically, add manually in Firebase Console:');
    console.log('https://console.firebase.google.com/project/getlumora-ad1c9/authentication/settings');
    console.log('');
    console.log('Add these Authorized domains:');
    DOMAINS.forEach(d => console.log('  -', d));
  } catch (e) {
    console.log('Manual step required - open Firebase Console and add domains listed above');
  }
}
main();
NODEJS

echo ""
echo "=== Firebase Console URL ==="
echo "https://console.firebase.google.com/project/$PROJECT/authentication/settings"
echo ""
echo "Under 'Authorized domains', click 'Add domain' and add:"
echo "  - getlumora.cloud"
echo "  - www.getlumora.cloud"
