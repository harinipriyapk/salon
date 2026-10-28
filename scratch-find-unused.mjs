import fs from 'fs';
import path from 'path';

const files = [
  'client/src/components/BookingSection.jsx',
  'client/src/components/EntrySplash.jsx',
  'client/src/components/Navbar.jsx',
  'client/src/components/ReviewsSection.jsx',
  'client/src/components/UserDashboard.jsx',
  'client/src/components/AdminDashboard.jsx',
  'client/src/components/AuthModal.jsx',
  'client/src/App.jsx',
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  console.log(`\n=== Checking ${file} ===`);

  // Find all named imports from lucide-react
  const lucideMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
  if (lucideMatch) {
    const importedIcons = lucideMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    const unusedIcons = [];
    for (const icon of importedIcons) {
      // Count occurrences in rest of content
      const regex = new RegExp(`\\b${icon}\\b`, 'g');
      const matches = content.match(regex);
      if (!matches || matches.length <= 1) {
        unusedIcons.push(icon);
      }
    }
    if (unusedIcons.length > 0) {
      console.log('Unused Lucide icons:', unusedIcons);
    }
  }

  // Check unused React import
  if (content.includes('import React from "react";') || content.includes("import React from 'react';")) {
    const regex = /\bReact\b/g;
    const matches = content.match(regex);
    if (!matches || matches.length <= 1) {
      console.log('Unused React import found!');
    }
  }
}
