a  #!/bin/sh
# Railway startup script with volume permission handling

echo "🚀 Starting Study Tracker..."
echo "📁 Checking /app/data directory..."

# Create /app/data if it doesn't exist (in case volume isn't mounted)
mkdir -p /app/data

# Check if we can write to /app/data
if [ -w /app/data ]; then
  echo "✅ /app/data is writable"
else
  echo "⚠️  /app/data is not writable"
fi

# List permissions
ls -ld /app/data

# Start the server
echo "🚀 Starting server..."
exec node server/index.js
