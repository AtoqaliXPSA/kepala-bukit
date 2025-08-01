#!/bin/bash

echo "You are about to push changes to GitHub!"
echo "Do you want to continue? (y/n)"
read answer

if [[ "$answer" != "y" && "$answer" != "Y" ]]; then
    echo "[CANCEL] Push aborted."
    exit 1
fi

# Add all changes
git add .

# Ask for commit message
echo "Enter commit message: "
read commitMsg

# Default message if empty
if [[ -z "$commitMsg" ]]; then
    commitMsg="Auto update $(date -u)"
fi

# Commit and push
git commit -m "$commitMsg"
git push origin main

echo "[DONE] Push completed!!!"