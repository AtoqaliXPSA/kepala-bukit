if [ "$RENDER" != "true" ]; then
  git config user.name "AtoqaliXPSA"
  git config user.email "hisyamsafwan60@gmail.com"
  git add .
  git commit -m "Auto update: $(date -u)"
  git push origin main
else
  echo "🚫 Skipping push.sh on Render"
fi