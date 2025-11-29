// Run this in browser console to clear all user data
for (let i = localStorage.length - 1; i >= 0; i--) {
  const key = localStorage.key(i);
  if (key && key.startsWith('user_')) {
    localStorage.removeItem(key);
    console.log('Removed:', key);
  }
}
console.log('All user data cleared!');
